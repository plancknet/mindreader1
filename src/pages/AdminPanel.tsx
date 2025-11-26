import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Crown, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Save, Undo } from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserData {
  user_id: string;
  email: string;
  is_premium: boolean;
  subscription_tier: 'FREE' | 'STANDARD' | 'INFLUENCER';
  subscription_status: string;
  plan_confirmed: boolean;
  coupon_code: string | null;
  coupon_generated: boolean;
  premium_type: string | null;
  created_at: string;
  usage_count: number;
  jogo1_count: number;
  jogo2_count: number;
  jogo3_count: number;
  jogo4_count: number;
  last_accessed_at: string | null;
}

interface CouponStats {
  coupon_code: string;
  influencer_id: string;
  influencer_email: string;
  coupon_generated: boolean;
  subscription_status: string;
  total_redemptions: number;
  total_revenue: number;
  last_redeemed_at: string | null;
}

const registrationChartConfig = {
  FREE: {
    label: 'Free',
    color: 'hsl(var(--muted-foreground))',
  },
  STANDARD: {
    label: 'Standard',
    color: 'hsl(var(--primary))',
  },
  INFLUENCER: {
    label: 'Influencer',
    color: 'hsl(var(--secondary))',
  },
};

const normalizeCouponCode = (code?: string | null) => (code?.trim().toUpperCase() ?? '');

