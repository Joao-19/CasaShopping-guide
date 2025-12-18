import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../store/auth.store.ts'; // Ajuste o caminho conforme necessário

interface SocketConfig {
  url: string;
  namespace?: string;
  autoConnect?: boolean;
}

interface UseSocketResult {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
  loading: boolean;
  emitLoading: boolean; // New state for emit operation loading
  emitError: Error | null; // New state for emit operation error
  emit: (event: string, ...args: any[]) => Promise<void>; // Emit now returns a Promise
  on: (event: string, listener: (...args: any[]) => void) => () => void;
  off: (event: string, listener: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
}
const BACKEND_URL = import.meta.env.VITE_API_URL;

export function useSocket(config: SocketConfig): UseSocketResult {
  const { url, namespace, autoConnect = true } = config;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [emitLoading, setEmitLoading] = useState<boolean>(false); // New state
  const [emitError, setEmitError] = useState<Error | null>(null); // New state
  const { token: authToken, setToken: setAuthToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  // Memoiza a URL e o namespace para garantir estabilidade nas dependências
  const memoizedUrl = useMemo(() => url, [url]);
  const memoizedNamespace = useMemo(() => namespace, [namespace]);

  // Helper function to create and manage socket connection
  const createSocketConnection = useCallback((
    connectionUrl: string,
    token: string | null,
    setLoading: (loading: boolean) => void,
    setError: (error: Error | null) => void,
    setIsConnected: (connected: boolean) => void,
    setSocket: (socket: Socket | null) => void,
    socketRef: React.MutableRefObject<Socket | null>,
    setAuthToken: (token: string | null) => void
  ) => {
    setLoading(true);
    setError(null);
    console.log(`useSocket: Tentando conectar a ${connectionUrl} com token: ${token ? 'Sim' : 'Não'}`);

    const newSocket = io(connectionUrl, {
      autoConnect: false,
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setLoading(false);
      setError(null);
      console.log(`useSocket: Socket.IO conectado ao ${connectionUrl}`);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setLoading(false);
      console.log(`useSocket: Socket.IO desconectado: ${reason}`);
      socketRef.current = null;
      setSocket(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('useSocket: Erro de conexão Socket.IO:', err);
      setError(err);
      setLoading(false);
      setIsConnected(false);
      socketRef.current = null;
      setSocket(null);
      if (err.message === 'Authentication error') {
        console.log('useSocket: Erro de autenticação, limpando token e redirecionando.');
        setAuthToken(null);
        window.location.href = '/login';
      }
    });

    newSocket.connect();
    setSocket(newSocket);
    socketRef.current = newSocket;
    return newSocket;
  }, [setAuthToken]);

  useEffect(() => {
    console.log('useSocket: useEffect principal executado.');
    const token = authToken;
    const connectionUrl = memoizedNamespace ? `${memoizedUrl}/${memoizedNamespace}` : memoizedUrl;

    if (autoConnect && !socketRef.current) { // Conecta apenas se autoConnect for true e não houver socket ativo
      createSocketConnection(connectionUrl, token, setLoading, setError, setIsConnected, setSocket, socketRef, setAuthToken);
    }
    // Se autoConnect for false, mas um socket já existir (por exemplo, após uma conexão manual),
    // garantimos que ele não seja desconectado e reconectado desnecessariamente.
    // No entanto, se o token mudar, queremos que o socket seja reavaliado.

    return () => {
      console.log('useSocket: useEffect cleanup. Desconectando...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [autoConnect, memoizedUrl, memoizedNamespace, authToken, setLoading, setError, setIsConnected, setSocket, socketRef, createSocketConnection, setAuthToken]);

  // Funções emit, on, off, connect, disconnect agora usam o socketRef.current
  // Funções emit, on, off, connect, disconnect agora usam o socketRef.current
  const emit = useCallback((event: string, ...args: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      setEmitLoading(true);
      setEmitError(null);
      if (socketRef.current && socketRef.current.connected) {
        // Assuming an acknowledgment mechanism for emit success/failure
        // For simplicity, we'll resolve immediately. In a real app, you'd listen for a server ack.
        socketRef.current.emit(event, ...args, (response: any) => {
          if (response && response.error) {
            setEmitError(new Error(response.error.message || "Emit failed"));
            reject(new Error(response.error.message || "Emit failed"));
          } else {
            resolve();
          }
          setEmitLoading(false);
        });
      } else {
        const err = new Error('useSocket: Socket não está conectado. Não foi possível emitir o evento: ' + event);
        console.warn(err.message);
        setEmitError(err);
        setEmitLoading(false);
        reject(err);
      }
    });
  }, []);

  const on = useCallback((event: string, listener: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, listener);
    } else {
      console.warn('useSocket: Socket não está conectado. Não foi possível registrar o ouvinte para o evento:', event);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, listener);
      }
    };
  }, []);

  const off = useCallback((event: string, listener: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, listener);
    }
  }, []);

  // Funções para controle manual da conexão
  const manualConnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    } else if (!socketRef.current) {
      // If no socket exists, create a new one
      const token = authToken;
      const connectionUrl = memoizedNamespace ? `${memoizedUrl}/${memoizedNamespace}` : memoizedUrl;
      createSocketConnection(connectionUrl, token, setLoading, setError, setIsConnected, setSocket, socketRef, setAuthToken);
    }
  }, [authToken, createSocketConnection, memoizedNamespace, memoizedUrl, setLoading, setError, setIsConnected, setSocket, socketRef, setAuthToken]);

  const manualDisconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, [setSocket, setIsConnected, socketRef]);

  return {
    socket,
    isConnected,
    error,
    loading,
    emitLoading, // Expose new state
    emitError, // Expose new state
    emit,
    on,
    off,
    connect: manualConnect,
    disconnect: manualDisconnect,
  };
}
