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
import { GAME_IDS } from '@/constants/games';

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
  last_accessed_at: string | null;
  game_usage: Record<number, number>;
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

interface UserVideoData {
  id: string;
  user_id: string;
  email: string;
  video_data: string;
  created_at: string;
  mask2_offset_x: number | null;
  mask2_offset_y: number | null;
  mask2_color: string | null;
  mask2_size: number | null;
  mask2_display_time: number | null;
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

const GAME_USAGE_CONFIG = [
  { id: GAME_IDS.PONTA_DA_CARTA, label: 'Ponta da Carta', initials: 'PC' },
  { id: GAME_IDS.MYSTERY_WORD, label: 'Palavra Misteriosa', initials: 'PM' },
  { id: GAME_IDS.SUAS_PALAVRAS, label: 'Suas Palavras', initials: 'SP' },
  { id: GAME_IDS.MIND_READER, label: 'Quadrante Mágico', initials: 'QM' },
  { id: GAME_IDS.MIX_DE_CARTAS, label: 'Mix de Cartas', initials: 'MC' },
  { id: GAME_IDS.MENTAL_CONVERSATION, label: 'Conversa Mental', initials: 'CM' },
  { id: GAME_IDS.CARTA_MENTAL, label: 'Carta Mental', initials: 'CtM' },
  { id: GAME_IDS.RASPA_CARTA, label: 'Raspa Carta', initials: 'RC' },
  { id: GAME_IDS.PAPO_RETO, label: 'Papo Reto', initials: 'PR' },
  { id: GAME_IDS.EU_JA_SABIA, label: 'Eu Já Sabia', initials: 'EJS' },
  { id: GAME_IDS.EU_JA_SABIA_2, label: 'Eu Já Sabia 2', initials: 'EJS2' },
  { id: GAME_IDS.MY_EMOJIS, label: 'Meus Emojis', initials: 'ME' },
  { id: GAME_IDS.CARTA_PENSADA, label: 'Carta Pensada', initials: 'CP' },
  { id: GAME_IDS.OI_SUMIDA, label: 'Oi Sumida', initials: 'OS' },
  { id: GAME_IDS.JOGO_VELHA_BRUXA, label: 'Jogo da Velha Bruxa', initials: 'JVB' },
  { id: GAME_IDS.GOOGLE_MIME, label: 'Google Mime', initials: 'GM' },
] as const;

const createInitialGameUsageFilters = () =>
  GAME_USAGE_CONFIG.reduce<Record<number, string>>((acc, game) => {
    acc[game.id] = '';
    return acc;
  }, {});

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const getInitialUserFilters = () => ({
  email: '',
  tier: 'ALL',
  status: 'ALL',
  confirmed: 'ALL',
  couponCode: '',
  couponGenerated: 'ALL',
  premium: 'ALL',
  premiumType: '',
  usage: '',
  gameUsage: createInitialGameUsageFilters(),
  lastAccess: '',
  lastAccessStart: '',
  lastAccessEnd: '',
  createdAt: '',
  createdAtStart: '',
  createdAtEnd: '',
});

type UserFilters = ReturnType<typeof getInitialUserFilters>;

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
  const [userFilters, setUserFilters] = useState<UserFilters>(getInitialUserFilters());
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
  const [userVideos, setUserVideos] = useState<UserVideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<UserVideoData | null>(null);
  const [videoFilter, setVideoFilter] = useState('');

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
    const [userResponse, usageResponse] = await Promise.all([
      supabase
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
        .order('created_at', { ascending: false }),
      supabase.from('user_game_usage').select('user_id, game_id, usage_count'),
    ]);

    if (userResponse.error) throw userResponse.error;
    if (usageResponse.error && usageResponse.error.code !== 'PGRST116') throw usageResponse.error;

    const usageMap = new Map<string, Record<number, number>>();
    (usageResponse.data || []).forEach((entry) => {
      if (!usageMap.has(entry.user_id)) {
        usageMap.set(entry.user_id, {});
      }
      usageMap.get(entry.user_id)![entry.game_id] = entry.usage_count ?? 0;
    });

