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
  usage_count: number;
  is_premium: boolean;
  created_at: string;
  email?: string;
}

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUsageCount, setNewUsageCount] = useState<number>(0);

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
        .from('premium_users')
        .select('user_id, usage_count, is_premium, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch emails from auth.users metadata
      const usersWithEmails = await Promise.all(
        (data || []).map(async (user) => {
          const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.user_id);
          return {
            ...user,
            email: authUser?.email || 'N/A',
          };
        })
      );

      setUsers(usersWithEmails);
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

  const handleUpdateUsageCount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('premium_users')
        .update({ usage_count: newUsageCount })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Contador atualizado com sucesso!',
      });

      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating usage count:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o contador.',
        variant: 'destructive',
      });
    }
  };

  const handleResetUsageCount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('premium_users')
        .update({ usage_count: 0 })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Contador resetado com sucesso!',
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error resetting usage count:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar o contador.',
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
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Uso</th>
                        <th className="text-left p-2">Premium</th>
                        <th className="text-left p-2">Cadastro</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.user_id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">{user.email}</td>
                          <td className="p-2">
                            {editingUserId === user.user_id ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  value={newUsageCount}
                                  onChange={(e) => setNewUsageCount(parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateUsageCount(user.user_id)}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setEditingUserId(user.user_id);
                                  setNewUsageCount(user.usage_count);
                                }}
                              >
                                {user.usage_count}
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            {user.is_premium ? (
                              <span className="text-primary font-semibold">✓ Sim</span>
                            ) : (
                              <span className="text-muted-foreground">Não</span>
                            )}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetUsageCount(user.user_id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Resetar
                            </Button>
                          </td>
                        </tr>
                      ))}
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
