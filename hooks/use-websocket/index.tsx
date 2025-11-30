import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAppSelector } from "../../redux/store";
import TokenStore from "../../utils/tokenStore";
import tokenRefreshManager from "../../utils/tokenRefreshManager";

let globalWebSocketInstance: WebSocket | null = null;
let globalConnectionState = {
  isConnected: false,
  isConnecting: false,
  lastConnectionAttempt: 0,
  connectionCooldown: 1000,
};

const createWebSocketUrl = (token: string) => {
  if (token) {
    const url = `${process.env.EXPO_PUBLIC_WS_BASE_URL}/conversations?accessToken=${token}`;
    // console.log('🔗 Creating WebSocket URL:', url);
    return url;
  }
  console.warn("⚠️ Cannot create WebSocket URL - no token provided");
  return null;
};

// Export for backward compatibility
export const websocketUrl = createWebSocketUrl;

interface WebSocketMessage {
  action: string;
  messageType?: number;
  conversationId?: string;
  message?: string;
  [key: string]: any;
}

interface ReconnectionConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  enableHeartbeat: boolean;
  heartbeatInterval: number;
  enableAppStateReconnect: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnectedAt: number | null;
  nextReconnectAt: number | null;
}

type MessageCallback = (data: Record<string, unknown>) => void;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    if (__DEV__) {
      console.log("🔄 Attempting to refresh access token for WebSocket...");
    }
    const token = await tokenRefreshManager.refreshToken();
    if (__DEV__) {
      console.log("✅ Token refresh successful for WebSocket");
    }
    return token;
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Token refresh failed for WebSocket:", error);
    }
    return null;
  }
};