    const formattedUsers: UserData[] = (userResponse.data || []).map((user) => {
      const legacyUsage: Record<number, number> = {
        [GAME_IDS.MIND_READER]: user.jogo1_count ?? 0,
        [GAME_IDS.MENTAL_CONVERSATION]: user.jogo2_count ?? 0,
        [GAME_IDS.MYSTERY_WORD]: user.jogo3_count ?? 0,
        [GAME_IDS.MY_EMOJIS]: user.jogo4_count ?? 0,
      };
      const mergedUsage = {
        ...legacyUsage,
        ...(usageMap.get(user.user_id) ?? {}),
      };
      return {
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
        last_accessed_at: user.last_accessed_at,
        game_usage: mergedUsage,
      };
    });

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

  const fetchUserVideos = async () => {
    const { data: videos, error: videosError } = await supabase
      .from('user_videos')
      .select('id, user_id, video_data, created_at, mask2_offset_x, mask2_offset_y, mask2_color, mask2_size, mask2_display_time')
      .order('created_at', { ascending: false });

    if (videosError) throw videosError;

    const userIds = [...new Set((videos || []).map((v: any) => v.user_id))];
    const { data: userEmails, error: emailsError } = await supabase
      .from('users')
      .select('user_id, email')
      .in('user_id', userIds);

    if (emailsError) throw emailsError;

    const emailMap = new Map((userEmails || []).map((u: any) => [u.user_id, u.email]));

    const formattedVideos: UserVideoData[] = (videos || []).map((video: any) => ({
      id: video.id,
      user_id: video.user_id,
      email: emailMap.get(video.user_id) ?? 'Email não disponível',
      video_data: video.video_data,
      created_at: video.created_at,
      mask2_offset_x: video.mask2_offset_x,
      mask2_offset_y: video.mask2_offset_y,
      mask2_color: video.mask2_color,
      mask2_size: video.mask2_size,
      mask2_display_time: video.mask2_display_time,
    }));

    setUserVideos(formattedVideos);
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchUsersData(), fetchCouponData(), fetchUserVideos()]);
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
    const options: Intl.DateTimeFormatOptions = {
      timeZone: BRAZIL_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    }
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  };

  const handleResetUserFilters = () => setUserFilters(getInitialUserFilters());

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

      const { error: usageError } = await supabase
        .from('user_game_usage')
        .delete()
        .eq('user_id', userId);

      if (usageError) throw usageError;

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
      for (const gameConfig of GAME_USAGE_CONFIG) {
        if (!matchNumber(userFilters.gameUsage[gameConfig.id], user.game_usage?.[gameConfig.id] ?? 0)) {
          return false;
        }
      }

      const lastAccess = user.last_accessed_at ? formatDate(user.last_accessed_at, true) : '';
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

      const createdAtDisplay = user.created_at ? formatDate(user.created_at) : '';
      const createdAtDate = user.created_at ? new Date(user.created_at) : null;
      if (userFilters.createdAt && (!createdAtDisplay || !createdAtDisplay.includes(userFilters.createdAt))) {
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

  const gameUsageTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    users.forEach((user) => {
      Object.entries(user.game_usage ?? {}).forEach(([gameId, count]) => {
        const numericId = Number(gameId);
        totals[numericId] = (totals[numericId] ?? 0) + Number(count ?? 0);
      });
    });
    return totals;
  }, [users]);

  const openUserEditor = (user: UserData) => {
    setEditingUserId(user.user_id);
    setEditingUserData({ ...user });
  };

  const closeUserEditor = () => {
    setEditingUserId(null);
    setEditingUserData(null);
  };

  const handleEditUserField = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    if (!editingUserData) return;
    setEditingUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (editingUserId) {
      setEditedUsers((prev) => ({
        ...prev,
        [editingUserId]: {
          ...(prev[editingUserId] ?? {}),
          [field]: value,
        },
      }));
    }
  };

  type GameUsageConfig = (typeof GAME_USAGE_CONFIG)[number];

  const getGameUsageValue = (data: Partial<UserData> | null, config: GameUsageConfig) => {
    if (!data || !data.game_usage) return 0;
    return data.game_usage[config.id] ?? 0;
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
        (updates as any)[key] = newValue;
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
            <CardTitle>Uso por jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GAME_USAGE_CONFIG.map((game) => (
                <div key={game.id} className="rounded-2xl border border-primary/10 bg-card/60 p-4 shadow-inner">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {game.initials}
                    <span className="pl-2 text-[0.65rem] font-normal tracking-normal text-muted-foreground/80">
                      {game.label}
                    </span>
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {gameUsageTotals[game.id] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                      new Date(value).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: BRAZIL_TIMEZONE,
                      })
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
                            {coupon.last_redeemed_at ? formatDate(coupon.last_redeemed_at, true) : 'Sem resgates'}
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
                    <Label>Uso por jogo</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                      {GAME_USAGE_CONFIG.map((game) => (
                        <Input
                          key={game.id}
                          value={userFilters.gameUsage[game.id]}
                          onChange={(event) =>
                            setUserFilters((prev) => ({
                              ...prev,
                              gameUsage: { ...prev.gameUsage, [game.id]: event.target.value },
                            }))
                          }
                          placeholder={game.initials}
                        />
                      ))}
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
                      placeholder="dd/mm/aaaa hh:mm:ss"
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
                        <th className="text-center p-2">{renderUserSortButton('Confirm. cupom', 'coupon_generated', 'center')}</th>
                        <th className="text-center p-2">{renderUserSortButton('Uso total', 'usage_count', 'center')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Último acesso', 'last_accessed_at')}</th>
                        <th className="text-left p-2">{renderUserSortButton('Cadastro', 'created_at')}</th>
                        <th className="text-right p-2">{renderUserSortButton('Ações', 'user_id', 'right')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user) => {
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
                            <td className="p-2 text-center">{renderBooleanBadge(Boolean(user.coupon_generated))}</td>
                            <td className="p-2 text-center font-semibold">{user.usage_count ?? 0}</td>
                            <td className="p-2">{formatDate(user.last_accessed_at, true)}</td>
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

        {/* User Videos Section */}
        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Vídeos dos Usuários (Eu Já Sabia 2)
            </CardTitle>
            <span className="text-sm text-muted-foreground">{userVideos.length} vídeo(s)</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Filtrar por email..."
                value={videoFilter}
                onChange={(e) => setVideoFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {userVideos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum vídeo personalizado encontrado.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userVideos
                  .filter((v) => v.email.toLowerCase().includes(videoFilter.toLowerCase()))
                  .map((video) => (
                    <div
                      key={video.id}
                      className="rounded-xl border border-primary/10 bg-muted/30 p-4 space-y-3"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm truncate">{video.email}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{video.user_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado: {new Date(video.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-background/50 p-2">
                          <p className="text-muted-foreground">Posição</p>
                          <p className="font-medium">
                            X: {video.mask2_offset_x?.toFixed(1) ?? '-'}, Y: {video.mask2_offset_y?.toFixed(1) ?? '-'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2">
                          <p className="text-muted-foreground">Tamanho</p>
                          <p className="font-medium">{video.mask2_size?.toFixed(2) ?? '-'}</p>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2">
                          <p className="text-muted-foreground">Cor</p>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded border border-border"
                              style={{ backgroundColor: video.mask2_color ?? '#000' }}
                            />
                            <span className="font-mono text-[10px]">{video.mask2_color ?? '-'}</span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2">
                          <p className="text-muted-foreground">Tempo</p>
                          <p className="font-medium">{video.mask2_display_time ?? 0}s</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedVideo(video)}
                      >
                        Ver Vídeo
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Preview Dialog */}
        <Dialog open={Boolean(selectedVideo)} onOpenChange={(open) => !open && setSelectedVideo(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vídeo de {selectedVideo?.email}</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4">
                <video
                  src={selectedVideo.video_data}
                  controls
                  className="w-full rounded-xl bg-black aspect-[9/16] max-h-[60vh] object-contain"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Posição X</p>
                    <p className="font-semibold">{selectedVideo.mask2_offset_x?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Posição Y</p>
                    <p className="font-semibold">{selectedVideo.mask2_offset_y?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Tamanho</p>
                    <p className="font-semibold">{selectedVideo.mask2_size?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Tempo (s)</p>
                    <p className="font-semibold">{selectedVideo.mask2_display_time ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cor da máscara:</span>
                  <span
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: selectedVideo.mask2_color ?? '#000' }}
                  />
                  <span className="font-mono text-sm">{selectedVideo.mask2_color ?? '-'}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <div className="space-y-2 md:col-span-2">
                  <Label>Uso por jogo</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {GAME_USAGE_CONFIG.map((game) => (
                      <div key={game.id} className="rounded-2xl border border-primary/10 bg-muted/10 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Jogo {game.initials}
                          <span className="font-normal text-[0.65rem] text-muted-foreground/80"> ({game.label})</span>
                        </p>
                        <p className="text-2xl font-bold text-foreground">{getGameUsageValue(editingUserData, game)}</p>
                      </div>
                    ))}
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
