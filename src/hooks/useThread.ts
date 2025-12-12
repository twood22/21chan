import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@/hooks/useNostr';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ThreadData {
  op: NostrEvent;
  title: string;
  imageUrl: string | null;
  imageDimensions: { width: number; height: number } | null;
  replies: NostrEvent[];
  allEvents: NostrEvent[]; // OP + all replies for post number mapping
}

/**
 * Fetch a single thread with its OP and all replies.
 */
export function useThread(threadId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['thread', threadId],
    enabled: !!threadId,
    retry: 3, // Retry 3 times if thread not found (for relay propagation)
    retryDelay: 1000, // Wait 1 second between retries
    queryFn: async ({ signal }): Promise<ThreadData | null> => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(10000)]);

      console.log('[useThread] Fetching thread:', threadId);

      // Fetch the OP event
      let op: NostrEvent | undefined;
      try {
        [op] = await nostr.query(
          [
            {
              ids: [threadId],
              kinds: [1], // Standard text note
              limit: 1,
            },
          ],
          { signal: abortSignal }
        );
      } catch (error) {
        console.error('[useThread] Query error:', error);
        throw new Error('Failed to fetch thread');
      }

      console.log('[useThread] Query result:', op ? 'found' : 'not found', op);

      if (!op) {
        throw new Error('Thread not found'); // Throw to trigger retry
      }

      // Parse OP metadata - support both 'subject' (NIP-14) and legacy 'title'
      const title = op.tags.find(([name]) => name === 'subject')?.[1]
        ?? op.tags.find(([name]) => name === 'title')?.[1]
        ?? '';
      const imeta = op.tags.find(([name]) => name === 'imeta');

      let imageUrl: string | null = null;
      let imageDimensions: { width: number; height: number } | null = null;

      if (imeta) {
        for (const part of imeta.slice(1)) {
          if (part.startsWith('url ')) {
            imageUrl = part.slice(4);
          } else if (part.startsWith('dim ')) {
            const dims = part.slice(4).split('x');
            if (dims.length === 2) {
              imageDimensions = {
                width: parseInt(dims[0], 10),
                height: parseInt(dims[1], 10),
              };
            }
          }
        }
      }

      // Fetch all replies (Kind 1 notes referencing this thread via NIP-10 e tags)
      const replies = await nostr.query(
        [
          {
            kinds: [1],
            '#e': [threadId],
          },
        ],
        { signal: abortSignal }
      );

      // Sort replies by created_at (oldest first for traditional thread order)
      replies.sort((a, b) => a.created_at - b.created_at);

      // All events for post number mapping
      const allEvents = [op, ...replies];

      return {
        op,
        title,
        imageUrl,
        imageDimensions,
        replies,
        allEvents,
      };
    },
    staleTime: 30000,
  });
}
