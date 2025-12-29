import { useState } from "react";
import imageCompression from "browser-image-compression";
import http from "@/Services/http";
import userHttp from "@/Services/http/user.http";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useProfileImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadProfileImage = async (file: File, userId: string) => {
    setUploading(true);
    setError(null);

    try {
      // Compress image to webp
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      let compressedFile: File;
      try {
        compressedFile = await imageCompression(file, options);
        // Rename to profile_{userId}.webp
        const filename = `profile_${userId}.webp`;
        compressedFile = new File([compressedFile], filename, {
          type: "image/webp",
        });
      } catch (compressionError) {
        console.warn(
          "Compression failed, using original file:",
          compressionError
        );
        compressedFile = file;
      }

      // Get presigned URL for upload
      const { data } = await http.post(`${API_URL}/storage/upload-url`, {
        folder: `users/${userId}`,
        filename: compressedFile.name,
        contentType: compressedFile.type,
        contentLength: compressedFile.size,
      });

      const { url, key } = data;

      // Upload directly to MinIO/S3
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": compressedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload Error:", errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Update user profile with image URL
      const updatedUser = await userHttp.updateProfileImage(key);

      return updatedUser;
    } catch (err: any) {
      console.error("Profile image upload error:", err);
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadProfileImage, uploading, error };
}