export const useWebSocket = (
  token?: string | null,
  config?: Partial<ReconnectionConfig>,
  onMessage?: MessageCallback
) => {
  // Get token from Redux if not provided
  const reduxToken = useAppSelector((state) => state?.userProfileSlice?.token);
  const activeToken = token ?? reduxToken;

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const defaultConfig: ReconnectionConfig = {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
    enableAppStateReconnect: true,
  };

  const reconnectionConfig = { ...defaultConfig, ...config };

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnectedAt: null,
    nextReconnectAt: null,
  });

  // Cleanup function to clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
  }, []);

  // Calculate reconnection delay with exponential backoff
  const getReconnectDelay = useCallback(
    (attempt: number) => {
      const delay =
        reconnectionConfig.initialDelay *
        Math.pow(reconnectionConfig.backoffMultiplier, attempt);
      return Math.min(delay, reconnectionConfig.maxDelay);
    },
    [reconnectionConfig]
  );

  // Start heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (!reconnectionConfig.enableHeartbeat) return;

    clearTimeout(heartbeatTimeoutRef.current!);

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        console.log("💓 Heartbeat: Sending ping at", new Date().toISOString());
        sendMessage({ action: "ping" });

      // Wait for pong response
      pingTimeoutRef.current = setTimeout(() => {
        console.log("⚠️ ═══════ PING TIMEOUT ═══════");
        console.log("⏰ Time:", new Date().toISOString());
        console.log("🔌 WebSocket ping missed - scheduling reconnect via consumer if needed");
        console.log("═══════════════════════════════\n");
        // Do NOT forcibly close here to avoid interrupting other consumers
        // Let higher level (react-native-use-websocket or consumer) handle reconnect
      }, 15000);
      }
    }, reconnectionConfig.heartbeatInterval);
  }, [
    reconnectionConfig.enableHeartbeat,
    reconnectionConfig.heartbeatInterval,
  ]);

  // Handle reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    setState((prev) => {
      if (prev.reconnectAttempts >= reconnectionConfig.maxRetries) {
        console.error(
          `Max reconnection attempts (${reconnectionConfig.maxRetries}) reached`
        );
        return {
          ...prev,
          error: "Max reconnection attempts reached",
          nextReconnectAt: null,
        };
      }

      const delay = getReconnectDelay(prev.reconnectAttempts);
      const nextReconnectAt = Date.now() + delay;

      console.log(
        `Scheduling reconnection attempt ${
          prev.reconnectAttempts + 1
        } in ${delay}ms`
      );

      clearTimeout(reconnectTimeoutRef.current!);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (activeToken) {
          connectWebSocket();
        }
      }, delay);

      return {
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
        nextReconnectAt,
      };
    });
  }, [reconnectionConfig.maxRetries, getReconnectDelay, activeToken]); // Use activeToken instead of token

  const connectWebSocket = useCallback(async () => {
    console.log("🔌 connectWebSocket called");

    // Always get the freshest token from TokenStore
    const freshToken = await TokenStore.getAccessToken();
    
    if (!freshToken && !activeToken) {
      console.warn("❌ No token available for WebSocket connection");
      setState((prev) => ({
        ...prev,
        error: "No authentication token available",
      }));
      return;
    }

    // Use fresh token from TokenStore if available, otherwise fall back to activeToken
    const tokenToUse = freshToken || activeToken;
    console.log("🔑 Using token for WebSocket:", tokenToUse ? "Token available" : "No token");

    // Check connection cooldown to prevent rapid-fire attempts
    const now = Date.now();
    if (
      now - globalConnectionState.lastConnectionAttempt <
      globalConnectionState.connectionCooldown
    ) {
      console.log("🛑 Connection attempt blocked by cooldown");
      return;
    }

    // Check if existing connection uses a different token
    if (globalWebSocketInstance?.readyState === WebSocket.OPEN) {
      const currentUrl = createWebSocketUrl(tokenToUse!);
      // Force reconnection if token has changed (to prevent 401 errors)
      const shouldReconnectForNewToken =
        currentUrl && !globalWebSocketInstance.url.includes(tokenToUse!);

      if (shouldReconnectForNewToken) {
        console.log("🔄 Token changed, forcing WebSocket reconnection");
        globalWebSocketInstance.close(1000, "Token changed");
        globalWebSocketInstance = null;
        globalConnectionState.isConnected = false;
        globalConnectionState.isConnecting = false;
      } else {
        console.log("✅ Using existing WebSocket connection");
        websocketRef.current = globalWebSocketInstance;
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        return;
      }
    }

    // Prevent multiple connection attempts
    if (globalConnectionState.isConnecting) {
      console.log("⏳ WebSocket connection already in progress globally");
      setState((prev) => ({
        ...prev,
        isConnecting: true,
      }));
      return;
    }

    const url = createWebSocketUrl(tokenToUse!);
    if (!url) {
      console.error("❌ Invalid WebSocket URL");
      return;
    }

    console.log(
      "🚀 Creating new WebSocket connection to:",
      url.substring(0, 50) + "..."
    );

    // Set global connecting state and record attempt time
    globalConnectionState.isConnecting = true;
    globalConnectionState.lastConnectionAttempt = now;

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
      nextReconnectAt: null,
    }));

    clearTimeouts();

    try {
      const websocket = new WebSocket(url);
      websocketRef.current = websocket;
      globalWebSocketInstance = websocket;

      websocket.onopen = () => {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔷 CUSTOM WEBSOCKET CONNECTED");
        console.log("   Instance ID:", websocket.url.substring(websocket.url.length - 20));
        console.log("   Created by: useWebSocket hook");
        console.log("   Global instance count:", globalWebSocketInstance ? 1 : 0);
        console.log("   ReadyState:", websocket.readyState);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        globalConnectionState.isConnected = true;
        globalConnectionState.isConnecting = false;

        const now = Date.now();
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0, // Reset on successful connection
          lastConnectedAt: now,
          nextReconnectAt: null,
        }));

        // Start heartbeat
        startHeartbeat();
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Enhanced logging for all messages
          console.log("📨 WebSocket message received:", {
            action: data.action,
            hasPayload: !!data.payload,
            payloadKeys: data.payload ? Object.keys(data.payload) : [],
            fullData: data,
          });

          // Handle ping/pong for heartbeat
          if (data.action === "ping") {
            console.log("🏓 Received ping, sending pong");
            sendMessage({ action: "pong" });
          } else if (data.action === "pong") {
            console.log("🏓 Received pong");
            clearTimeout(pingTimeoutRef.current!);
            startHeartbeat();
          }

          // Call the message callback if provided
          if (onMessage && data.action !== "ping" && data.action !== "pong") {
            console.log("📤 Calling onMessage callback with data:", data);
            onMessage(data);
          }
        } catch (error) {
          console.error(
            "❌ Error parsing WebSocket message:",
            error,
            "Raw data:",
            event.data
          );
        }
      };

      websocket.onclose = async (event) => {
        console.log("\n🔴 ═══════ WEBSOCKET CLOSED ═══════");
        console.log("📍 Location: use-websocket/index.tsx");
        console.log("🔢 Close Code:", event.code);
        console.log("💬 Close Reason:", event.reason || "No reason provided");
        console.log("🔍 Close Code Meaning:", {
          1000: "Normal closure",
          1001: "Going away",
          1008: "Policy violation / Unauthorized",
          1011: "Server error",
        }[event.code] || "Unknown");
        console.log("═══════════════════════════════\n");
        websocketRef.current = null;

        // Reset global state if this was the global instance
        if (globalWebSocketInstance === websocket) {
          globalWebSocketInstance = null;
          globalConnectionState.isConnected = false;
          globalConnectionState.isConnecting = false;
        }

        clearTimeouts();

        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: event.reason || "Connection closed",
        }));

        // Handle 401 Unauthorized - token expired
        const isUnauthorized = event.code === 1008 || 
                              (event.reason && event.reason.toLowerCase().includes('unauthorized')) ||
                              (event.reason && event.reason.toLowerCase().includes('401'));

        if (isUnauthorized && appStateRef.current === "active") {
          console.log("🔐 WebSocket closed due to invalid/expired token, attempting token refresh...");
          
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            console.log("✅ Token refreshed successfully, reconnecting WebSocket with new token");
            // Reset reconnection attempts since we have a fresh token
            setState((prev) => ({
              ...prev,
              reconnectAttempts: 0,
              error: "Token refreshed, reconnecting...",
            }));
            
            // Force reconnect with the new token after a short delay
            setTimeout(() => {
              if (appStateRef.current === "active") {
                connectWebSocket();
              }
            }, 500);
            return;
          } else {
            console.error("❌ Token refresh failed, cannot reconnect WebSocket");
            setState((prev) => ({
              ...prev,
              error: "Authentication failed - please login again",
              reconnectAttempts: 0,
              nextReconnectAt: null,
            }));
            return;
          }
        }

        // Determine if we should reconnect for other reasons
        const shouldReconnect =
          activeToken && // Only reconnect if we have a token
          event.code !== 1000 && // Not a normal closure
          event.code !== 1001 && // Not going away
          event.code !== 1005 && // No status code
          !isUnauthorized && // Not an auth issue (handled above)
          appStateRef.current === "active"; // App is active

        if (shouldReconnect) {
          console.log(
            "🔄 WebSocket closed unexpectedly, scheduling reconnection..."
          );
          scheduleReconnect();
        } else {
          console.log("✅ WebSocket closed normally, not reconnecting");
          setState((prev) => ({
            ...prev,
            reconnectAttempts: 0,
            nextReconnectAt: null,
          }));
        }
      };

      websocket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        console.log("🔗 WebSocket URL that failed:", websocket.url);
        console.log(
          "🔑 Active token (first 20 chars):",
          activeToken?.substring(0, 20) + "..."
        );

        globalConnectionState.isConnecting = false;
        globalConnectionState.isConnected = false;
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Connection error",
        }));
      };
    } catch (error) {
      console.error("❌ Error creating WebSocket connection:", error);
      globalConnectionState.isConnecting = false;
      globalConnectionState.isConnected = false;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Failed to create connection",
      }));
    }
  }, [
    activeToken,
    clearTimeouts,
    startHeartbeat,
    scheduleReconnect,
    onMessage,
  ]);

  const sendMessage = useCallback(
    async (message: WebSocketMessage): Promise<boolean> => {
      console.log("🚀 sendMessage called:", {
        websocketState: websocketRef.current?.readyState,
        isConnected: websocketRef.current?.readyState === WebSocket.OPEN,
        globalConnected: globalConnectionState.isConnected,
        message: message,
      });

      // Check if WebSocket is not connected
      if (
        !websocketRef.current ||
        websocketRef.current.readyState !== WebSocket.OPEN
      ) {
        console.warn("❌ WebSocket is not connected. Checking token validity...", {
          websocket: !!websocketRef.current,
          readyState: websocketRef.current?.readyState,
          message: message,
        });
        
        // Try to refresh token and reconnect
        const freshToken = await TokenStore.getAccessToken();
        if (!freshToken) {
          console.log("🔐 No valid token, attempting to refresh...");
          const newToken = await refreshAccessToken();
          if (newToken && appStateRef.current === "active") {
            console.log("✅ Token refreshed, reconnecting WebSocket...");
            await connectWebSocket();
            // Wait a bit for connection to establish
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry sending the message if now connected
            if (websocketRef.current?.readyState === WebSocket.OPEN) {
              try {
                const messageString = JSON.stringify(message);
                websocketRef.current.send(messageString);
                console.log("✅ WebSocket message sent successfully after reconnection");
                return true;
              } catch (retryError) {
                console.error("❌ Failed to send message after reconnection:", retryError);
                return false;
              }
            }
          }
        }
        
        return false;
      }

      try {
        const messageString = JSON.stringify(message);
        console.log("📤 Sending WebSocket message:", messageString);

        websocketRef.current.send(messageString);
        console.log("✅ WebSocket message sent successfully");

        // Handle pong response
        if (message.action === "pong") {
          clearTimeout(pingTimeoutRef.current!);
          startHeartbeat(); // Schedule next heartbeat
        }

        return true;
      } catch (error) {
        console.error("❌ Error sending WebSocket message:", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          messageString: JSON.stringify(message),
          readyState: websocketRef.current?.readyState
        });
        return false;
      }
    },
    [startHeartbeat, connectWebSocket]
  );

  const disconnectWebSocket = useCallback(() => {
    console.log("🔌 disconnectWebSocket called");

    if (websocketRef.current) {
      console.log("🧹 Cleaning up WebSocket connection");
      websocketRef.current.close(1000, "Component unmounting");
      websocketRef.current = null;
    }

    // Reset global state if we're the owner of the global instance
    if (
      globalWebSocketInstance === websocketRef.current ||
      websocketRef.current === null
    ) {
      console.log("🔄 Resetting global WebSocket state");
      globalWebSocketInstance = null;
      globalConnectionState.isConnected = false;
      globalConnectionState.isConnecting = false;
    }

    clearTimeouts();

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
      nextReconnectAt: null,
    }));
  }, [clearTimeouts]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnection triggered");
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
      nextReconnectAt: null,
    }));

    if (websocketRef.current) {
      disconnectWebSocket();
    }

    // Reset global state
    globalConnectionState.isConnected = false;
    globalConnectionState.isConnecting = false;
    globalConnectionState.lastConnectionAttempt = 0; // Reset cooldown

    setTimeout(() => {
      if (activeToken) {
        connectWebSocket();
      }
    }, 100);
  }, [activeToken, disconnectWebSocket, connectWebSocket]);

  // Handle app state changes
  useEffect(() => {
    if (!reconnectionConfig.enableAppStateReconnect) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(
        "App state changed:",
        appStateRef.current,
        "->",
        nextAppState
      );

      if (appStateRef.current === "background" && nextAppState === "active") {
        // App came to foreground
        if (activeToken && !state.isConnected && !state.isConnecting) {
          console.log("App activated - attempting reconnection");
          reconnect();
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [
    reconnectionConfig.enableAppStateReconnect,
    activeToken,
    state.isConnected,
    state.isConnecting,
    reconnect,
  ]);

  // Connect when token becomes available - stabilized effect
  useEffect(() => {
    console.log("🔌 Token effect triggered:", !!activeToken);

    if (activeToken) {
      // Check if we already have a global connection
      if (globalWebSocketInstance?.readyState === WebSocket.OPEN) {
        // Verify the connection is using the current token
        const currentUrl = createWebSocketUrl(activeToken);
        const isTokenMatching =
          currentUrl && globalWebSocketInstance.url.includes(activeToken);

        if (isTokenMatching) {
          console.log("✅ Using existing global WebSocket connection");
          websocketRef.current = globalWebSocketInstance;
          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: null,
          }));
        } else {
          console.log("🔄 Token mismatch detected, creating new connection");
          connectWebSocket();
        }
      } else if (!globalConnectionState.isConnecting) {
        console.log("🚀 Starting new WebSocket connection");
        connectWebSocket();
      } else {
        console.log("⏳ Connection already in progress");
      }
    } else {
      console.log("🔐 No token, disconnecting");
      disconnectWebSocket();
    }

    // Cleanup function
    return () => {
      console.log("🧹 Token effect cleanup");
      clearTimeouts();
    };
  }, [activeToken]); // Remove function dependencies to prevent infinite loop

  // Cleanup on unmount - stable cleanup
  useEffect(() => {
    return () => {
      console.log("🗑️ Component unmounting - cleaning up WebSocket");

      // Clear timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
        pingTimeoutRef.current = null;
      }

      // Only close if this is the last component using the WebSocket
      if (
        websocketRef.current &&
        websocketRef.current === globalWebSocketInstance
      ) {
        console.log("🔌 Closing global WebSocket connection");
        websocketRef.current.close(1000, "Component unmounting");
        globalWebSocketInstance = null;
        globalConnectionState.isConnected = false;
        globalConnectionState.isConnecting = false;
      }
    };
  }, []); // No dependencies - stable cleanup

  // Utility functions for common chat operations
  const sendChatMessage = useCallback(
    (conversationId: string, message: string) => {
      return sendMessage({
        action: "sendMessage",
        messageType: 1,
        conversationId,
        message,
      });
    },
    [sendMessage]
  );

  // Test function to verify WebSocket connection
  const sendTestMessage = useCallback(() => {
    console.log("🧪 Sending test message");
    const testMessage = {
      action: "test_message",
      timestamp: Date.now(),
      message: "Connection test",
    };
    return sendMessage(testMessage);
  }, [sendMessage]);

  return {
    // Connection state
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,
    lastConnectedAt: state.lastConnectedAt,
    nextReconnectAt: state.nextReconnectAt,

    // Connection health
    isHealthy: state.isConnected && !state.error,
    timeSinceLastConnection: state.lastConnectedAt
      ? Date.now() - state.lastConnectedAt
      : null,
    timeUntilNextReconnect: state.nextReconnectAt
      ? Math.max(0, state.nextReconnectAt - Date.now())
      : null,

    // WebSocket instance (for advanced usage)
    websocket: websocketRef.current,

    // Connection management
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    reconnect,

    // Message sending
    sendMessage,
    sendChatMessage,
    sendTestMessage,

    // Configuration
    config: reconnectionConfig,
  };
};
