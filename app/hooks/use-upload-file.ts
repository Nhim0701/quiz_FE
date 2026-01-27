import { API_CONFIG } from "@/constants";
import { apiClient } from "@/lib";
import { UPLOAD_FILE_CONSTANTS } from "@/modules/user/modules/tests/constants";
import type { ApiSuccessResponse } from "@/types";
import axios from "axios";
import { useState } from "react";

interface UploadFileResponse {
  url: string;        // Presigned URL for uploading to S3
  publicUrl: string;  // CloudFront URL for accessing the file
  key: string;
  expiresIn: number;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  headers?: Record<string, string>;
  onUploadBegin?: (fileName: string) => void;
  onUploadProgress?: (progress: { progress: number }) => void;
  skipPolling?: boolean;
}

interface UploadedFile {
  key: string; // Unique identifier
  url: string; // Public URL of the uploaded file
  name: string; // Original filename
  size: number; // File size in bytes
  type: string; // MIME type
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      // Get presigned URL and final URL from your backend
      const response = await apiClient.post<
        ApiSuccessResponse<UploadFileResponse>
      >(API_CONFIG.UPLOAD_FILE, {
        content_type: file.type,
        expires_in: 3600,
        filename: file.name,
        prefix: UPLOAD_FILE_CONSTANTS.PREFIX,
      });

      // Upload to S3 using presigned URL
      await axios.put(response.data.data.url, file, {
        headers: { "content-type": file.type },
        onUploadProgress: (progressEvent) => {
          const progress =
            (progressEvent.loaded / (progressEvent.total || 1)) * 100;
          setProgress(progress);
          onUploadProgress?.({ progress });
        },
      });

      const uploadedFile = {
        key: response.data.data.key,
        url: response.data.data.publicUrl, // Use CloudFront URL for display
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(uploadedFile);
      onUploadComplete?.(uploadedFile);

      return uploadedFile;
    } catch (error) {
      onUploadError?.(error);
      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadFile,
    uploadedFile,
    uploadingFile,
  };
}
