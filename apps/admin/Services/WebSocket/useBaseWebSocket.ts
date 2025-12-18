import { useEffect } from "react";
import { useSocket } from "@/composable/Service/Socket/useSocket";
import { webSocketHostResolver } from "@/composable/Service/Socket/useHostResolver";

export default function useEmitWebSocket(eventName: string, ...form: any[]) {
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
