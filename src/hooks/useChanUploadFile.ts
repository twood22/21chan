import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';
import { useChanContext } from "./useChanContext";

/**
 * Upload files using the active signer (ephemeral or logged-in).
 * This allows anonymous users to upload images.
 */
export function useChanUploadFile() {
  const { getActiveSigner } = useChanContext();

  return useMutation({
    mutationFn: async (file: File) => {
      const signer = getActiveSigner();
      
      if (!signer) {
        throw new Error('No signer available for upload');
      }

      const uploader = new BlossomUploader({
        servers: [
          'https://blossom.primal.net/',
        ],
        signer,
      });

      const tags = await uploader.upload(file);
      return tags;
    },
  });
}
