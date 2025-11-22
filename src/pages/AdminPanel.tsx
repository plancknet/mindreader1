import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Crown, RefreshCw, Save, Undo } from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  const [userFilters, setUserFilters] = useState({
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
    createdAt: '',
    createdAtStart: '',
    createdAtEnd: '',
  });
  const [editedUsers, setEditedUsers] = useState<Record<string, Partial<UserData>>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationSeries, setRegistrationSeries] = useState<Array<{ date: string; FREE: number; STANDARD: number; INFLUENCER: number }>>([]);

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

    const sortedDates = Array.from(dailyMap.keys()).sort();
    const cumulative = { FREE: 0, STANDARD: 0, INFLUENCER: 0 };
    return sortedDates.map((date) => {
      const current = dailyMap.get(date)!;
      cumulative.FREE += current.FREE ?? 0;
      cumulative.STANDARD += current.STANDARD ?? 0;
      cumulative.INFLUENCER += current.INFLUENCER ?? 0;
      return {
        date,
        FREE: cumulative.FREE,
        STANDARD: cumulative.STANDARD,
        INFLUENCER: cumulative.INFLUENCER,
      };
    });
  };

  const fetchCouponData = async () => {
    const { data: influencerCoupons, error: influencerError } = await supabase
      .from('users')
      .select('user_id, email, coupon_code, coupon_generated, subscription_status')
      .not('coupon_code', 'is', null);

    if (influencerError) throw influencerError;

    const { data: redemptions, error: redemptionsError } = await supabase
      .from('coupon_redemptions' as any)
      .select('coupon_code, redeemed_at, amount, influencer_id');

    if (redemptionsError) throw redemptionsError;

    const userMap = new Map(
      (influencerCoupons || []).map((coupon) => [
        coupon.user_id,
        {
          email: coupon.email ?? 'Email não disponível',
          coupon_code: coupon.coupon_code,
          coupon_generated: Boolean(coupon.coupon_generated),
          subscription_status: coupon.subscription_status ?? 'inactive',
        },
      ]),
    );

    const redemptionInfluencerIds = Array.from(
      new Set((redemptions || []).map((item) => item.influencer_id).filter(Boolean) as string[]),
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
          coupon_code: user.coupon_code,
          coupon_generated: Boolean(user.coupon_generated),
          subscription_status: user.subscription_status ?? 'inactive',
        });
      });
    }

    const redemptionMap = (redemptions || []).reduce<
      Record<string, { total: number; revenue: number; last: string | null; influencer_id: string | null }>
    >((acc, redemption) => {
      const code = redemption.coupon_code as string;
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
    }, {});

    const statsMap = new Map<string, CouponStats>();

    (influencerCoupons || []).forEach((coupon) => {
      const code = coupon.coupon_code as string;
      if (!code) {
        return;
      }
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

    Object.entries(redemptionMap).forEach(([code, summary]) => {
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

    return base.filter((coupon) => {
      const matchCode = coupon.coupon_code.toLowerCase().includes(couponFilters.code.toLowerCase());
      const matchInfluencer = coupon.influencer_email.toLowerCase().includes(couponFilters.influencer.toLowerCase());
      const matchStatus =
        couponFilters.status === 'ALL' || coupon.subscription_status === couponFilters.status;
      return matchCode && matchInfluencer && matchStatus;
    });
  }, [couponStats, selectedCoupon, couponFilters]);

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
      if (userFilters.lastAccess && !lastAccess.includes(userFilters.lastAccess)) {
        return false;
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

  const handleUserFieldChange = <K extends keyof UserData>(userId: string, field: K, value: UserData[K]) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const getUserValue = <K extends keyof UserData>(user: UserData, field: K): UserData[K] => {
    return (editedUsers[user.user_id]?.[field] as UserData[K]) ?? user[field];
  };

  const handleSaveUser = async (userId: string) => {
    const updates = editedUsers[userId];
    if (!updates || Object.keys(updates).length === 0) {
      toast({
        title: 'Nada para salvar',
        description: 'Nenhuma alteração foi realizada.',
      });
      return;
    }

    try {
      setSavingUserId(userId);
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => (user.user_id === userId ? { ...user, ...updates } : user))
      );

      setEditedUsers((prev) => {
        const { [userId]: removed, ...rest } = prev;
        return rest;
      });

      toast({
        title: 'Dados atualizados',
        description: 'As informações do usuário foram salvas com sucesso.',
      });
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

  const handleResetUserChanges = (userId: string) => {
    setEditedUsers((prev) => {
      const { [userId]: removed, ...rest } = prev;
      return rest;
    });
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
              <ChartContainer config={registrationChartConfig} className="h-80">
                <LineChart data={registrationSeries} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
                    }
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
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
                          <div className="flex flex-col gap-1">
                            <span>Código</span>
                            <Input
                              value={couponFilters.code}
                              onChange={(event) =>
                                setCouponFilters((prev) => ({ ...prev, code: event.target.value }))
                              }
                              placeholder="Filtrar..."
                              className="h-8"
                            />
                          </div>
                        </th>
                        <th className="text-left p-2">
                          <div className="flex flex-col gap-1">
                            <span>Influencer</span>
                            <Input
                              value={couponFilters.influencer}
                              onChange={(event) =>
                                setCouponFilters((prev) => ({ ...prev, influencer: event.target.value }))
                              }
                              placeholder="Filtrar..."
                              className="h-8"
                            />
                          </div>
                        </th>
                        <th className="text-center p-2">
                          <div className="flex flex-col gap-1">
                            <span>Status</span>
                            <Select
                              value={couponFilters.status}
                              onValueChange={(value) =>
                                setCouponFilters((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger className="h-8">
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
                        </th>
                        <th className="text-center p-2">Resgates</th>
                        <th className="text-center p-2">Receita</th>
                        <th className="text-left p-2">Último resgate</th>
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
            <CardTitle>Usuários (edição completa)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado para o filtro aplicado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm align-top">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Email</span>
                          <Input
                            value={userFilters.email}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, email: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Plano</span>
                          <Select
                            value={userFilters.tier}
                            onValueChange={(value) =>
                              setUserFilters((prev) => ({ ...prev, tier: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
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
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Status</span>
                          <Select
                            value={userFilters.status}
                            onValueChange={(value) =>
                              setUserFilters((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
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
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Confirmado</span>
                          <Select
                            value={userFilters.confirmed}
                            onValueChange={(value) =>
                              setUserFilters((prev) => ({ ...prev, confirmed: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="YES">Sim</SelectItem>
                              <SelectItem value="NO">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Cupom</span>
                          <Input
                            value={userFilters.couponCode}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, couponCode: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Cupom gerado</span>
                          <Select
                            value={userFilters.couponGenerated}
                            onValueChange={(value) =>
                              setUserFilters((prev) => ({ ...prev, couponGenerated: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="YES">Sim</SelectItem>
                              <SelectItem value="NO">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Premium</span>
                          <Select
                            value={userFilters.premium}
                            onValueChange={(value) =>
                              setUserFilters((prev) => ({ ...prev, premium: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="YES">Sim</SelectItem>
                              <SelectItem value="NO">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Premium type</span>
                          <Input
                            value={userFilters.premiumType}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, premiumType: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Uso total</span>
                          <Input
                            value={userFilters.usage}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, usage: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Jogo 1</span>
                          <Input
                            value={userFilters.jogo1}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, jogo1: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Jogo 2</span>
                          <Input
                            value={userFilters.jogo2}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, jogo2: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Jogo 3</span>
                          <Input
                            value={userFilters.jogo3}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, jogo3: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div className="flex flex-col gap-1">
                          <span>Jogo 4</span>
                          <Input
                            value={userFilters.jogo4}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, jogo4: event.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Último acesso</span>
                          <Input
                            value={userFilters.lastAccess}
                            onChange={(event) =>
                              setUserFilters((prev) => ({ ...prev, lastAccess: event.target.value }))
                            }
                            placeholder="dd/mm"
                            className="h-8"
                          />
                        </div>
                      </th>
                      <th className="text-left p-2">
                        <div className="flex flex-col gap-1">
                          <span>Cadastro</span>
                          <div className="grid grid-cols-1 gap-1">
                            <Input
                              value={userFilters.createdAt}
                              onChange={(event) =>
                                setUserFilters((prev) => ({ ...prev, createdAt: event.target.value }))
                              }
                              placeholder="dd/mm"
                              className="h-8"
                            />
                            <div className="flex gap-1">
                              <Input
                                type="date"
                                value={userFilters.createdAtStart}
                                onChange={(event) =>
                                  setUserFilters((prev) => ({ ...prev, createdAtStart: event.target.value }))
                                }
                                className="h-8"
                              />
                              <Input
                                type="date"
                                value={userFilters.createdAtEnd}
                                onChange={(event) =>
                                  setUserFilters((prev) => ({ ...prev, createdAtEnd: event.target.value }))
                                }
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                      </th>
                      <th className="text-right p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const totalCount =
                        Number(getUserValue(user, 'jogo1_count')) +
                        Number(getUserValue(user, 'jogo2_count')) +
                        Number(getUserValue(user, 'jogo3_count')) +
                        Number(getUserValue(user, 'jogo4_count'));

                      return (
                        <tr key={user.user_id} className="border-b hover:bg-muted/50">
                          <td className="p-2 min-w-[220px]">
                            <Input
                              value={getUserValue(user, 'email')}
                              onChange={(event) => handleUserFieldChange(user.user_id, 'email', event.target.value)}
                            />
                          </td>
                          <td className="p-2 min-w-[150px]">
                            <Select
                              value={getUserValue(user, 'subscription_tier')}
                              onValueChange={(value) =>
                                handleUserFieldChange(user.user_id, 'subscription_tier', value as UserData['subscription_tier'])
                              }
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
                          </td>
                          <td className="p-2 min-w-[150px]">
                            <Select
                              value={getUserValue(user, 'subscription_status')}
                              onValueChange={(value) => handleUserFieldChange(user.user_id, 'subscription_status', value)}
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
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={Boolean(getUserValue(user, 'plan_confirmed'))}
                              onCheckedChange={(checked) =>
                                handleUserFieldChange(user.user_id, 'plan_confirmed', Boolean(checked))
                              }
                            />
                          </td>
                          <td className="p-2 min-w-[160px]">
                            <Input
                              value={getUserValue(user, 'coupon_code') ?? ''}
                              onChange={(event) => handleUserFieldChange(user.user_id, 'coupon_code', event.target.value)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={Boolean(getUserValue(user, 'coupon_generated'))}
                              onCheckedChange={(checked) =>
                                handleUserFieldChange(user.user_id, 'coupon_generated', Boolean(checked))
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={Boolean(getUserValue(user, 'is_premium'))}
                              onCheckedChange={(checked) =>
                                handleUserFieldChange(user.user_id, 'is_premium', Boolean(checked))
                              }
                            />
                          </td>
                          <td className="p-2 min-w-[140px]">
                            <Input
                              value={getUserValue(user, 'premium_type') ?? ''}
                              onChange={(event) => handleUserFieldChange(user.user_id, 'premium_type', event.target.value)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              value={getUserValue(user, 'usage_count')}
                              onChange={(event) =>
                                handleUserFieldChange(user.user_id, 'usage_count', Number(event.target.value))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Total: {totalCount}</p>
                          </td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              value={getUserValue(user, 'jogo1_count')}
                              onChange={(event) =>
                                handleUserFieldChange(user.user_id, 'jogo1_count', Number(event.target.value))
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              value={getUserValue(user, 'jogo2_count')}
                              onChange={(event) =>
                                handleUserFieldChange(user.user_id, 'jogo2_count', Number(event.target.value))
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              value={getUserValue(user, 'jogo3_count')}
                              onChange={(event) =>
                                handleUserFieldChange(user.user_id, 'jogo3_count', Number(event.target.value))
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              value={getUserValue(user, 'jogo4_count')}
                              onChange={(event) =>
                                handleUserFieldChange(user.user_id, 'jogo4_count', Number(event.target.value))
                              }
                            />
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {user.last_accessed_at
                              ? new Date(user.last_accessed_at).toLocaleDateString('pt-BR')
                              : 'Nunca'}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2 text-right space-y-2">
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveUser(user.user_id)}
                                disabled={savingUserId === user.user_id}
                              >
                                <Save className="w-4 h-4 mr-1" />
                                {savingUserId === user.user_id ? 'Salvando...' : 'Salvar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetUserChanges(user.user_id)}
                                disabled={!editedUsers[user.user_id]}
                              >
                                <Undo className="w-4 h-4 mr-1" />
                                Desfazer
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
