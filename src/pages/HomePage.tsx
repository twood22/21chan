import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { BOARDS } from '@/lib/boards';
import { BoardHeader } from '@/components/chan/BoardHeader';

export default function HomePage() {
  useSeoMeta({
    title: '21chan - Bitcoin Imageboard',
    description: 'A Bitcoin-focused imageboard powered by Nostr',
  });

  return (
    <div className="min-h-screen bg-chan-bg font-chan">
      <BoardHeader />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Logo and Title */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-chan-subject mb-2">
            21chan
          </h1>
          <p className="text-chan-text-muted text-sm">
            Bitcoin-focused imageboard powered by Nostr
          </p>
        </div>

        {/* Board List */}
        <div className="bg-chan-post-bg border border-chan-post-border p-4 mb-4">
          <h2 className="text-lg font-bold text-chan-subject mb-4 border-b border-chan-post-border pb-2">
            Boards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARDS.map((board) => (
              <Link
                key={board.id}
                to={`/${board.id}`}
                className="block p-3 border border-chan-post-border hover:bg-chan-bg-alt transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{board.icon}</span>
                  <span className="font-bold text-chan-link hover:text-chan-link-hover">
                    /{board.id}/ - {board.name}
                  </span>
                </div>
                <p className="text-sm text-chan-text-muted">
                  {board.description}
                </p>
                {board.nsfw && (
                  <span className="inline-block mt-1 text-xs bg-red-500 text-white px-1 rounded">
                    NSFW
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-chan-post-bg border border-chan-post-border p-4 text-sm">
          <h3 className="font-bold text-chan-subject mb-2">About 21chan</h3>
          <ul className="list-disc list-inside space-y-1 text-chan-text">
            <li>All posts are stored on the Nostr network</li>
            <li>Post anonymously by default, or use your Nostr identity</li>
            <li>Tip posts with Lightning via Zaps</li>
            <li>Images required for new threads</li>
            <li className="text-chan-quote">&gt;greentext supported</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-chan-text-muted">
          <p>Powered by Nostr | Kind 1 Notes | NIP-22 Comments</p>
        </div>
      </div>
    </div>
  );
}
