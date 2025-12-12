import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@/hooks/useNostr';
import { getBoardById, type BoardConfig } from '@/lib/boards';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ThreadWithMeta {
  event: NostrEvent;
  title: string;
  imageUrl: string | null;
  imageDimensions: { width: number; height: number } | null;
  replyCount: number;
  lastActivity: number;
}

interface UseThreadsOptions {
  limit?: number;
}

/**
 * Fetch threads (Kind 20 Picture events) for a board.
 * Threads are sorted by most recent activity (bump order).
 */
export function useThreads(boardId: string, options: UseThreadsOptions = {}) {
  const { nostr } = useNostr();
  const { limit = 50 } = options;

  const board = getBoardById(boardId);

  return useQuery({
    queryKey: ['threads', boardId, limit],
    enabled: !!board,
    queryFn: async ({ signal }) => {
      if (!board) return [];

      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(10000)]);

      console.log('[useThreads] Fetching threads for board:', board.id, 'hashtag:', board.hashtag);

      let threads: NostrEvent[];
      try {
        // Fetch Kind 1 (Text Note) events with the board's hashtag
        threads = await nostr.query(
          [
            {
              kinds: [1],
              '#t': [board.hashtag],
              limit,
            },
          ],
          { signal: abortSignal }
        );
        console.log('[useThreads] Got', threads.length, 'threads from relays');
      } catch (error) {
        console.error('[useThreads] Error fetching threads:', error);
        throw error;
      }

      // Parse thread metadata
      const threadsWithMeta: ThreadWithMeta[] = threads.map((event) => {
        // Support both 'subject' (NIP-14) and legacy 'title' tags
        const title = event.tags.find(([name]) => name === 'subject')?.[1]
          ?? event.tags.find(([name]) => name === 'title')?.[1]
          ?? '';
        const imeta = event.tags.find(([name]) => name === 'imeta');

        let imageUrl: string | null = null;
        let imageDimensions: { width: number; height: number } | null = null;

        if (imeta) {
          // Parse imeta tag: ["imeta", "url https://...", "dim 800x600", ...]
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

        return {
          event,
          title,
          imageUrl,
          imageDimensions,
          replyCount: 0, // Will be updated separately
          lastActivity: event.created_at,
        };
      });

      // Fetch reply counts for each thread
      const threadIds = threadsWithMeta.map((t) => t.event.id);
      if (threadIds.length > 0) {
        const replies = await nostr.query(
          [
            {
              kinds: [1111],
              '#E': threadIds,
            },
          ],
          { signal: abortSignal }
        );

        // Count replies and find last activity per thread
        const replyCountMap = new Map<string, number>();
        const lastActivityMap = new Map<string, number>();

        for (const reply of replies) {
          const rootId = reply.tags.find(([name]) => name === 'E')?.[1];
          if (rootId) {
            replyCountMap.set(rootId, (replyCountMap.get(rootId) ?? 0) + 1);
            const current = lastActivityMap.get(rootId) ?? 0;
            if (reply.created_at > current) {
              lastActivityMap.set(rootId, reply.created_at);
            }
          }
        }

        // Update thread metadata
        for (const thread of threadsWithMeta) {
          thread.replyCount = replyCountMap.get(thread.event.id) ?? 0;
          const lastReply = lastActivityMap.get(thread.event.id);
          if (lastReply && lastReply > thread.lastActivity) {
            thread.lastActivity = lastReply;
          }
        }
      }

      // Sort by bump order (most recent activity first)
      threadsWithMeta.sort((a, b) => b.lastActivity - a.lastActivity);

      return threadsWithMeta;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useBoard(boardId: string): BoardConfig | undefined {
  return getBoardById(boardId);
}
