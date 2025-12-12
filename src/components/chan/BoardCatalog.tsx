import { ThreadCard } from './ThreadCard';
import type { ThreadWithMeta } from '@/hooks/useThreads';

interface BoardCatalogProps {
  threads: ThreadWithMeta[];
  boardId: string;
}

export function BoardCatalog({ threads, boardId }: BoardCatalogProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.event.id}
          thread={thread}
          boardId={boardId}
        />
      ))}
    </div>
  );
}
