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

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [couponStats, setCouponStats] = useState<CouponStats[]>([]);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('ALL');
  const [emailFilter, setEmailFilter] = useState('');
  const [editedUsers, setEditedUsers] = useState<Record<string, Partial<UserData>>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredCouponStats =
    selectedCoupon === 'ALL'
      ? couponStats
      : couponStats.filter((item) => item.coupon_code === selectedCoupon);

  const couponSummary = useMemo(() => {
    if (filteredCouponStats.length === 0) {
      return 'Nenhum cupom encontrado para o filtro atual.';
    }
    const totalRedemptions = filteredCouponStats.reduce((sum, entry) => sum + entry.total_redemptions, 0);
    const totalRevenue = filteredCouponStats.reduce((sum, entry) => sum + entry.total_revenue, 0);
    return `Total de resgates: ${totalRedemptions} (R$ ${totalRevenue.toFixed(2)})`;
  }, [filteredCouponStats]);

  const filteredUsers = useMemo(() => {
    if (!emailFilter) return users;
    return users.filter((user) => user.email.toLowerCase().includes(emailFilter.toLowerCase()));
  }, [users, emailFilter]);

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
                        <th className="text-left p-2">Código</th>
                        <th className="text-left p-2">Influencer</th>
                        <th className="text-center p-2">Status</th>
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
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Usuários (edição completa)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajuste qualquer coluna e aplique filtros por email.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email-filter" className="text-sm text-muted-foreground">
                  Filtrar por email
                </Label>
                <Input
                  id="email-filter"
                  placeholder="Buscar..."
                  value={emailFilter}
                  onChange={(event) => setEmailFilter(event.target.value)}
                />
              </div>
            </div>
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
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Plano</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-center p-2">Confirmado</th>
                      <th className="text-left p-2">Cupom</th>
                      <th className="text-center p-2">Cupom gerado</th>
                      <th className="text-center p-2">Premium</th>
                      <th className="text-left p-2">Premium type</th>
                      <th className="text-center p-2">Uso total</th>
                      <th className="text-center p-2">Jogo 1</th>
                      <th className="text-center p-2">Jogo 2</th>
                      <th className="text-center p-2">Jogo 3</th>
                      <th className="text-center p-2">Jogo 4</th>
                      <th className="text-left p-2">Último acesso</th>
                      <th className="text-left p-2">Cadastro</th>
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
