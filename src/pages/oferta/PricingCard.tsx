import { useState } from 'react';
import { Check, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  OFFER_ANCHOR_PRICES,
  OFFER_PRICES,
  currencyForLanguage,
  formatPrice,
  type OfferItem,
} from '@/lib/checkout';
import type { OfferCopy } from './copy';

interface PricingCardProps {
  copy: OfferCopy;
  language: string;
  loading: boolean;
  onBuy: (items: OfferItem[]) => void;
}

export const PricingCard = ({ copy, language, loading, onBuy }: PricingCardProps) => {
  const [withBump, setWithBump] = useState(false);
  const currency = currencyForLanguage(language);
  const main = OFFER_PRICES[currency].MAIN;
  const bump = OFFER_PRICES[currency].EJS2;
  const total = withBump ? main + bump : main;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-magic/30 bg-card p-6 shadow-magic sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-magic/20 blur-3xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magic">{copy.pricing.kicker}</p>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-lg text-muted-foreground line-through">
            {copy.pricing.from} {formatPrice(OFFER_ANCHOR_PRICES[currency], currency)}
          </span>
        </div>
        <div className="mt-1 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          {formatPrice(main, currency)}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{copy.pricing.once}</p>

        <ul className="mt-6 space-y-3">
          {copy.pricing.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-magic/15 text-magic">
                <Check className="h-3.5 w-3.5" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Order bump */}
        <label
          htmlFor="bump-ejs2"
          className={`mt-6 flex cursor-pointer gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors ${
            withBump ? 'border-magic bg-magic/10' : 'border-warning/60 bg-warning/5 hover:bg-warning/10'
          }`}
        >
          <Checkbox
            id="bump-ejs2"
            checked={withBump}
            onCheckedChange={(v) => setWithBump(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="block font-bold text-foreground">{copy.pricing.bumpTitle}</span>
            <span className="mt-1 block text-muted-foreground">
              {copy.pricing.bumpText}{' '}
              <span className="font-bold text-foreground">+{formatPrice(bump, currency)}</span>
            </span>
          </span>
        </label>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{copy.pricing.total}</span>
          <span className="text-xl font-bold text-foreground">{formatPrice(total, currency)}</span>
        </div>

        <Button
          size="lg"
          disabled={loading}
          onClick={() => onBuy(withBump ? ['MAIN', 'EJS2'] : ['MAIN'])}
          className="mt-4 h-14 w-full rounded-2xl bg-gradient-magic text-base font-bold text-magic-foreground shadow-magic transition-transform hover:scale-[1.02] hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {copy.pricing.loading}
            </>
          ) : withBump ? (
            copy.pricing.buyBump
          ) : (
            copy.pricing.buy
          )}
        </Button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          {copy.pricing.secure}
        </p>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-2xl border border-success/30 bg-success/5 p-5">
        <ShieldCheck className="h-10 w-10 shrink-0 text-success" />
        <div>
          <p className="font-bold text-foreground">{copy.pricing.guaranteeTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.pricing.guaranteeText}</p>
        </div>
      </div>
    </div>
  );
};
