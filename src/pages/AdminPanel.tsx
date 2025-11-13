import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Crown, RefreshCw } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';

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

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

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

      fetchUsers();
    } catch (error: any) {
      console.error('Error resetting counts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar os contadores.',
        variant: 'destructive',
      });
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <LogoutButton />
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
      </div>
    </div>
  );
}
