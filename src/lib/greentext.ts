import type { ReactNode } from 'react';
import { createElement } from 'react';

/**
 * Check if a line is greentext (starts with > but not >>)
 */
export function isGreentext(line: string): boolean {
  return line.startsWith('>') && !line.startsWith('>>');
}

/**
 * Check if text contains a quote reference (>>12345678)
 */
export function isQuoteRef(text: string): boolean {
  return /^>>\d{6,8}$/.test(text);
}

/**
 * Parse content and identify greentext lines.
 * Returns an array of { text, isGreen } objects.
 */
export function parseGreentext(content: string): Array<{
  text: string;
  isGreen: boolean;
  isQuoteRef: boolean;
}> {
  const lines = content.split('\n');
  return lines.map((line) => ({
    text: line,
    isGreen: isGreentext(line),
    isQuoteRef: false, // Quote refs are handled separately in PostContent
  }));
}

/**
 * Render content with greentext highlighting.
 * Lines starting with > (but not >>) are styled green.
 */
export function renderGreentext(content: string): ReactNode[] {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      elements.push(createElement('br', { key: `br-${index}` }));
    }

    if (isGreentext(line)) {
      elements.push(
        createElement(
          'span',
          {
            key: `line-${index}`,
            className: 'chan-greentext',
          },
          line
        )
      );
    } else {
      elements.push(line);
    }
  });

  return elements;
}

/**
 * Parse quote references from a line of text.
 * Returns array of { type: 'text' | 'quote', content: string }
 */
export function parseQuoteRefs(
  line: string
): Array<{ type: 'text' | 'quote'; content: string }> {
  const parts: Array<{ type: 'text' | 'quote'; content: string }> = [];
  const regex = /(>>\d{6,8})/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: line.slice(lastIndex, match.index),
      });
    }
    // Add the quote reference
    parts.push({
      type: 'quote',
      content: match[1],
    });
    lastIndex = match.index + match[1].length;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    parts.push({
      type: 'text',
      content: line.slice(lastIndex),
    });
  }

  return parts;
}
