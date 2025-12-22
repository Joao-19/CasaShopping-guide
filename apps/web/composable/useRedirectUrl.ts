import { useState, useEffect } from "react";

export const useRedirectUrl = (
  envUrl: string | undefined,
  targetPort: number
) => {
  const [url, setUrl] = useState(envUrl || "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isDevIP =
        process.env.NODE_ENV === "development" &&
        hostname !== "localhost" &&
        hostname !== "127.0.0.1";
      const isMissingEnv = !envUrl;

      if (isDevIP || isMissingEnv) {
        setUrl(`${window.location.protocol}//${hostname}:${targetPort}`);
      }
    }
  }, [envUrl, targetPort]);

  return url;
};
