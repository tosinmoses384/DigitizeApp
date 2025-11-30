import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from '../use-websocket';
import { useAppSelector } from '../../redux/store';

interface UseChatConnectionProps {
  conversationId: string;
  autoDisconnectTimeout?: number;
  reconnectOnActivity?: boolean;
}

interface ChatConnectionReturn {
  connectToChat: () => void;
  disconnectFromChat: () => void;
  recordActivity: () => void;
  isConnected: boolean;
  isConnecting?: boolean;
  error?: string | null;
  reconnect?: () => void;
}

export const useChatConnection = ({
  conversationId,
  autoDisconnectTimeout = 120000, // 2 minutes default
  reconnectOnActivity = true,
}: UseChatConnectionProps): ChatConnectionReturn => {
  const [isActivelyChatting, setIsActivelyChatting] = useState(false);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  // Get token from Redux
  const token = useAppSelector((state) => state?.userProfileSlice?.token);

  // Use the robust WebSocket hook with chat-specific message handling
  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    connect: wsConnect,
    disconnect: wsDisconnect,
    reconnect: wsReconnect,
    sendMessage,
  } = useWebSocket(
    token,
    {
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      enableAppStateReconnect: true,
    },
    (data) => {
      // Handle chat-specific WebSocket messages here
      if (data?.payload?.conversationId === conversationId) {
        console.log(`📨 Chat message for conversation ${conversationId}:`, data);
        // Update activity when receiving messages for this conversation
        recordActivity();
      }
    }
  );

  const connectToChat = useCallback(() => {
    console.log(`🔗 Connecting to chat: ${conversationId}`);
    setIsActivelyChatting(true);
    lastActivityRef.current = Date.now();
    
    // Ensure WebSocket is connected
    if (!wsConnected && !wsConnecting) {
      wsConnect();
    }
    
    // Send chat-specific connection message if needed
    if (wsConnected) {
      sendMessage({
        action: 'join_conversation',
        conversationId: conversationId,
      });
    }
  }, [conversationId, wsConnected, wsConnecting, wsConnect, sendMessage]);

  const disconnectFromChat = useCallback(() => {
    console.log(`🔗 Disconnecting from chat: ${conversationId}`);
    setIsActivelyChatting(false);
    
    // Clear any existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }

    // Send chat-specific disconnection message if still connected
    if (wsConnected) {
      sendMessage({
        action: 'leave_conversation',
        conversationId: conversationId,
      });
    }
  }, [conversationId, wsConnected, sendMessage]);

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Set new timeout for auto-disconnect only if actively chatting
    if (autoDisconnectTimeout > 0 && isActivelyChatting) {
      activityTimeoutRef.current = setTimeout(() => {
        console.log(`⏰ Auto-disconnecting from chat due to inactivity: ${conversationId}`);
        disconnectFromChat();
      }, autoDisconnectTimeout);
    }
  }, [autoDisconnectTimeout, conversationId, disconnectFromChat, isActivelyChatting]);

  // Enhanced reconnect that handles both WebSocket and chat-specific reconnection
  const reconnect = useCallback(() => {
    console.log(`🔄 Reconnecting chat: ${conversationId}`);
    
    // First disconnect from chat cleanly
    if (isActivelyChatting) {
      disconnectFromChat();
    }
    
    // Then reconnect WebSocket
    wsReconnect();
    
    // Wait a moment and reconnect to chat
    setTimeout(() => {
      if (isActivelyChatting) {
        connectToChat();
      }
    }, 1000);
  }, [conversationId, isActivelyChatting, disconnectFromChat, wsReconnect, connectToChat]);

  // Auto-reconnect to chat when WebSocket reconnects
  useEffect(() => {
    if (wsConnected && isActivelyChatting) {
      console.log(`🔄 WebSocket reconnected, rejoining chat: ${conversationId}`);
      sendMessage({
        action: 'join_conversation',
        conversationId: conversationId,
      });
    }
  }, [wsConnected, isActivelyChatting, conversationId, sendMessage]);

  // Set up auto-disconnect timeout when actively chatting
  useEffect(() => {
    if (isActivelyChatting && autoDisconnectTimeout > 0) {
      recordActivity(); // Start the timeout
    }

    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [isActivelyChatting, recordActivity, autoDisconnectTimeout]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      // Clean disconnect from chat on unmount
      if (isActivelyChatting) {
        disconnectFromChat();
      }
    };
  }, [isActivelyChatting, disconnectFromChat]);

  return {
    connectToChat,
    disconnectFromChat,
    recordActivity,
    isConnected: wsConnected && isActivelyChatting, // Chat is connected when both WS is connected AND actively chatting
    isConnecting: wsConnecting || (isActivelyChatting && !wsConnected),
    error: wsError,
    reconnect,
  };
};