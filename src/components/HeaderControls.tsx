import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { cn } from '@/lib/utils';

interface HeaderControlsProps {
  className?: string;
}

export const HeaderControls = ({ className }: HeaderControlsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();
  const { tier, status } = useSubscriptionTier();

  const adminLabel = t('common.admin');
  const showCoupons = isAdmin || (tier === 'INFLUENCER' && status === 'active');

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/game-selector')}
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </Button>
      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="font-medium"
        >
          {adminLabel === 'common.admin' ? 'Admin' : adminLabel}
        </Button>
      )}
      {showCoupons && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/influencer/coupon')}
          className="font-medium"
        >
          Cupons
        </Button>
      )}
      <LanguageSelector />
      <LogoutButton />
    </div>
  );
};
