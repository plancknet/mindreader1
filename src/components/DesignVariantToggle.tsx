import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useGlobalDesign } from '@/hooks/useGlobalDesign';

export const DesignVariantToggle = () => {
  const { designVariant, setDesignVariant } = useGlobalDesign();

  const toggle = () => setDesignVariant(designVariant === 'noir' ? 'classic' : 'noir');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-1.5 font-medium"
      title="Alternar design global (Admin)"
    >
      <Sparkles className="h-4 w-4" />
      {designVariant === 'noir' ? 'Noir' : 'Clássico'}
    </Button>
  );
};