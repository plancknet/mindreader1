import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'FREE' | 'STANDARD' | 'INFLUENCER';

export const useSubscriptionTier = () => {
  const [tier, setTier] = useState<SubscriptionTier>('FREE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTier('FREE');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch subscription tier', error);
          setTier('FREE');
          return;
        }

        const value = (data?.subscription_tier as SubscriptionTier) ?? 'FREE';
        setTier(value);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, []);

  return { tier, loading };
};
