interface ImageViewerProps {
  src: string;
  alt: string;
  dimensions?: { width: number; height: number } | null;
  expanded: boolean;
  onToggle: () => void;
  isOP?: boolean;
}

export function ImageViewer({
  src,
  alt,
  dimensions,
  expanded,
  onToggle,
  isOP = false,
}: ImageViewerProps) {
  const thumbnailMaxWidth = isOP ? 250 : 125;
  const thumbnailMaxHeight = isOP ? 250 : 125;

  // Calculate thumbnail dimensions maintaining aspect ratio
  let thumbWidth = thumbnailMaxWidth;
  let thumbHeight = thumbnailMaxHeight;

  if (dimensions) {
    const aspectRatio = dimensions.width / dimensions.height;
    if (aspectRatio > 1) {
      // Wider than tall
      thumbHeight = Math.min(thumbnailMaxHeight, thumbnailMaxWidth / aspectRatio);
      thumbWidth = thumbHeight * aspectRatio;
    } else {
      // Taller than wide
      thumbWidth = Math.min(thumbnailMaxWidth, thumbnailMaxHeight * aspectRatio);
      thumbHeight = thumbWidth / aspectRatio;
    }
  }

  return (
    <div className="inline-block">
      {/* File info */}
      <div className="chan-fileinfo mb-1">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-chan-link hover:text-chan-link-hover"
        >
          {dimensions ? `${dimensions.width}x${dimensions.height}` : 'View'}
        </a>
        {' - '}
        <button
          onClick={onToggle}
          className="text-chan-link hover:text-chan-link-hover"
        >
          [{expanded ? 'Collapse' : 'Expand'}]
        </button>
      </div>

      {/* Image */}
      <button onClick={onToggle} className="block">
        <img
          src={src}
          alt={alt}
          className="border border-chan-post-border cursor-pointer"
          style={
            expanded
              ? { maxWidth: '100%', maxHeight: '80vh' }
              : { width: thumbWidth, height: thumbHeight, objectFit: 'cover' }
          }
          loading="lazy"
        />
      </button>
    </div>
  );
}
