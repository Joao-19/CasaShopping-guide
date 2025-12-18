import { useState, useEffect } from "react";

export const useRedirectUrl = (
  envUrl: string | undefined,
  targetPort: number
) => {
  const [url, setUrl] = useState(envUrl || "");

  useEffect(() => {
    // Only override in development environment
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      const hostname = window.location.hostname;
      // If we are not on localhost (e.g. accessing via IP), assume the other service is on the same IP
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        setUrl(`${window.location.protocol}//${hostname}:${targetPort}`);
      }
    }
  }, [envUrl, targetPort]);

  return url;
};
