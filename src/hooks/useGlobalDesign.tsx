import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DesignVariant = 'classic' | 'noir';
export type ThemeMode = 'light' | 'dark';

interface GlobalDesignState {
  designVariant: DesignVariant;
  themeMode: ThemeMode;
  setDesignVariant: (v: DesignVariant) => Promise<void>;
  setThemeMode: (m: ThemeMode) => Promise<void>;
}

const DEFAULTS: { designVariant: DesignVariant; themeMode: ThemeMode } = {
  designVariant: 'classic',
  themeMode: 'light',
};

export const applyDesignClasses = (variant: DesignVariant, mode: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle('theme-noir', variant === 'noir');
  root.classList.toggle('dark', mode === 'dark');
};

const GlobalDesignContext = createContext<GlobalDesignState | null>(null);

export const GlobalDesignProvider = ({ children }: { children: ReactNode }) => {
  const [designVariant, setDesign] = useState<DesignVariant>(DEFAULTS.designVariant);
  const [themeMode, setMode] = useState<ThemeMode>(DEFAULTS.themeMode);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('design_variant, theme_mode')
        .limit(1)
        .maybeSingle();
      if (!mounted || !data) return;
      const v = (data.design_variant as DesignVariant) ?? DEFAULTS.designVariant;
      const m = (data.theme_mode as ThemeMode) ?? DEFAULTS.themeMode;
      setDesign(v);
      setMode(m);
      applyDesignClasses(v, m);
    };
    load();

    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload) => {
          const row = (payload.new ?? payload.old) as
            | { design_variant?: DesignVariant; theme_mode?: ThemeMode }
            | null;
          if (!row) return;
          const v = (row.design_variant as DesignVariant) ?? DEFAULTS.designVariant;
          const m = (row.theme_mode as ThemeMode) ?? DEFAULTS.themeMode;
          setDesign(v);
          setMode(m);
          applyDesignClasses(v, m);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const persist = async (patch: { design_variant?: DesignVariant; theme_mode?: ThemeMode }) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('app_settings')
      .update({ ...patch, updated_at: new Date().toISOString(), updated_by: user?.id ?? null })
      .eq('singleton', true);
  };

  const setDesignVariant = async (v: DesignVariant) => {
    setDesign(v);
    applyDesignClasses(v, themeMode);
    await persist({ design_variant: v });
  };

  const setThemeMode = async (m: ThemeMode) => {
    setMode(m);
    applyDesignClasses(designVariant, m);
    await persist({ theme_mode: m });
  };

  return (
    <GlobalDesignContext.Provider value={{ designVariant, themeMode, setDesignVariant, setThemeMode }}>
      {children}
    </GlobalDesignContext.Provider>
  );
};

export const useGlobalDesign = (): GlobalDesignState => {
  const ctx = useContext(GlobalDesignContext);
  if (!ctx) {
    return {
      designVariant: DEFAULTS.designVariant,
      themeMode: DEFAULTS.themeMode,
      setDesignVariant: async () => {},
      setThemeMode: async () => {},
    };
  }
  return ctx;
};