import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isGreentext, parseQuoteRefs } from '@/lib/greentext';

interface PostContentProps {
  content: string;
  postNumberMap: Map<string, string>;
  boardId: string;
}

export function PostContent({ content, postNumberMap, boardId }: PostContentProps) {
  const rendered = useMemo(() => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        elements.push(<br key={`br-${lineIndex}`} />);
      }

      // Check if line is greentext
      const isGreen = isGreentext(line);

      // Parse quote references in the line
      const parts = parseQuoteRefs(line);

      const lineElements = parts.map((part, partIndex) => {
        if (part.type === 'quote') {
          // This is a >>12345678 reference
          const postNum = part.content.slice(2); // Remove >>
          const eventId = postNumberMap.get(postNum);

          if (eventId) {
            return (
              <Link
                key={`${lineIndex}-${partIndex}`}
                to={`/${boardId}/thread/${eventId}#p${postNum}`}
                className="chan-quotelink"
                onClick={(e) => {
                  // If same page, scroll to post
                  const element = document.getElementById(`p${postNum}`);
                  if (element) {
                    e.preventDefault();
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight');
                    setTimeout(() => element.classList.remove('highlight'), 2000);
                  }
                }}
              >
                {part.content}
              </Link>
            );
          } else {
            // Dead link - post not found
            return (
              <span key={`${lineIndex}-${partIndex}`} className="chan-deadlink">
                {part.content}
              </span>
            );
          }
        } else {
          // Regular text - check for URLs
          return renderTextWithLinks(part.content, `${lineIndex}-${partIndex}`);
        }
      });

      if (isGreen) {
        elements.push(
          <span key={`line-${lineIndex}`} className="chan-greentext">
            {lineElements}
          </span>
        );
      } else {
        elements.push(...lineElements);
      }
    });

    return elements;
  }, [content, postNumberMap, boardId]);

  return (
    <div className="whitespace-pre-wrap break-words">
      {rendered}
    </div>
  );
}

// Helper to render text with clickable URLs
function renderTextWithLinks(text: string, keyPrefix: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Reset regex lastIndex
      urlRegex.lastIndex = 0;
      return (
        <a
          key={`${keyPrefix}-url-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-chan-link hover:text-chan-link-hover underline"
        >
          {part.length > 50 ? part.slice(0, 50) + '...' : part}
        </a>
      );
    }
    return part;
  });
}
