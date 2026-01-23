import { useState, useEffect } from "react";

export const useRedirectUrl = (
  envUrl: string | undefined,
  targetPath: string = "",
) => {
  const [url, setUrl] = useState(envUrl || "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isMissingEnv = !envUrl;

      if (isMissingEnv) {
        // Use same host with basePath for production (behind nginx proxy)
        // For local dev with ports, set NEXT_PUBLIC_WEB_URL properly
        setUrl(`${protocol}//${hostname}${targetPath}`);
      }
    }
  }, [envUrl, targetPath]);

  return url;
};
