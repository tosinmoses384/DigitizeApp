import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../use-websocket';

interface ConnectionHealthMetrics {
  uptime: number;
  reconnectRate: number;
  averageReconnectDelay: number;
  lastDisconnectReason: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export const useWebSocketHealth = (token: string | null) => {
  const webSocket = useWebSocket(token);
  const [metrics, setMetrics] = useState<ConnectionHealthMetrics>({
    uptime: 0,
    reconnectRate: 0,
    averageReconnectDelay: 0,
    lastDisconnectReason: null,
    connectionQuality: 'disconnected',
  });
  
  const [connectionHistory, setConnectionHistory] = useState<{
    connectTime: number;
    disconnectTime?: number;
    disconnectReason?: string;
  }[]>([]);

  // Track connection events
  useEffect(() => {
    if (webSocket.isConnected && !webSocket.isConnecting) {
      // Connection established
      setConnectionHistory(prev => [
        ...prev,
        { connectTime: Date.now() }
      ]);
    } else if (!webSocket.isConnected && !webSocket.isConnecting && webSocket.error) {
      // Connection lost
      setConnectionHistory(prev => {
        const updated = [...prev];
        const lastConnection = updated[updated.length - 1];
        if (lastConnection && !lastConnection.disconnectTime) {
          lastConnection.disconnectTime = Date.now();
          lastConnection.disconnectReason = webSocket.error || 'Unknown';
        }
        return updated;
      });
      
      setMetrics(prev => ({
        ...prev,
        lastDisconnectReason: webSocket.error,
      }));
    }
  }, [webSocket.isConnected, webSocket.isConnecting, webSocket.error]);

  // Calculate metrics
  useEffect(() => {
    const now = Date.now();
    const last24Hours = connectionHistory.filter(
      conn => conn.connectTime > now - 24 * 60 * 60 * 1000
    );
    
    // Calculate uptime (percentage of time connected in last 24h)
    let totalConnectedTime = 0;
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    last24Hours.forEach(conn => {
      const connectTime = Math.max(conn.connectTime, now - timeWindow);
      const disconnectTime = conn.disconnectTime || now;
      totalConnectedTime += disconnectTime - connectTime;
    });
    
    const uptime = Math.min(100, (totalConnectedTime / timeWindow) * 100);
    
    // Calculate reconnect rate (reconnects per hour)
    const reconnects = last24Hours.filter(conn => conn.disconnectTime).length;
    const reconnectRate = reconnects / 24;
    
    // Calculate average reconnect delay
    const reconnectDelays = last24Hours
      .filter((conn, index) => index > 0 && conn.connectTime)
      .map((conn, index) => {
        const prevConn = last24Hours[index];
        return prevConn?.disconnectTime 
          ? conn.connectTime - prevConn.disconnectTime 
          : 0;
      })
      .filter(delay => delay > 0);
    
    const averageReconnectDelay = reconnectDelays.length > 0
      ? reconnectDelays.reduce((sum, delay) => sum + delay, 0) / reconnectDelays.length
      : 0;
    
    // Determine connection quality
    let connectionQuality: ConnectionHealthMetrics['connectionQuality'] = 'disconnected';
    
    if (webSocket.isConnected) {
      if (uptime >= 95 && reconnectRate < 1) {
        connectionQuality = 'excellent';
      } else if (uptime >= 85 && reconnectRate < 3) {
        connectionQuality = 'good';
      } else {
        connectionQuality = 'poor';
      }
    }
    
    setMetrics({
      uptime: Math.round(uptime * 100) / 100,
      reconnectRate: Math.round(reconnectRate * 100) / 100,
      averageReconnectDelay: Math.round(averageReconnectDelay),
      lastDisconnectReason: metrics.lastDisconnectReason,
      connectionQuality,
    });
  }, [connectionHistory, webSocket.isConnected]);

  // Get user-friendly status message
  const getStatusMessage = useCallback(() => {
    if (webSocket.isConnecting) {
      return {
        message: 'Connecting to chat server...',
        type: 'info' as const,
      };
    }
    
    if (!webSocket.isConnected) {
      if (webSocket.reconnectAttempts > 0) {
        const timeRemaining = webSocket.timeUntilNextReconnect;
        if (timeRemaining && timeRemaining > 0) {
          const seconds = Math.ceil(timeRemaining / 1000);
          return {
            message: `Reconnecting in ${seconds}s (attempt ${webSocket.reconnectAttempts}/${webSocket.config.maxRetries})`,
            type: 'warning' as const,
          };
        }
        return {
          message: `Reconnection failed after ${webSocket.reconnectAttempts} attempts`,
          type: 'error' as const,
        };
      }
      return {
        message: 'Chat disconnected',
        type: 'error' as const,
      };
    }
    
    switch (metrics.connectionQuality) {
      case 'excellent':
        return {
          message: 'Chat connection excellent',
          type: 'success' as const,
        };
      case 'good':
        return {
          message: 'Chat connection stable',
          type: 'success' as const,
        };
      case 'poor':
        return {
          message: 'Chat connection unstable',
          type: 'warning' as const,
        };
      default:
        return {
          message: 'Chat connected',
          type: 'success' as const,
        };
    }
  }, [webSocket, metrics.connectionQuality]);

  // Get recommended actions for the user
  const getRecommendedActions = useCallback(() => {
    const actions: string[] = [];
    
    if (!webSocket.isConnected && webSocket.reconnectAttempts >= webSocket.config.maxRetries) {
      actions.push('Check your internet connection');
      actions.push('Try manually reconnecting');
    }
    
    if (metrics.connectionQuality === 'poor') {
      actions.push('Check your network stability');
      actions.push('Consider switching to a better network');
    }
    
    if (metrics.reconnectRate > 5) {
      actions.push('Frequent disconnections detected');
      actions.push('Check your network settings');
    }
    
    return actions;
  }, [webSocket, metrics]);

  return {
    ...webSocket,
    metrics,
    connectionHistory: connectionHistory.slice(-50), // Keep last 50 connections
    statusMessage: getStatusMessage(),
    recommendedActions: getRecommendedActions(),
    
    // Helper methods
    clearHistory: () => setConnectionHistory([]),
    forceReconnect: () => {
      setConnectionHistory([]); // Clear history
      setMetrics(prev => ({
        ...prev,
        uptime: 0,
        reconnectRate: 0,
        averageReconnectDelay: 0,
        lastDisconnectReason: null,
      }));
      webSocket.reconnect();
    },
  };
};
