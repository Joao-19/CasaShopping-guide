import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import imageCompression from "browser-image-compression";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    context: { storeId?: string; folder?: string },
  ) => {
    setUploading(true);
    setError(null);
    try {
      const token = Cookies.get("access_token");
      // Note: If token is HttpOnly, this will be undefined.
      // We proceed anyway and rely on 'withCredentials: true' for the browser to send cookies.

      let finalFile = file;

      // Only compress images, skip compression for videos
      const isVideo = file.type.startsWith("video/");

      if (!isVideo) {
        // Compress Image
        const options = {
          maxSizeMB: 1, // Max 1MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        };

        try {
          finalFile = await imageCompression(file, options);
          // Rename to .webp if converted
          if (finalFile.type === "image/webp" && !file.name.endsWith(".webp")) {
            const newName =
              file.name.substring(0, file.name.lastIndexOf(".")) + ".webp";
            finalFile = new File([finalFile], newName, {
              type: "image/webp",
            });
          }
        } catch (error) {
          console.warn("Compression failed, using original file", error);
          finalFile = file;
        }
      }

      // Sanitize filename (remove spaces and special chars)
      const sanitizeFilename = (name: string) =>
        name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const finalFilename = sanitizeFilename(finalFile.name);

      // 1. Get Presigned URL
      const { data } = await axios.post(
        `${API_URL}/storage/upload-url`,
        {
          storeId: context.storeId,
          folder: context.folder,
          filename: finalFilename,
          contentType: finalFile.type,
          contentLength: finalFile.size,
        },
        {
          withCredentials: true, // IMPORTANT: Send HttpOnly cookies
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // Add header only if we have visible token
        },
      );

      const { url, key } = data;

      // 2. Upload to MinIO (Directly)
      // Note: We use fetch to avoid any axios magic (like converting to multipart or adding extra headers)
      // and to ensure clean PUT request.
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: finalFile,
        headers: {
          "Content-Type": finalFile.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("MinIO Upload Error:", errorText);
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      return key; // Return the key (e.g. stores/123/image.png)
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