const initialUserFilters = {
  email: '',
  tier: 'ALL',
  status: 'ALL',
  confirmed: 'ALL',
  couponCode: '',
  couponGenerated: 'ALL',
  premium: 'ALL',
  premiumType: '',
  usage: '',
  jogo1: '',
  jogo2: '',
  jogo3: '',
  jogo4: '',
  lastAccess: '',
  lastAccessStart: '',
  lastAccessEnd: '',
  createdAt: '',
  createdAtStart: '',
  createdAtEnd: '',
};

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [couponStats, setCouponStats] = useState<CouponStats[]>([]);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('ALL');
  const [couponFilters, setCouponFilters] = useState({
    code: '',
    influencer: '',
    status: 'ALL',
  });
  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const [userSort, setUserSort] = useState<{ column: keyof UserData; direction: 'asc' | 'desc' }>({
    column: 'created_at',
    direction: 'desc',
  });
  const [couponSort, setCouponSort] = useState<{ column: keyof CouponStats; direction: 'asc' | 'desc' }>({
    column: 'coupon_code',
    direction: 'asc',
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserData, setEditingUserData] = useState<Partial<UserData> | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [editedUsers, setEditedUsers] = useState<Record<string, Partial<UserData>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [registrationSeries, setRegistrationSeries] = useState<Array<{ date: string; FREE: number; STANDARD: number; INFLUENCER: number }>>([]);
  const [todayStats, setTodayStats] = useState({
    users: 0,
    standard: 0,
    influencer: 0,
    couponRedemptions: 0,
  });
  const [isMobileChart, setIsMobileChart] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/game-selector');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [adminLoading, isAdmin, navigate, toast]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileChart(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsersData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        email,
        is_premium,
        subscription_tier,
        subscription_status,
        plan_confirmed,
        coupon_code,
        coupon_generated,
        premium_type,
        created_at,
        usage_count,
        jogo1_count,
        jogo2_count,
        jogo3_count,
        jogo4_count,
        last_accessed_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedUsers: UserData[] = (data || []).map((user) => ({
      user_id: user.user_id,
      email: user.email ?? 'Email não disponível',
      is_premium: Boolean(user.is_premium),
      subscription_tier: (user.subscription_tier as UserData['subscription_tier']) ?? 'FREE',
      subscription_status: user.subscription_status ?? 'inactive',
      plan_confirmed: Boolean(user.plan_confirmed),
      coupon_code: user.coupon_code,
      coupon_generated: Boolean(user.coupon_generated),
      premium_type: user.premium_type ?? null,
      created_at: user.created_at,
      usage_count: user.usage_count ?? 0,
      jogo1_count: user.jogo1_count ?? 0,
      jogo2_count: user.jogo2_count ?? 0,
      jogo3_count: user.jogo3_count ?? 0,
      jogo4_count: user.jogo4_count ?? 0,
      last_accessed_at: user.last_accessed_at,
    }));

    setUsers(formattedUsers);
    setRegistrationSeries(generateRegistrationSeries(formattedUsers));
    const todayKey = new Date().toISOString().split('T')[0];
    const todays = formattedUsers.filter(
      (user) => new Date(user.created_at).toISOString().split('T')[0] === todayKey,
    );
    const standardToday = todays.filter((user) => user.subscription_tier === 'STANDARD').length;
    const influencerToday = todays.filter((user) => user.subscription_tier === 'INFLUENCER').length;
    setTodayStats((prev) => ({
      ...prev,
      users: todays.length,
      standard: standardToday,
      influencer: influencerToday,
    }));
  };

  const generateRegistrationSeries = (userList: UserData[]) => {
    const dailyMap = new Map<string, { FREE: number; STANDARD: number; INFLUENCER: number }>();
    userList.forEach((user) => {
      const dateKey = new Date(user.created_at).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { FREE: 0, STANDARD: 0, INFLUENCER: 0 });
      }
      const bucket = dailyMap.get(dateKey)!;
      bucket[user.subscription_tier] = (bucket[user.subscription_tier] ?? 0) + 1;
    });

    return Array.from(dailyMap.keys())
      .sort()
      .map((date) => ({
        date,
        FREE: dailyMap.get(date)?.FREE ?? 0,
        STANDARD: dailyMap.get(date)?.STANDARD ?? 0,
        INFLUENCER: dailyMap.get(date)?.INFLUENCER ?? 0,
      }));
  };

  const fetchCouponData = async () => {
    const { data: influencerCoupons, error: influencerError } = await supabase
      .from('users')
      .select('user_id, email, coupon_code, coupon_generated, subscription_status')
      .not('coupon_code', 'is', null);

    if (influencerError) throw influencerError;

    const { data: redemptions, error: redemptionsError } = await supabase
      .from('coupon_redemptions' as any)
      .select('coupon_code, redeemed_at, amount, influencer_id') as any;

    console.log('[AdminPanel] Raw redemptions from DB:', redemptions);

    if (redemptionsError) throw redemptionsError;

    const userMap = new Map(
      (influencerCoupons || []).map((coupon) => [
        coupon.user_id,
        {
          email: coupon.email ?? 'Email não disponível',
          coupon_code: normalizeCouponCode(coupon.coupon_code),
          coupon_generated: Boolean(coupon.coupon_generated),
          subscription_status: coupon.subscription_status ?? 'inactive',
        },
      ]),
    );

    const redemptionInfluencerIds = Array.from(
      new Set((redemptions || []).map((item: any) => item.influencer_id).filter(Boolean) as string[]),
    ).filter((id) => !userMap.has(id));

    if (redemptionInfluencerIds.length > 0) {
      const { data: extraUsers, error: extraError } = await supabase
        .from('users')
        .select('user_id, email, coupon_code, coupon_generated, subscription_status')
        .in('user_id', redemptionInfluencerIds);

      if (extraError) throw extraError;
      extraUsers?.forEach((user) => {
        userMap.set(user.user_id, {
          email: user.email ?? 'Email não disponível',
          coupon_code: normalizeCouponCode(user.coupon_code),
          coupon_generated: Boolean(user.coupon_generated),
          subscription_status: user.subscription_status ?? 'inactive',
        });
      });
    }

    const redemptionMap = (redemptions || []).reduce(
      (acc: Record<string, { total: number; revenue: number; last: string | null; influencer_id: string | null }>, redemption: any) => {
        const rawCode = redemption.coupon_code as string;
        const code = normalizeCouponCode(rawCode);
        
        console.log('[AdminPanel] Processing redemption:', { rawCode, normalizedCode: code, redemption });
        
        if (!code) return acc;
        const existing = acc[code] ?? {
          total: 0,
          revenue: 0,
          last: null,
          influencer_id: redemption.influencer_id ?? null,
        };
        const redeemedAt = redemption.redeemed_at as string;
        const revenue = Number(redemption.amount) || 6;
        existing.total += 1;
        existing.revenue += revenue;
        if (!existing.last || new Date(redeemedAt) > new Date(existing.last)) {
          existing.last = redeemedAt;
        }
        if (!existing.influencer_id && redemption.influencer_id) {
          existing.influencer_id = redemption.influencer_id;
        }
        acc[code] = existing;
        return acc;
      },
      {}
    );
    
    console.log('[AdminPanel] Final redemption map:', redemptionMap);

    const statsMap = new Map<string, CouponStats>();

    (influencerCoupons || []).forEach((coupon: any) => {
      const code = normalizeCouponCode(coupon.coupon_code);
      if (!code) {
        return;
      }
      
      console.log('[AdminPanel] Processing coupon stats:', { code, redemptionData: redemptionMap[code] });
      const summary = redemptionMap[code] ?? {
        total: 0,
        revenue: 0,
        last: null,
        influencer_id: coupon.user_id,
      };
      statsMap.set(code, {
        coupon_code: code,
        influencer_id: coupon.user_id,
        influencer_email: coupon.email ?? 'Email não disponível',
        coupon_generated: Boolean(coupon.coupon_generated),
        subscription_status: coupon.subscription_status ?? 'inactive',
        total_redemptions: summary.total,
        total_revenue: summary.revenue,
        last_redeemed_at: summary.last,
      });
      delete redemptionMap[code];
    });

    Object.entries(redemptionMap).forEach(([code, summary]: [string, any]) => {
      const userInfo = summary.influencer_id ? userMap.get(summary.influencer_id) : undefined;
      statsMap.set(code, {
        coupon_code: code,
        influencer_id: summary.influencer_id ?? 'unknown',
        influencer_email: userInfo?.email ?? 'Email não disponível',
        coupon_generated: userInfo?.coupon_generated ?? false,
        subscription_status: userInfo?.subscription_status ?? 'desconhecido',
        total_redemptions: summary.total,
        total_revenue: summary.revenue,
        last_redeemed_at: summary.last,
      });
    });

    const stats = Array.from(statsMap.values()).sort((a, b) => a.coupon_code.localeCompare(b.coupon_code));
    setCouponStats(stats);
    setCouponCodes(stats.map((item) => item.coupon_code));

    const todayKey = new Date().toISOString().split('T')[0];
    const couponRedemptionsToday = (redemptions || []).filter(
      (entry: any) => new Date(entry.redeemed_at).toISOString().split('T')[0] === todayKey,
    ).length;
    setTodayStats((prev) => ({ ...prev, couponRedemptions: couponRedemptionsToday }));
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchUsersData(), fetchCouponData()]);
    } catch (error) {
      console.error('Erro ao carregar painel do admin', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar alguns dados do painel.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedCoupon !== 'ALL' && !couponCodes.includes(selectedCoupon)) {
      setSelectedCoupon('ALL');
    }
  }, [couponCodes, selectedCoupon]);

  const toggleUserSort = (column: keyof UserData) => {
    setUserSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column, direction: 'asc' };
    });
  };

  const toggleCouponSort = (column: keyof CouponStats) => {
    setCouponSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column, direction: 'asc' };
    });
  };

  const renderSortIcon = (active: boolean, direction: 'asc' | 'desc') => {
    if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />;
    return direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  const renderUserSortButton = (label: string, column: keyof UserData, align: 'left' | 'center' | 'right' = 'left') => (
    <button
      type="button"
      className={`flex items-center gap-1 text-sm font-semibold ${align === 'center' ? 'mx-auto justify-center' : align === 'right' ? 'ml-auto justify-end' : ''}`}
      onClick={() => toggleUserSort(column)}
    >
      <span>{label}</span>
      {renderSortIcon(userSort.column === column, userSort.direction)}
    </button>
  );

  const renderCouponSortButton = (label: string, column: keyof CouponStats, align: 'left' | 'center' | 'right' = 'left') => (
    <button
      type="button"
      className={`flex items-center gap-1 text-sm font-semibold ${align === 'center' ? 'mx-auto justify-center' : align === 'right' ? 'ml-auto justify-end' : ''}`}
      onClick={() => toggleCouponSort(column)}
    >
      <span>{label}</span>
      {renderSortIcon(couponSort.column === column, couponSort.direction)}
    </button>
  );

  const renderBooleanBadge = (value: boolean) => (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        value ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted text-muted-foreground'
      }`}
    >
      {value ? 'Sim' : 'Não'}
    </span>
  );

  const formatDate = (iso?: string | null, withTime = false) => {
    if (!iso) return '--';
    const date = new Date(iso);
    return withTime
      ? `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`
      : date.toLocaleDateString('pt-BR');
  };

  const handleResetUserFilters = () => setUserFilters({ ...initialUserFilters });

  const handleResetAllCounts = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          jogo1_count: 0,
          jogo2_count: 0,
          jogo3_count: 0,
          jogo4_count: 0,
          usage_count: 0,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Todos os contadores foram resetados.',
      });

      await fetchUsersData();
    } catch (error) {
      console.error('Erro ao resetar contadores', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar os contadores deste usuário.',
        variant: 'destructive',
      });
    }
  };

  const filteredCouponStats = useMemo(() => {
    const base =
      selectedCoupon === 'ALL'
        ? couponStats
        : couponStats.filter((item) => item.coupon_code === selectedCoupon);

    const filtered = base.filter((coupon) => {
      const matchCode = coupon.coupon_code.toLowerCase().includes(couponFilters.code.toLowerCase());
      const matchInfluencer = coupon.influencer_email.toLowerCase().includes(couponFilters.influencer.toLowerCase());
      const matchStatus =
        couponFilters.status === 'ALL' || coupon.subscription_status === couponFilters.status;
      return matchCode && matchInfluencer && matchStatus;
    });

    return [...filtered].sort((a, b) => {
      const { column, direction } = couponSort;
      const aValue = a[column];
      const bValue = b[column];
      let result = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue;
      } else {
        result = String(aValue ?? '').localeCompare(String(bValue ?? ''));
      }
      return direction === 'asc' ? result : -result;
    });
  }, [couponStats, selectedCoupon, couponFilters, couponSort]);

  const couponSummary = useMemo(() => {
    if (filteredCouponStats.length === 0) {
      return 'Nenhum cupom encontrado para o filtro atual.';
    }
    const totalRedemptions = filteredCouponStats.reduce((sum, entry) => sum + entry.total_redemptions, 0);
    const totalRevenue = filteredCouponStats.reduce((sum, entry) => sum + entry.total_revenue, 0);
    return `Total de resgates: ${totalRedemptions} (R$ ${totalRevenue.toFixed(2)})`;
  }, [filteredCouponStats]);

  const filteredUsers = useMemo(() => {
    const matchBool = (filterValue: string, actual: boolean) => {
      if (filterValue === 'ALL') return true;
      if (filterValue === 'YES') return actual;
      return !actual;
    };

    const matchNumber = (filterValue: string, actual: number) => {
      if (!filterValue) return true;
      return actual.toString().includes(filterValue);
    };

    return users.filter((user) => {
      if (userFilters.email && !user.email.toLowerCase().includes(userFilters.email.toLowerCase())) {
        return false;
      }
      if (userFilters.tier !== 'ALL' && user.subscription_tier !== userFilters.tier) {
        return false;
      }
      if (userFilters.status !== 'ALL' && user.subscription_status !== userFilters.status) {
        return false;
      }
      if (!matchBool(userFilters.confirmed, Boolean(user.plan_confirmed))) {
        return false;
      }
      if (
        userFilters.couponCode &&
        !(user.coupon_code ?? '').toLowerCase().includes(userFilters.couponCode.toLowerCase())
      ) {
        return false;
      }
      if (!matchBool(userFilters.couponGenerated, Boolean(user.coupon_generated))) {
        return false;
      }
      if (!matchBool(userFilters.premium, Boolean(user.is_premium))) {
        return false;
      }
      if (
        userFilters.premiumType &&
        !(user.premium_type ?? '').toLowerCase().includes(userFilters.premiumType.toLowerCase())
      ) {
        return false;
      }
      if (!matchNumber(userFilters.usage, user.usage_count)) {
        return false;
      }
      if (!matchNumber(userFilters.jogo1, user.jogo1_count)) {
        return false;
      }
      if (!matchNumber(userFilters.jogo2, user.jogo2_count)) {
        return false;
      }
      if (!matchNumber(userFilters.jogo3, user.jogo3_count)) {
        return false;
      }
      if (!matchNumber(userFilters.jogo4, user.jogo4_count)) {
        return false;
      }

      const lastAccess = user.last_accessed_at
        ? new Date(user.last_accessed_at).toLocaleDateString('pt-BR')
        : '';
      const lastAccessDate = user.last_accessed_at ? new Date(user.last_accessed_at) : null;
      if (userFilters.lastAccess && !lastAccess.includes(userFilters.lastAccess)) {
        return false;
      }
      if (userFilters.lastAccessStart) {
        const start = new Date(userFilters.lastAccessStart);
        if (!lastAccessDate || lastAccessDate < start) {
          return false;
        }
      }
      if (userFilters.lastAccessEnd) {
        const end = new Date(userFilters.lastAccessEnd);
        if (!lastAccessDate || lastAccessDate > end) {
          return false;
        }
      }

      const createdAtDate = user.created_at ? new Date(user.created_at) : null;
      if (userFilters.createdAt && (!createdAtDate || !createdAtDate.toLocaleDateString('pt-BR').includes(userFilters.createdAt))) {
        return false;
      }
      if (userFilters.createdAtStart) {
        const startDate = new Date(userFilters.createdAtStart);
        if (!createdAtDate || createdAtDate < startDate) {
          return false;
        }
      }
      if (userFilters.createdAtEnd) {
        const endDate = new Date(userFilters.createdAtEnd);
        if (!createdAtDate || createdAtDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [users, userFilters]);

  const sortedUsers = useMemo(() => {
    const sortable = [...filteredUsers];
    return sortable.sort((a, b) => {
      const { column, direction } = userSort;
      const aValue = a[column];
      const bValue = b[column];
      let result = 0;

      const isDateColumn = column === 'created_at' || column === 'last_accessed_at';
      const isNumberColumn =
        typeof aValue === 'number' ||
        typeof bValue === 'number' ||
        column.endsWith('_count') ||
        column === 'usage_count';

      if (isDateColumn) {
        const aTime = aValue ? new Date(String(aValue)).getTime() : 0;
        const bTime = bValue ? new Date(String(bValue)).getTime() : 0;
        result = aTime - bTime;
      } else if (isNumberColumn) {
        result = Number(aValue ?? 0) - Number(bValue ?? 0);
      } else if (typeof aValue === 'boolean' || typeof bValue === 'boolean') {
        result = Number(Boolean(aValue)) - Number(Boolean(bValue));
      } else {
        result = String(aValue ?? '').localeCompare(String(bValue ?? ''));
      }

      return direction === 'asc' ? result : -result;
    });
  }, [filteredUsers, userSort]);

  const openUserEditor = (user: UserData) => {
    setEditingUserId(user.user_id);
    setEditingUserData({ ...user });
  };

  const closeUserEditor = () => {
    setEditingUserId(null);
    setEditingUserData(null);
  };

  const handleEditUserField = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    setEditingUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveUser = async () => {
    if (!editingUserId || !editingUserData) return;

    const originalUser = users.find((user) => user.user_id === editingUserId);
    if (!originalUser) {
      closeUserEditor();
      return;
    }

    const updates: Partial<UserData> = {};
    (Object.keys(editingUserData) as Array<keyof UserData>).forEach((key) => {
      if (key === 'user_id') return;
      const newValue = editingUserData[key];
      if (newValue !== originalUser[key]) {
        updates[key] = newValue as UserData[keyof UserData];
      }
    });

    if (Object.keys(updates).length === 0) {
      toast({
        title: 'Nada para salvar',
        description: 'Nenhuma alteração foi realizada.',
      });
      return;
    }

    try {
      setSavingUserId(editingUserId);
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', editingUserId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => (user.user_id === editingUserId ? { ...user, ...editingUserData } : user))
      );

      toast({
        title: 'Dados atualizados',
        description: 'As informações do usuário foram salvas com sucesso.',
      });
      closeUserEditor();
    } catch (error) {
      console.error('Erro ao salvar usuário', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setSavingUserId(null);
    }
  };

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <HeaderControls />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Novos usuários hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{todayStats.users}</p>
              <p className="text-xs text-muted-foreground">
                Registros concluídos nas últimas 24h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Planos Standard hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-500">{todayStats.standard}</p>
              <p className="text-xs text-muted-foreground">Assinaturas vitalícias confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Planos Influencer hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-500">{todayStats.influencer}</p>
              <p className="text-xs text-muted-foreground">Novas assinaturas mensais ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cupons resgatados hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{todayStats.couponRedemptions}</p>
              <p className="text-xs text-muted-foreground">Total de redemptions nas últimas 24h</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de usuários por assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            {registrationSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ainda não há dados suficientes para exibir o gráfico.
              </p>
            ) : (
              <ChartContainer config={registrationChartConfig} className="h-64 sm:h-80">
                <LineChart
                  data={registrationSeries}
                  margin={{ left: 0, right: 0, top: 8, bottom: isMobileChart ? 24 : 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
                    }
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                    tick={{ fontSize: isMobileChart ? 9 : 11 }}
                    angle={isMobileChart ? -35 : 0}
                    textAnchor={isMobileChart ? 'end' : 'middle'}
                    height={isMobileChart ? 50 : undefined}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: isMobileChart ? 9 : 11 }}
                    width={isMobileChart ? 30 : 40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent />}
                    wrapperStyle={{
                      justifyContent: 'center',
                    }}
                    verticalAlign={isMobileChart ? 'bottom' : 'top'}
                  />
                  <Line
                    type="monotone"
                    dataKey="FREE"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={false}
                    name="Free"
                  />
                  <Line
                    type="monotone"
                    dataKey="STANDARD"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Standard"
                  />
                  <Line
                    type="monotone"
                    dataKey="INFLUENCER"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                    name="Influencer"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Cupons promocionais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Todos os códigos cadastrados, mesmo sem resgates.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Label htmlFor="coupon-filter" className="text-sm text-muted-foreground">
                Filtrar por código
              </Label>
              <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
                <SelectTrigger id="coupon-filter" className="w-[220px]">
                  <SelectValue placeholder="Selecione um cupom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os cupons</SelectItem>
                  {couponCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {couponStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cupom cadastrado até o momento.
              </p>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4 text-right">{couponSummary}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">
                          {renderCouponSortButton('Codigo', 'coupon_code')}
                          <Input
                            value={couponFilters.code}
                            onChange={(event) =>
                              setCouponFilters((prev) => ({ ...prev, code: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8 mt-2"
                          />
                        </th>
                        <th className="text-left p-2">
                          {renderCouponSortButton('Influencer', 'influencer_email')}
                          <Input
                            value={couponFilters.influencer}
                            onChange={(event) =>
                              setCouponFilters((prev) => ({ ...prev, influencer: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8 mt-2"
                          />
                        </th>
                        <th className="text-center p-2">
                          {renderCouponSortButton('Status', 'subscription_status', 'center')}
                          <Select
                            value={couponFilters.status}
                            onValueChange={(value) =>
                              setCouponFilters((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger className="h-8 mt-2">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="active">active</SelectItem>
                              <SelectItem value="inactive">inactive</SelectItem>
                              <SelectItem value="past_due">past_due</SelectItem>
                              <SelectItem value="canceled">canceled</SelectItem>
                            </SelectContent>
                          </Select>
                        </th>
                        <th className="text-center p-2">{renderCouponSortButton('Resgates', 'total_redemptions', 'center')}</th>
                        <th className="text-center p-2">{renderCouponSortButton('Receita', 'total_revenue', 'center')}</th>
                        <th className="text-left p-2">{renderCouponSortButton('Ultimo resgate', 'last_redeemed_at')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCouponStats.map((coupon) => (
                        <tr key={coupon.coupon_code} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-xs">{coupon.coupon_code}</td>
                          <td className="p-2">{coupon.influencer_email}</td>
                          <td className="p-2 text-center">
                            {coupon.coupon_generated ? 'Ativo' : 'Pendente'} / {coupon.subscription_status}
                          </td>
                          <td className="p-2 text-center font-semibold">{coupon.total_redemptions}</td>
                          <td className="p-2 text-center font-semibold">
                            R$ {coupon.total_revenue.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {coupon.last_redeemed_at
                              ? `${new Date(coupon.last_redeemed_at).toLocaleDateString('pt-BR')} ${new Date(
                                  coupon.last_redeemed_at
                                ).toLocaleTimeString('pt-BR')}`
                              : 'Sem resgates'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Usu?rios (edi??o completa)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4 rounded-2xl border border-primary/10 bg-muted/10 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">Filtros dos usu?rios</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={userFilters.email}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="Filtrar por email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Plano</Label>
                    <Select
                      value={userFilters.tier}
                      onValueChange={(value) => setUserFilters((prev) => ({ ...prev, tier: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="FREE">FREE</SelectItem>
                        <SelectItem value="STANDARD">STANDARD</SelectItem>
                        <SelectItem value="INFLUENCER">INFLUENCER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={userFilters.status}
                      onValueChange={(value) => setUserFilters((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="inactive">inactive</SelectItem>
                        <SelectItem value="past_due">past_due</SelectItem>
                        <SelectItem value="canceled">canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Confirmado</Label>
                    <Select
                      value={userFilters.confirmed}
                      onValueChange={(value) => setUserFilters((prev) => ({ ...prev, confirmed: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="YES">Sim</SelectItem>
                        <SelectItem value="NO">N?o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cupom</Label>
                    <Input
                      value={userFilters.couponCode}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, couponCode: event.target.value }))}
                      placeholder="Filtrar pelo cupom"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cupom gerado</Label>
                    <Select
                      value={userFilters.couponGenerated}
                      onValueChange={(value) => setUserFilters((prev) => ({ ...prev, couponGenerated: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="YES">Sim</SelectItem>
                        <SelectItem value="NO">N?o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Premium</Label>
                    <Select
                      value={userFilters.premium}
                      onValueChange={(value) => setUserFilters((prev) => ({ ...prev, premium: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="YES">Sim</SelectItem>
                        <SelectItem value="NO">N?o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Premium type</Label>
                    <Input
                      value={userFilters.premiumType}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, premiumType: event.target.value }))}
                      placeholder="Filtrar..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Uso total</Label>
                    <Input
                      value={userFilters.usage}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, usage: event.target.value }))}
                      placeholder="Buscar valor..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Jogos (J1 a J4)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={userFilters.jogo1} onChange={(event) => setUserFilters((prev) => ({ ...prev, jogo1: event.target.value }))} placeholder="J1" />
                      <Input value={userFilters.jogo2} onChange={(event) => setUserFilters((prev) => ({ ...prev, jogo2: event.target.value }))} placeholder="J2" />
                      <Input value={userFilters.jogo3} onChange={(event) => setUserFilters((prev) => ({ ...prev, jogo3: event.target.value }))} placeholder="J3" />
                      <Input value={userFilters.jogo4} onChange={(event) => setUserFilters((prev) => ({ ...prev, jogo4: event.target.value }))} placeholder="J4" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Último acesso (intervalo)</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        type="date"
                        value={userFilters.lastAccessStart}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, lastAccessStart: event.target.value }))}
                      />
                      <Input
                        type="date"
                        value={userFilters.lastAccessEnd}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, lastAccessEnd: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Último acesso (texto rápido)</Label>
                    <Input
                      value={userFilters.lastAccess}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, lastAccess: event.target.value }))}
                      placeholder="dd/mm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cadastro (intervalo)</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        type="date"
                        value={userFilters.createdAtStart}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, createdAtStart: event.target.value }))}
                      />
                      <Input
                        type="date"
                        value={userFilters.createdAtEnd}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, createdAtEnd: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cadastro (texto rápido)</Label>
                    <Input
                      value={userFilters.createdAt}
                      onChange={(event) => setUserFilters((prev) => ({ ...prev, createdAt: event.target.value }))}
                      placeholder="dd/mm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={handleResetUserFilters}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
              {sortedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usu?rio encontrado para o filtro aplicado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm align-top">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{renderUserSortButton('Email', 'email')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Plano', 'subscription_tier')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Status', 'subscription_status')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Confirmado', 'plan_confirmed', 'center')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Cupom', 'coupon_code')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Cupom gerado', 'coupon_generated', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Premium', 'is_premium', 'center')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Premium type', 'premium_type')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Uso total', 'usage_count', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Jogo 1', 'jogo1_count', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Jogo 2', 'jogo2_count', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Jogo 3', 'jogo3_count', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Jogo 4', 'jogo4_count', 'center')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Ultimo acesso', 'last_accessed_at')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Cadastro', 'created_at')}</th>
                        <th className="text-right p-2">{renderUserSortButton('Acoes', 'user_id', 'right')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user) => {
                        const totalCount =
                          (user.jogo1_count ?? 0) +
                          (user.jogo2_count ?? 0) +
                          (user.jogo3_count ?? 0) +
                          (user.jogo4_count ?? 0);
                        return (
                          <tr key={user.user_id} className="border-b hover:bg-muted/50">
                            <td className="p-2 min-w-[200px]">
                              <div>
                                <p className="font-semibold">{user.email}</p>
                                <p className="text-xs text-muted-foreground font-mono">{user.user_id}</p>
                              </div>
                            </td>
                            <td className="p-2">{user.subscription_tier}</td>
                            <td className="p-2">{user.subscription_status}</td>
                            <td className="p-2 text-center">{renderBooleanBadge(Boolean(user.plan_confirmed))}</td>
                            <td className="p-2">{user.coupon_code ?? '--'}</td>
                            <td className="p-2 text-center">{renderBooleanBadge(Boolean(user.coupon_generated))}</td>
                            <td className="p-2 text-center">{renderBooleanBadge(Boolean(user.is_premium))}</td>
                            <td className="p-2">{user.premium_type ?? '--'}</td>
                            <td className="p-2 text-center font-semibold">
                              {user.usage_count ?? 0}
                              <div className="text-xs text-muted-foreground">Total jogos: {totalCount}</div>
                            </td>
                            <td className="p-2 text-center">{user.jogo1_count ?? 0}</td>
                            <td className="p-2 text-center">{user.jogo2_count ?? 0}</td>
                            <td className="p-2 text-center">{user.jogo3_count ?? 0}</td>
                            <td className="p-2 text-center">{user.jogo4_count ?? 0}</td>
                            <td className="p-2">{formatDate(user.last_accessed_at)}</td>
                            <td className="p-2">{formatDate(user.created_at)}</td>
                            <td className="p-2 text-right">
                              <div className="flex flex-col gap-2 items-end">
                                <Button size="sm" onClick={() => openUserEditor(user)}>
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResetAllCounts(user.user_id)}
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Reset contadores
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={Boolean(editingUserId)} onOpenChange={(open) => (open ? null : closeUserEditor())}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar usu?rio</DialogTitle>
            </DialogHeader>
            {editingUserData && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={editingUserData.email ?? ''}
                    onChange={(event) => handleEditUserField('email', event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Plano</Label>
                  <Select
                    value={editingUserData.subscription_tier ?? 'FREE'}
                    onValueChange={(value) => handleEditUserField('subscription_tier', value as UserData['subscription_tier'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">FREE</SelectItem>
                      <SelectItem value="STANDARD">STANDARD</SelectItem>
                      <SelectItem value="INFLUENCER">INFLUENCER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={editingUserData.subscription_status ?? 'inactive'}
                    onValueChange={(value) => handleEditUserField('subscription_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                      <SelectItem value="past_due">past_due</SelectItem>
                      <SelectItem value="canceled">canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Cupom</Label>
                  <Input
                    value={editingUserData.coupon_code ?? ''}
                    onChange={(event) => handleEditUserField('coupon_code', event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Premium type</Label>
                  <Input
                    value={editingUserData.premium_type ?? ''}
                    onChange={(event) => handleEditUserField('premium_type', event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Uso total</Label>
                  <Input
                    type="number"
                    value={editingUserData.usage_count ?? 0}
                    onChange={(event) => handleEditUserField('usage_count', Number(event.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Jogos (J1 a J4)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" value={editingUserData.jogo1_count ?? 0} onChange={(event) => handleEditUserField('jogo1_count', Number(event.target.value))} placeholder="J1" />
                    <Input type="number" value={editingUserData.jogo2_count ?? 0} onChange={(event) => handleEditUserField('jogo2_count', Number(event.target.value))} placeholder="J2" />
                    <Input type="number" value={editingUserData.jogo3_count ?? 0} onChange={(event) => handleEditUserField('jogo3_count', Number(event.target.value))} placeholder="J3" />
                    <Input type="number" value={editingUserData.jogo4_count ?? 0} onChange={(event) => handleEditUserField('jogo4_count', Number(event.target.value))} placeholder="J4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Op??es</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(editingUserData.plan_confirmed)}
                        onCheckedChange={(checked) => handleEditUserField('plan_confirmed', Boolean(checked))}
                      />
                      <span>Plano confirmado</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(editingUserData.coupon_generated)}
                        onCheckedChange={(checked) => handleEditUserField('coupon_generated', Boolean(checked))}
                      />
                      <span>Cupom gerado</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(editingUserData.is_premium)}
                        onCheckedChange={(checked) => handleEditUserField('is_premium', Boolean(checked))}
                      />
                      <span>Usu?rio premium</span>
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>?ltimo acesso</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(editingUserData.last_accessed_at, true)}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Cadastro</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(editingUserData.created_at, true)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeUserEditor}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} disabled={savingUserId === editingUserId}>
                {savingUserId === editingUserId ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
