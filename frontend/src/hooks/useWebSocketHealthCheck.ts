import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    latency: number | null;
    sendPing: () => void;
    sendMessage: (message: WebSocketMessage) => void;
    lastMessage: WebSocketMessage | null;
}

/**
 * Custom hook for WebSocket health check
 * Implements ping-pong protocol to verify real-time pulse
 */
export function useWebSocketHealthCheck(url: string): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [latency, setLatency] = useState<number | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const pingTimeRef = useRef<number>(0);

    useEffect(() => {
        // Create WebSocket connection
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WebSocket] Connected to SwiftCart backend');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                setLastMessage(data);

                // Calculate latency for pong messages
                if (data.type === 'pong') {
                    const now = Date.now();
                    const roundTripTime = now - pingTimeRef.current;
                    setLatency(roundTripTime);
                    console.log(`[WebSocket] Ping-Pong RTT: ${roundTripTime}ms`);
                }

                console.log('[WebSocket] Received:', data);
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('[WebSocket] Disconnected');
            setIsConnected(false);
        };

        // Cleanup on unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url]);

    const sendPing = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            pingTimeRef.current = Date.now();
            wsRef.current.send(JSON.stringify({
                type: 'ping',
                timestamp: pingTimeRef.current
            }));
        }
    };

    const sendMessage = (message: WebSocketMessage) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    };

    return {
        isConnected,
        latency,
        sendPing,
        sendMessage,
        lastMessage
    };
}
