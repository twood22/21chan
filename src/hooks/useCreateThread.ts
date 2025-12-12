import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@/hooks/useNostr';
import { useChanContext } from '@/hooks/useChanContext';
import { getBoardById } from '@/lib/boards';
import type { NostrEvent } from '@nostrify/nostrify';
import type { ThreadWithMeta } from '@/hooks/useThreads';

interface CreateThreadParams {
  boardId: string;
  title: string;
  content: string;
  imageUrl: string;
  imageMimeType: string;
  imageDimensions?: { width: number; height: number };
  imageHash?: string;
}

/**
 * Create a new thread (Kind 20 Picture event) on a board.
 */
export function useCreateThread() {
  const { nostr } = useNostr();
  const { getActiveSigner } = useChanContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      title,
      content,
      imageUrl,
      imageMimeType,
      imageDimensions,
      imageHash,
    }: CreateThreadParams): Promise<NostrEvent> => {
      const signer = getActiveSigner();
      if (!signer) {
        throw new Error('No signer available');
      }

      const board = getBoardById(boardId);
      if (!board) {
        throw new Error(`Invalid board: ${boardId}`);
      }

      // Build imeta tag
      const imetaParts = [`url ${imageUrl}`, `m ${imageMimeType}`];
      if (imageDimensions) {
        imetaParts.push(`dim ${imageDimensions.width}x${imageDimensions.height}`);
      }
      if (imageHash) {
        imetaParts.push(`x ${imageHash}`);
      }

      const tags: string[][] = [
        ['subject', title], // NIP-14 subject tag for threads
        ['imeta', ...imetaParts],
        ['t', board.hashtag],
        ['client', '21chan'],
      ];

      // Include image URL and board tag in content for visibility in other clients
      const boardTag = `[/${board.id}/ - 21chan]`;
      const fullContent = content
        ? `${content}\n\n${imageUrl}\n\n${boardTag}`
        : `${imageUrl}\n\n${boardTag}`;

      console.log('[useCreateThread] Signing event with tags:', tags);
      const event = await signer.signEvent({
        kind: 1, // Standard text note for maximum compatibility
        content: fullContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      console.log('[useCreateThread] Event signed:', event.id);

      // Publish to relays
      console.log('[useCreateThread] Publishing to relays...');
      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      console.log('[useCreateThread] Event published successfully');

      return event;
    },
    onSuccess: (event, { boardId, title, imageUrl, imageDimensions }) => {
      // Optimistically add the new thread to the cache
      // This ensures it shows up immediately even before relays confirm
      const newThread: ThreadWithMeta = {
        event,
        title,
        imageUrl,
        imageDimensions: imageDimensions ?? null,
        replyCount: 0,
        lastActivity: event.created_at,
      };

      // Update the threads cache for this board
      queryClient.setQueryData<ThreadWithMeta[]>(
        ['threads', boardId, 50], // Match the default limit
        (oldData) => {
          if (!oldData) return [newThread];
          // Add new thread at the beginning (most recent)
          return [newThread, ...oldData];
        }
      );

      // Also set the individual thread cache so ThreadPage can find it
      queryClient.setQueryData(['thread', event.id], {
        op: event,
        title,
        imageUrl,
        imageDimensions: imageDimensions ?? null,
        replies: [],
        allEvents: [event],
      });

      // Invalidate after a delay to get fresh data from relays
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['threads', boardId] });
      }, 2000);
    },
  });
}

interface CreateReplyParams {
  boardId: string;
  threadId: string;
  threadPubkey: string;
  content: string;
  imageUrl?: string;
  imageMimeType?: string;
  imageDimensions?: { width: number; height: number };
  imageHash?: string;
  replyToId?: string;
  replyToPubkey?: string;
}

/**
 * Create a reply (Kind 1111 Comment) to a thread.
 */
export function useCreateReply() {
  const { nostr } = useNostr();
  const { getActiveSigner } = useChanContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      threadId,
      threadPubkey,
      content,
      imageUrl,
      imageMimeType,
      imageDimensions,
      imageHash,
      replyToId,
      replyToPubkey,
    }: CreateReplyParams): Promise<NostrEvent> => {
      const signer = getActiveSigner();
      if (!signer) {
        throw new Error('No signer available');
      }

      // Use NIP-10 standard threading tags for maximum compatibility
      const tags: string[][] = [
        // Root reference (the original thread OP)
        ['e', threadId, '', 'root'],
        // Reply reference (what we're directly replying to)
        ['e', replyToId ?? threadId, '', replyToId ? 'reply' : 'root'],
        // Tag the thread author
        ['p', threadPubkey],
        ['client', '21chan'],
      ];

      // Tag the reply author if replying to a specific reply
      if (replyToPubkey && replyToPubkey !== threadPubkey) {
        tags.push(['p', replyToPubkey]);
      }

      // Add image if provided
      if (imageUrl && imageMimeType) {
        const imetaParts = [`url ${imageUrl}`, `m ${imageMimeType}`];
        if (imageDimensions) {
          imetaParts.push(`dim ${imageDimensions.width}x${imageDimensions.height}`);
        }
        if (imageHash) {
          imetaParts.push(`x ${imageHash}`);
        }
        tags.push(['imeta', ...imetaParts]);
      }

      // Include image URL and board tag in content for visibility in other clients
      const boardTag = `[/${boardId}/ - 21chan]`;
      let fullContent = content;
      if (imageUrl) {
        fullContent = content ? `${content}\n\n${imageUrl}` : imageUrl;
      }
      fullContent = fullContent ? `${fullContent}\n\n${boardTag}` : boardTag;

      const event = await signer.signEvent({
        kind: 1, // Standard text note for maximum compatibility
        content: fullContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Publish to relays
      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      return event;
    },
    onSuccess: (_, { threadId }) => {
      // Invalidate thread data
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
    },
  });
}
