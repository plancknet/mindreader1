import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeaderControls } from '@/components/HeaderControls';
import { z } from "zod";

const LandingSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const triggerCheckout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Faça login para prosseguir com o checkout");
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          planType: "STANDARD"
        }
      },
    );

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.assign(data.url);
    } else {
      throw new Error("URL de checkout indisponível");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    // Validate email and password with zod
    const authSchema = z.object({
      email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
      password: z.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .max(128, 'Senha muito longa')
        .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter letra minúscula')
        .regex(/[0-9]/, 'Senúmero'),
    });

    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }
      }

      await triggerCheckout();
    } catch (error: any) {
      const message = error?.message ?? "Não foi possível concluir o cadastro";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex items-center justify-center px-4 py-8 relative">
      <div className="fixed top-4 right-4 z-50">
        <HeaderControls />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Crie sua conta MindReader</CardTitle>
          <CardDescription>
            Cadastre-se rapidamente para liberar o checkout premium vitalício.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="você@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="********"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate("/landing")}
            disabled={isLoading}
          >
            Voltar para a oferta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingSignup;

