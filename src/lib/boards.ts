// 21chan board configuration

export interface BoardConfig {
  id: string;
  name: string;
  description: string;
  hashtag: string;
  nsfw: boolean;
  icon: string;
}

export const BOARDS: BoardConfig[] = [
  // Bitcoin-focused boards
  {
    id: 'btc',
    name: 'Bitcoin',
    description: 'Bitcoin discussion and news',
    hashtag: '21chan-btc',
    nsfw: false,
    icon: '₿',
  },
  {
    id: 'ln',
    name: 'Lightning',
    description: 'Lightning Network and L2 solutions',
    hashtag: '21chan-ln',
    nsfw: false,
    icon: '⚡',
  },
  {
    id: 'biz',
    name: 'Business',
    description: 'Business and finance discussion',
    hashtag: '21chan-biz',
    nsfw: false,
    icon: '💼',
  },
  {
    id: 'tech',
    name: 'Technology',
    description: 'Technology and programming',
    hashtag: '21chan-tech',
    nsfw: false,
    icon: '💻',
  },
  // Classic boards
  {
    id: 'b',
    name: 'Random',
    description: 'The stories and information posted here are artistic works of fiction and falsehood. Only a fool would take anything posted here as fact.',
    hashtag: '21chan-b',
    nsfw: true,
    icon: '🎲',
  },
  {
    id: 'pol',
    name: 'Politically Incorrect',
    description: 'Political discussion and current events',
    hashtag: '21chan-pol',
    nsfw: false,
    icon: '🗳️',
  },
  {
    id: 'fit',
    name: 'Fitness',
    description: 'Health, fitness, and self-improvement',
    hashtag: '21chan-fit',
    nsfw: false,
    icon: '💪',
  },
  {
    id: 'lit',
    name: 'Literature',
    description: 'Books, writing, and philosophy',
    hashtag: '21chan-lit',
    nsfw: false,
    icon: '📚',
  },
  {
    id: 'mu',
    name: 'Music',
    description: 'Music discussion and sharing',
    hashtag: '21chan-mu',
    nsfw: false,
    icon: '🎵',
  },
  {
    id: 'v',
    name: 'Video Games',
    description: 'Video game discussion',
    hashtag: '21chan-v',
    nsfw: false,
    icon: '🎮',
  },
  {
    id: 'tv',
    name: 'Television & Film',
    description: 'Movies and television discussion',
    hashtag: '21chan-tv',
    nsfw: false,
    icon: '📺',
  },
  {
    id: 'x',
    name: 'Paranormal',
    description: 'Pair of normal discussions',
    hashtag: '21chan-x',
    nsfw: false,
    icon: '👽',
  },
];

export function getBoardById(id: string): BoardConfig | undefined {
  return BOARDS.find((board) => board.id === id);
}

export function getBoardByHashtag(hashtag: string): BoardConfig | undefined {
  return BOARDS.find((board) => board.hashtag === hashtag);
}

export function isValidBoardId(id: string): boolean {
  return BOARDS.some((board) => board.id === id);
}
