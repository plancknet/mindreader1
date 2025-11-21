import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'FREE' | 'STANDARD' | 'INFLUENCER';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | string;

interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  couponGenerated: boolean;
}

export const useSubscriptionTier = () => {
  const [info, setInfo] = useState<SubscriptionInfo>({
    tier: 'FREE',
    status: 'inactive',
    couponGenerated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInfo({
            tier: 'FREE',
            status: 'inactive',
            couponGenerated: false,
          });
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('subscription_tier, subscription_status, coupon_generated')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch subscription tier', error);
          setInfo({
            tier: 'FREE',
            status: 'inactive',
            couponGenerated: false,
          });
          return;
        }

        setInfo({
          tier: (data?.subscription_tier as SubscriptionTier) ?? 'FREE',
          status: (data?.subscription_status as SubscriptionStatus) ?? 'inactive',
          couponGenerated: Boolean(data?.coupon_generated),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, []);

  return { ...info, loading };
};
