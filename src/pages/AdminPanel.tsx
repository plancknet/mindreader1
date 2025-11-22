import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Crown, RefreshCw } from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserData {
  user_id: string;
  is_premium: boolean;
  created_at: string;
  jogo1_count: number;
  jogo2_count: number;
  jogo3_count: number;
  jogo4_count: number;
  last_accessed_at: string | null;
  email?: string;
}

interface CouponRedemption {
  id: string;
  influencer_id: string;
  influencer_email: string;
  coupon_code: string;
  redeemed_at: string;
  amount: number;
}

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemption[]>([]);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('ALL');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/game-selector');
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  const fetchUsersData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, email, is_premium, created_at, jogo1_count, jogo2_count, jogo3_count, jogo4_count, last_accessed_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = (data || []).map((user) => ({
        user_id: user.user_id,
        email: user.email || 'Email não disponível',
        is_premium: user.is_premium,
        created_at: user.created_at,
        jogo1_count: user.jogo1_count,
        jogo2_count: user.jogo2_count,
        jogo3_count: user.jogo3_count,
        jogo4_count: user.jogo4_count,
        last_accessed_at: user.last_accessed_at,
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos usuários.',
        variant: 'destructive',
      });
    }
  };

  const fetchCouponData = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_redemptions' as any)
        .select(`
          id,
          coupon_code,
          redeemed_at,
          amount,
          influencer_id,
          users:users!coupon_redemptions_influencer_id_fkey(email)
        `)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;

      const formatted = ((data as any) || []).map((item: any) => ({
        id: item.id,
        coupon_code: item.coupon_code,
        redeemed_at: item.redeemed_at,
        amount: Number(item.amount) || 6,
        influencer_id: item.influencer_id,
        influencer_email: item?.users?.email ?? 'Email não disponível',
      }));

      setCouponRedemptions(formatted);
      const codes = Array.from(new Set(formatted.map((item: any) => item.coupon_code as string))).sort() as string[];
      setCouponCodes(codes);
    } catch (error: any) {
      console.error('Error fetching coupon redemptions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de cupons.',
        variant: 'destructive',
      });
    }
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchUsersData(), fetchCouponData()]);
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
          usage_count: 0
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Todos os contadores resetados com sucesso!',
      });

      await fetchUsersData();
    } catch (error: any) {
      console.error('Error resetting counts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar os contadores.',
        variant: 'destructive',
      });
    }
  };

  const filteredRedemptions =
    selectedCoupon === 'ALL'
      ? couponRedemptions
      : couponRedemptions.filter((entry) => entry.coupon_code === selectedCoupon);

  const totalRevenue = filteredRedemptions.reduce((sum, entry) => sum + entry.amount, 0);

  const redemptionSummary =
    filteredRedemptions.length === 0
      ? 'Nenhum resgate encontrado para o filtro atual.'
      : selectedCoupon === 'ALL'
        ? `Total de resgates: ${filteredRedemptions.length} (R$ ${totalRevenue.toFixed(2)})`
        : `Resgates do cupom ${selectedCoupon}: ${filteredRedemptions.length} (R$ ${totalRevenue.toFixed(2)})`;

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
            <CardTitle>Controle de Uso - Todos os Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum usuário encontrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Data Cadastro</th>
                        <th className="text-center p-2">Premium</th>
                        <th className="text-center p-2">Jogo 1</th>
                        <th className="text-center p-2">Jogo 2</th>
                        <th className="text-center p-2">Jogo 3</th>
                        <th className="text-center p-2">Jogo 4</th>
                        <th className="text-center p-2">Total</th>
                        <th className="text-left p-2">Último Acesso</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const totalCount = user.jogo1_count + user.jogo2_count + user.jogo3_count + user.jogo4_count;
                        return (
                          <tr key={user.user_id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{user.email}</td>
                            <td className="p-2 text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-2 text-center">
                              {user.is_premium ? (
                                <span className="text-primary font-semibold">✓</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2 text-center font-mono">{user.jogo1_count}</td>
                            <td className="p-2 text-center font-mono">{user.jogo2_count}</td>
                            <td className="p-2 text-center font-mono">{user.jogo3_count}</td>
                            <td className="p-2 text-center font-mono">{user.jogo4_count}</td>
                            <td className="p-2 text-center font-mono font-bold">{totalCount}</td>
                            <td className="p-2 text-muted-foreground">
                              {user.last_accessed_at 
                                ? new Date(user.last_accessed_at).toLocaleDateString('pt-BR') 
                                : 'Nunca'}
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetAllCounts(user.user_id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Resetar
                              </Button>
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

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Cupons resgatados</CardTitle>
              <p className="text-sm text-muted-foreground">Visualize todos os códigos promocionais e seus resgates.</p>
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
            {couponRedemptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum resgate registrado até o momento.
              </p>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4 text-right">{redemptionSummary}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cupom</th>
                        <th className="text-left p-2">Influencer</th>
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Horário</th>
                        <th className="text-right p-2">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRedemptions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            Nenhum resgate encontrado para o filtro selecionado.
                          </td>
                        </tr>
                      ) : (
                        filteredRedemptions.map((entry) => {
                          const redeemedDate = new Date(entry.redeemed_at);
                          return (
                            <tr key={entry.id} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-mono text-xs">{entry.coupon_code}</td>
                              <td className="p-2">{entry.influencer_email}</td>
                              <td className="p-2">{redeemedDate.toLocaleDateString('pt-BR')}</td>
                              <td className="p-2">{redeemedDate.toLocaleTimeString('pt-BR')}</td>
                              <td className="p-2 text-right font-semibold">R$ {entry.amount.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
