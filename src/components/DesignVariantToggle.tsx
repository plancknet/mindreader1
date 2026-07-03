import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type Variant = 'classic' | 'noir';

const STORAGE_KEY = 'design-variant';

const readVariant = (): Variant => {
  if (typeof window === 'undefined') return 'classic';
  return (localStorage.getItem(STORAGE_KEY) as Variant) === 'noir' ? 'noir' : 'classic';
};

const applyVariant = (variant: Variant) => {
  const root = document.documentElement;
  if (variant === 'noir') root.classList.add('theme-noir');
  else root.classList.remove('theme-noir');
};

export const DesignVariantToggle = () => {
  const [variant, setVariant] = useState<Variant>(readVariant);

  useEffect(() => {
    applyVariant(variant);
    try {
      localStorage.setItem(STORAGE_KEY, variant);
    } catch {}
  }, [variant]);

  const toggle = () => setVariant((v) => (v === 'noir' ? 'classic' : 'noir'));

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-1.5 font-medium"
      title="Alternar design (Admin)"
    >
      <Sparkles className="h-4 w-4" />
      {variant === 'noir' ? 'Noir' : 'Clássico'}
    </Button>
  );
};