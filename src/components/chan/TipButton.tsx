import type { NostrEvent } from '@nostrify/nostrify';
import { Zap } from 'lucide-react';
import { ZapDialog } from '@/components/ZapDialog';
import { useZaps } from '@/hooks/useZaps';
import { useWallet } from '@/hooks/useWallet';
import type { Event } from 'nostr-tools';

interface TipButtonProps {
  event: NostrEvent;
}

export function TipButton({ event }: TipButtonProps) {
  const { webln, activeNWC } = useWallet();
  const { totalSats } = useZaps(event as Event, webln, activeNWC);

  const formatSats = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  return (
    <ZapDialog target={event as Event}>
      <button
        className="inline-flex items-center gap-1 text-chan-btc hover:text-chan-btc-dark transition-colors"
        title="Tip with Lightning"
      >
        <Zap className="w-3 h-3" />
        {totalSats > 0 && (
          <span className="chan-zap-count text-xs">
            {formatSats(totalSats)}
          </span>
        )}
      </button>
    </ZapDialog>
  );
}
