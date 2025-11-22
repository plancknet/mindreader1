import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Redemption {
  redeemed_at: string;
  amount: number;
}

const InfluencerDashboard = () => {
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('subscription_tier, subscription_status, coupon_generated, coupon_code')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile || profile.subscription_tier !== 'INFLUENCER') {
          toast.error('Somente influenciadores podem acessar esta página.');
          navigate('/game-selector');
          return;
        }

        if (profile.subscription_status !== 'active') {
          toast.error('Sua assinatura Influencer está inativa.');
          navigate('/premium');
          return;
        }

        setCouponCode(profile.coupon_code ?? null);

        // TODO: Implementar tabela coupon_redemptions quando houver integração com Stripe
        // Por enquanto, apenas simulamos dados vazios
        setRedemptions([]);
      } catch (error) {
        console.error('Erro ao carregar dados do influencer', error);
        toast.error('Não foi possível carregar o painel.');
        navigate('/game-selector');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const revenueSummary = useMemo(() => {
    const daily: Record<string, number> = {};
    const monthly: Record<string, number> = {};

    redemptions.forEach((redemption) => {
      const date = new Date(redemption.redeemed_at);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      daily[dayKey] = (daily[dayKey] || 0) + 1;
      monthly[monthKey] = (monthly[monthKey] || 0) + 1;
    });

    return {
      daily,
      monthly,
      total: redemptions.length,
      totalRevenue: redemptions.length * 6,
    };
  }, [redemptions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <HeaderControls />

        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">Influencer</p>
            <h1 className="text-3xl font-bold">Painel de cupons</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/influencer/coupon')}>
            Atualizar cupom
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Cupom ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-[0.4em]">{couponCode}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Resgates totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{revenueSummary.total}</p>
              <p className="text-sm text-muted-foreground">R$ {(revenueSummary.total * 6).toFixed(2)} já disponíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Último resgate</CardTitle>
            </CardHeader>
            <CardContent>
              {redemptions[0] ? (
                <>
                  <p className="text-lg font-semibold">
                    {new Date(redemptions[0].redeemed_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">+ R$ 6,00</p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Sem registros ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo diário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.keys(revenueSummary.daily).length === 0 && (
                <p className="text-muted-foreground">Nenhum resgate registrado.</p>
              )}
              {Object.entries(revenueSummary.daily).map(([day, count]) => (
                <div key={day} className="flex justify-between">
                  <span>{new Date(day).toLocaleDateString('pt-BR')}</span>
                  <span>{count} cupons</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumo mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.keys(revenueSummary.monthly).length === 0 && (
                <p className="text-muted-foreground">Nenhum resgate registrado.</p>
              )}
              {Object.entries(revenueSummary.monthly).map(([month, count]) => (
                <div key={month} className="flex justify-between">
                  <span>
                    {month.split('-').reverse().join('/')}
                  </span>
                  <span>
                    {count} cupons • R$ {(count * 6).toFixed(2)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resgates recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum resgate registrado ainda.
                    </TableCell>
                  </TableRow>
                )}
                {redemptions.map((redemption) => {
                  const date = new Date(redemption.redeemed_at);
                  return (
                    <TableRow key={redemption.redeemed_at + Math.random()}>
                      <TableCell>{date.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{date.toLocaleTimeString('pt-BR')}</TableCell>
                      <TableCell className="text-right">R$ {(redemption.amount || 6).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
