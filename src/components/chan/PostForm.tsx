import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChanContext } from '@/hooks/useChanContext';
import { useCreateThread, useCreateReply } from '@/hooks/useCreateThread';
import { useChanUploadFile } from '@/hooks/useChanUploadFile';
import { eventIdToPostNumber } from '@/lib/postNumber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImagePlus, X } from 'lucide-react';

interface PostFormProps {
  boardId: string;
  mode: 'thread' | 'reply';
  threadId?: string;
  threadPubkey?: string;
}

export function PostForm({ boardId, mode, threadId, threadPubkey }: PostFormProps) {
  const navigate = useNavigate();
  const { getActivePubkey, identityMode } = useChanContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(mode === 'thread');

  const { mutateAsync: uploadFile, isPending: isUploading } = useChanUploadFile();
  const { mutateAsync: createThread, isPending: isCreatingThread } = useCreateThread();
  const { mutateAsync: createReply, isPending: isCreatingReply } = useCreateReply();

  const isSubmitting = isUploading || isCreatingThread || isCreatingReply;
  const activePubkey = getActivePubkey();
  const shortPubkey = activePubkey ? eventIdToPostNumber(activePubkey) : '???';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[PostForm] Starting submission', { mode, boardId, hasFile: !!selectedFile });

    if (!content.trim() && mode === 'reply') {
      alert('Please enter a message');
      return;
    }

    if (mode === 'thread' && !selectedFile) {
      alert('Image is required for new threads');
      return;
    }

    try {
      console.log('[PostForm] Active signer check:', {
        hasActivePubkey: !!activePubkey,
        activePubkey
      });
      let imageUrl: string | undefined;
      let imageMimeType: string | undefined;
      let imageDimensions: { width: number; height: number } | undefined;
      let imageHash: string | undefined;

      // Upload image if selected
      if (selectedFile) {
        console.log('[PostForm] Uploading file:', selectedFile.name);
        const tags = await uploadFile(selectedFile);
        console.log('[PostForm] Upload successful, tags:', tags);

        // Parse uploaded file tags
        for (const tag of tags) {
          if (tag[0] === 'url') {
            imageUrl = tag[1];
          } else if (tag[0] === 'm') {
            imageMimeType = tag[1];
          } else if (tag[0] === 'dim') {
            const dims = tag[1].split('x');
            if (dims.length === 2) {
              imageDimensions = {
                width: parseInt(dims[0], 10),
                height: parseInt(dims[1], 10),
              };
            }
          } else if (tag[0] === 'x') {
            imageHash = tag[1];
          }
        }
        console.log('[PostForm] Parsed image data:', { imageUrl, imageMimeType, imageDimensions });
      }

      if (mode === 'thread') {
        if (!imageUrl || !imageMimeType) {
          throw new Error('Failed to upload image');
        }

        console.log('[PostForm] Creating thread with:', { boardId, title: subject, imageUrl });
        const event = await createThread({
          boardId,
          title: subject,
          content: content.trim(),
          imageUrl,
          imageMimeType,
          imageDimensions,
          imageHash,
        });
        console.log('[PostForm] Thread created:', event.id, event);

        // Navigate to new thread
        console.log('[PostForm] Navigating to thread:', `/${boardId}/thread/${event.id}`);
        navigate(`/${boardId}/thread/${event.id}`);
      } else {
        if (!threadId || !threadPubkey) {
          throw new Error('Thread information missing');
        }

        await createReply({
          threadId,
          threadPubkey,
          content: content.trim(),
          imageUrl,
          imageMimeType,
          imageDimensions,
          imageHash,
        });

        // Clear form
        setContent('');
        clearFile();
      }
    } catch (error) {
      console.error('[PostForm] Post failed:', error);
      console.error('[PostForm] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      alert(`Failed to post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (mode === 'reply' && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-chan-link hover:text-chan-link-hover text-sm"
      >
        [Post a Reply]
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="chan-form">
      <div className="text-xs text-chan-text-muted mb-2">
        Posting as: <span className="font-medium">{identityMode === 'anon' ? 'Anonymous' : 'Logged In'}</span>
        {' (ID: '}{shortPubkey}{')'}
      </div>

      <table className="border-separate border-spacing-1">
        <tbody>
          {/* Subject (thread only) */}
          {mode === 'thread' && (
            <tr>
              <td className="text-right text-sm">Subject</td>
              <td>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Thread subject"
                  className="bg-chan-input-bg border-chan-input-border h-8 text-sm w-64"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          )}

          {/* Comment */}
          <tr>
            <td className="text-right text-sm align-top pt-2">Comment</td>
            <td>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={mode === 'thread' ? 'Thread content...' : 'Reply...'}
                className="bg-chan-input-bg border-chan-input-border text-sm min-h-[100px] w-64 sm:w-96"
                disabled={isSubmitting}
              />
            </td>
          </tr>

          {/* File */}
          <tr>
            <td className="text-right text-sm">File</td>
            <td>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="bg-chan-button-bg border-chan-button-border text-xs"
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  {selectedFile ? 'Change' : 'Choose File'}
                </Button>
                {selectedFile && (
                  <span className="text-xs text-chan-text-muted flex items-center gap-1">
                    {selectedFile.name.slice(0, 20)}
                    {selectedFile.name.length > 20 && '...'}
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-chan-link-hover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {mode === 'thread' && !selectedFile && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>
            </td>
          </tr>

          {/* Preview */}
          {previewUrl && (
            <tr>
              <td></td>
              <td>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-[150px] max-h-[150px] border border-chan-post-border mt-1"
                />
              </td>
            </tr>
          )}

          {/* Submit */}
          <tr>
            <td></td>
            <td>
              <Button
                type="submit"
                disabled={isSubmitting || (mode === 'thread' && !selectedFile)}
                className="bg-chan-button-bg border border-chan-button-border text-chan-text hover:bg-chan-bg-alt text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Posting...'}
                  </>
                ) : mode === 'thread' ? (
                  'Create Thread'
                ) : (
                  'Post Reply'
                )}
              </Button>
              {mode === 'reply' && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="ml-2 text-xs text-chan-link hover:text-chan-link-hover"
                >
                  [Close]
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
}
