import { useEffect } from "react";
import { useSocket, UseSocketResult } from "@/Service/Socket/useSocket";
import { webSocketHostResolver } from "@/Service/Socket/useHostResolver";

export default function useEmitWebSocket(
  eventName: string,
  ...form: any[]
): Omit<UseSocketResult, "error" | "loading" | "emitLoading" | "emitError"> & {
  socketError: Error | null;
  socketLoading: boolean;
} {
  const currentHost = webSocketHostResolver();

  const {
    socket,
    isConnected,
    error: socketError,
    loading: socketLoading,
    emit,
    on,
    off,
    connect,
    disconnect,
  } = useSocket({ url: currentHost });

  useEffect(() => {
    if (!socket) return;
    if (isConnected) socket.emit(eventName, form);
    return () => {
      socket.off(eventName);
    };
  }, [socket, isConnected, eventName, form]);

  return {
    socket,
    isConnected,
    socketError,
    socketLoading,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
}
