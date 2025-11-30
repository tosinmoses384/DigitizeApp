import conversationService from "@services/features/conversation-service/conversationService";
import { router } from "expo-router";
import { ChatMessage, MessageStatus } from "models/ChatMessage";
import React, { useState, useEffect, useCallback, useRef } from "react";
import useWebSocket, { ReadyState } from "react-native-use-websocket";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import TokenStore from "../../utils/tokenStore";
import tokenRefreshManager from "../../utils/tokenRefreshManager";
import { PAGINATION_CONFIG } from "../../constants/PaginationConfig";
import NetInfo from "@react-native-community/netinfo";

// Create WebSocket URL function
const createWebSocketUrl = (token: string) => {
  if (token) {
    if (__DEV__) {
      console.log('🔧 Creating WebSocket URL with token:', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20),
        url: `${process.env.EXPO_PUBLIC_WS_BASE_URL}/conversations?accessToken=***`
      });
    }
    return `${process.env.EXPO_PUBLIC_WS_BASE_URL}/conversations?accessToken=${token}`;
  }
  return null;
};

const normalizeApiMessage = (data: any): ChatMessage => ({
  messageId: data.id,
  conversationId: data.conversationId,
  senderId: data.senderId,
  senderAvatar: data.senderDisplayPicture,
  senderName: data.senderName,
  message: data.message,
  isMine: data.isOwnMessage,
  content: data.message,
  messageType: data.messageType || "Text",
  chatType: data.chatType || "Normal",
  metadata: data.metadata || null,
  createdAt: data.createdOn,
  status: data.status || "sent",
});

const useChatMessages = (
  conversationId: string,
  token: string,
  profile: any
) => {
  const [messagesById, setMessagesById] = useState<Map<string, ChatMessage>>(
    new Map()
  );
  const [messageOrder, setMessageOrder] = useState<string[]>([]);
  const [pageToken, setPageToken] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const [hasNewWebSocketMessage, setHasNewWebSocketMessage] = useState(false);
  const [currentToken, setCurrentToken] = useState<string>(token);
  const isRefreshingRef = React.useRef(false);

  const refreshAccessTokenForWs = useCallback(async () => {
    if (isRefreshingRef.current) return false;
    isRefreshingRef.current = true;
    try {
      if (__DEV__) {
        console.log("🔄 Attempting to refresh token for WebSocket...");
      }
      const accessToken = await tokenRefreshManager.refreshToken();
      setCurrentToken(accessToken);
      if (__DEV__) {
        console.log("✅ WS token refreshed; connection will reconnect with new token");
      }
      return true;
    } catch (e: unknown) {
      if (__DEV__) {
        const error = e as { message?: string };
        console.error("❌ WS token refresh failed:", error?.message || e);
      }
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Effect to get the latest token from TokenStore and update WebSocket connection
  useEffect(() => {
    let isMounted = true;
    
    const updateToken = async () => {
      try {
        const latestToken = await TokenStore.getAccessToken();
        if (isMounted && latestToken && latestToken !== currentToken) {
          console.log("🔄 Token updated in useChatMessages - WebSocket will reconnect with new token");
          setCurrentToken(latestToken);
        }
      } catch (error) {
        console.error("Error fetching latest token:", error);
      }
    };

    // Update token immediately
    updateToken();

    // Poll for token updates every 10 seconds to catch refreshes
    const intervalId = setInterval(updateToken, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentToken]);

  // Use the proven production WebSocket approach with current token
  const url = createWebSocketUrl(currentToken);
  const { sendMessage: wssSendMessage, lastMessage, readyState } = useWebSocket(url, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  // Network state monitoring - force reconnect when network comes back
  const lastNetworkStateRef = useRef<boolean>(true);
  const lastPongReceivedRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isNowReachable = !!(state.isConnected && state.isInternetReachable);
      const wasUnreachable = !lastNetworkStateRef.current;
      
      if (__DEV__) {
        console.log('📡 Network state changed:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          wasUnreachable,
          isNowReachable,
        });
      }

      // If network was down and is now back up, force WebSocket reconnect
      if (wasUnreachable && isNowReachable) {
        if (__DEV__) {
          console.log('🔄 Network recovered - forcing WebSocket reconnect by updating token...');
        }
        // Trigger reconnect by updating the token state
        TokenStore.getAccessToken().then((token) => {
          if (token) {
            setCurrentToken(token);
          }
        });
      }
      
      lastNetworkStateRef.current = isNowReachable;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Manual heartbeat mechanism to detect dead connections
  useEffect(() => {
    if (readyState === ReadyState.OPEN && wssSendMessage) {
      // Clear any existing interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Send ping every 30 seconds
      heartbeatIntervalRef.current = setInterval(() => {
        const timeSinceLastPong = Date.now() - lastPongReceivedRef.current;
        
        if (__DEV__) {
          console.log('🏓 Sending heartbeat ping...');
        }

        // Check if we've received a pong recently (within 45 seconds)
        if (timeSinceLastPong > 45000) {
          if (__DEV__) {
            console.warn('⚠️ No pong received in 45s - connection may be dead. Forcing reconnect...');
          }
          // Force reconnect by updating token
          TokenStore.getAccessToken().then((token) => {
            if (token) {
              setCurrentToken(token);
            }
          });
        } else {
          try {
            wssSendMessage(JSON.stringify({ action: 'ping' }));
          } catch (error) {
            if (__DEV__) {
              console.error('❌ Failed to send heartbeat ping:', error);
            }
          }
        }
      }, 30000);

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
  }, [readyState, wssSendMessage]);

  // Connection status logging for debugging
  useEffect(() => {
    if (__DEV__) {
      const statusNames: Record<ReadyState, string> = {
        [ReadyState.CONNECTING]: 'CONNECTING',
        [ReadyState.OPEN]: 'OPEN',
        [ReadyState.CLOSING]: 'CLOSING',
        [ReadyState.CLOSED]: 'CLOSED',
        [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED'
      };
      
      console.log('💬 WebSocket Status:', {
        readyState,
        status: statusNames[readyState] || 'UNKNOWN',
        conversationId,
        hasToken: !!currentToken,
        tokenPrefix: currentToken?.substring(0, 20) + '...',
      });
    }
  }, [readyState, conversationId, currentToken]);

  // WebSocket message handler - production approach
  useEffect(() => {
    if (lastMessage !== null) {
      if (__DEV__) {
        console.log("\n🔔 ═══ RAW WS EVENT ═══");
        console.log("lastMessage type:", typeof lastMessage.data);
        console.log("lastMessage.data preview:", typeof lastMessage.data === "string" ? lastMessage.data.substring(0, 200) : lastMessage.data);
        console.log("═══════════════════════\n");
      }
    }
    
    if (lastMessage !== null && typeof lastMessage.data === "string") {
      try {
        const parsed = JSON.parse(lastMessage.data);
        const actionType = parsed?.action;
        const payload = parsed?.payload;

        if (__DEV__) {
          console.log("\n📨 ═══ RECEIVED WS MESSAGE ═══");
          console.log("Action:", actionType);
          console.log("Target ConversationId:", payload?.conversationId);
          console.log("Current ConversationId:", conversationId);
          console.log("Match:", payload?.conversationId === conversationId);
          console.log("Message ID:", payload?.messageId);
          console.log("Full Data:", JSON.stringify(parsed, null, 2));
          console.log("═══════════════════════════\n");
        }

        // Handle pong response from heartbeat
        if (actionType === 'pong') {
          lastPongReceivedRef.current = Date.now();
          if (__DEV__) {
            console.log('🏓 Pong received - connection alive');
          }
          return;
        }

        // Handle explicit auth error messages from WS and attempt refresh
        const payloadMessage = (payload?.message || "").toString().toLowerCase();
        if (!actionType && payloadMessage.includes("invalid access token")) {
          if (__DEV__) {
            console.log("🛑 WS reported invalid access token - attempting refresh...");
          }
          (async () => {
            const ok = await refreshAccessTokenForWs();
            if (!ok && __DEV__) {
              console.error("❌ WS refresh failed; user may need to re-login");
            }
          })();
          return;
        }

        // If server sends conversationId, prefer exact match; otherwise accept general events
        const appliesToThisConversation =
          !payload?.conversationId || payload?.conversationId === conversationId;

        if (__DEV__) {
          console.log("🔍 Conversation match check:", {
            appliesToThisConversation,
            payloadConversationId: payload?.conversationId,
            currentConversationId: conversationId,
            willProcess: appliesToThisConversation,
          });
        }

        if (appliesToThisConversation) {
          setMessagesById((prevMap) => {
            const newMap = new Map(prevMap);

            switch (actionType) {
              case "incoming_message_update": {
                const msg = newMap.get(payload.messageId);
                if (msg) {
                  newMap.set(payload.messageId, {
                    ...msg,
                    ...payload,
                    messageId: payload?.messageId,
                    content: payload?.message,
                  });
                }
                break;
              }
              case "message_acknowledged": {
                if (__DEV__) {
                  console.log("✅ Message acknowledged:", payload.messageId);
                }
                const msg = newMap.get(payload.messageId);
                if (msg) {
                  newMap.set(payload.messageId, {
                    ...msg,
                    status: "sent",
                    uploadProgress: 100,
                  });
                } else if (__DEV__) {
                  console.warn("⚠️ Acknowledged message not found:", payload.messageId);
                }
                return newMap;
              }
              default: {
                if (__DEV__) {
                  console.log("📩 Incoming message:", {
                    messageId: payload?.messageId,
                    senderId: payload?.senderId,
                    isMine: payload?.senderId === profile?.id,
                    content: payload?.message?.substring(0, 30),
                    requestId: payload?.metadata?.requestId,
                  });
                }

                // ALWAYS compute from senderId - server's isOwnMessage is unreliable
                const isOwn = payload?.senderId === profile?.id;

                // Check for duplicate messages based on requestId (for images)
                // or matching optimistic messages based on content and timestamp
                if (isOwn) {
                  const incomingRequestId = payload?.metadata?.requestId;
                  
                  // Find if we already have this message by requestId
                  if (incomingRequestId) {
                    for (const [existingId, existingMsg] of newMap.entries()) {
                      if (existingMsg.metadata?.requestId === incomingRequestId) {
                        if (__DEV__) {
                          console.log("🔄 Duplicate detected by requestId, updating existing:", existingId);
                        }
                        // Update existing message with server data but keep our messageId
                        newMap.set(existingId, {
                          ...existingMsg,
                          status: "sent",
                          uploadProgress: 100,
                          metadata: { ...existingMsg.metadata, ...payload?.metadata },
                        });
                        // Don't add the new message, we updated the existing one
                        return newMap;
                      }
                    }
                  }
                  
                  // Check if this is a duplicate of an optimistic message (same content within 5 seconds)
                  const payloadTime = new Date(payload?.createdOn || Date.now()).getTime();
                  for (const [existingId, existingMsg] of newMap.entries()) {
                    if (
                      existingMsg.isMine &&
                      existingMsg.messageType === (payload?.messageType || "Text") &&
                      (existingMsg.status === "pending" || existingMsg.status === "uploading" || existingMsg.status === "sent") &&
                      Math.abs(new Date(existingMsg.createdAt).getTime() - payloadTime) < 5000
                    ) {
                      // For images, also check the mediaUrl pattern
                      if (payload?.messageType === "Media" && existingMsg.messageType === "Media") {
                        if (__DEV__) {
                          console.log("🔄 Duplicate image message detected, updating existing:", existingId);
                        }
                        newMap.set(existingId, {
                          ...existingMsg,
                          status: "sent",
                          uploadProgress: 100,
                          metadata: payload?.metadata || existingMsg.metadata,
                        });
                        return newMap;
                      }
                    }
                  }
                }
                
                const normalized: ChatMessage = {
                  messageId: payload?.messageId,
                  conversationId: payload?.conversationId,
                  senderId: payload?.senderId,
                  senderAvatar: payload?.senderDisplayPicture || null,
                  senderName: payload?.senderName || "",
                  message: payload?.message,
                  isMine: isOwn,
                  content: payload?.message,
                  messageType: payload?.messageType || "Text",
                  chatType: payload?.chatType || "Normal",
                  metadata: payload?.metadata || null,
                  createdAt: payload?.createdOn || new Date().toISOString(),
                  status: "sent",
                };

                newMap.set(payload.messageId, normalized);

                setMessageOrder((prevOrder) => {
                  const merged = new Set<string>([...prevOrder, payload.messageId]);
                  const uniqueOrder = Array.from(merged);
                  
                  return uniqueOrder.sort((a: string, b: string) => {
                    const msgA = newMap.get(a);
                    const msgB = newMap.get(b);
                    return (
                      new Date(msgA?.createdAt || 0).getTime() -
                      new Date(msgB?.createdAt || 0).getTime()
                    );
                  });
                });

                // Set flag that we received a new WebSocket message
                setHasNewWebSocketMessage(true);
                break;
              }
            }

            return newMap;
          });
        }
      } catch (parseError) {
        console.error("❌ Error parsing WebSocket message:", parseError, "Raw data:", lastMessage.data);
      }
    }
  }, [lastMessage, conversationId, profile?.id, refreshAccessTokenForWs]);


  // Load initial chat history
  const loadInitialChat = useCallback(async () => {
    if (!conversationId) return;

    // Always get the latest token from TokenStore
    const latestToken = await TokenStore.getAccessToken();
    if (!latestToken) {
      console.error("❌ No access token available");
      return;
    }

    setLoadingInitial(true);
    const query = {
      PageSize: PAGINATION_CONFIG.CONTENT_TYPES.MESSAGES.toString(),
      PageToken: "",
    };

    conversationService
      ?.getUserConversationChat(latestToken, conversationId, query)
      .then((res: any) => {
        setLoadingInitial(false);

        if (res?.responseCode === 401) {
          console.error("❌ 401 error in loadInitialChat - Token may be invalid");
          router.push("/Onboarding");
          return;
        }

        const normalized = (res?.data?.dataset || []).map(normalizeApiMessage);

        const newMap = new Map<string, ChatMessage>();
        normalized.forEach((msg: any) => newMap.set(msg.messageId, msg));

        setMessagesById(newMap);
        setMessageOrder(
          normalized
            .sort(
              (a: ChatMessage, b: ChatMessage) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((msg: ChatMessage) => msg.messageId)
        );

        setPageToken(res?.data?.pageToken || "");
        setHasLoadedInitially(true);
      })
      .catch((error) => {
        console.error("Error loading initial chat:", error);
        setLoadingInitial(false);
      });
  }, [conversationId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!pageToken || !conversationId || loadingMore) return;

    // Always get the latest token from TokenStore
    const latestToken = await TokenStore.getAccessToken();
    if (!latestToken) {
      console.error("❌ No access token available");
      return;
    }

    setLoadingMore(true);
    const query = {
      PageSize: PAGINATION_CONFIG.CONTENT_TYPES.MESSAGES.toString(),
      PageToken: pageToken,
    };

    conversationService
      ?.getUserConversationChat(latestToken, conversationId, query)
      .then((res: any) => {
        setLoadingMore(false);

        if (res?.responseCode === 401) {
          console.error("❌ 401 error in loadMoreMessages - Token may be invalid");
          router.push("/Onboarding");
          return;
        }

        const olderMessages = (res?.data?.dataset || []).map(
          normalizeApiMessage
        );

        setMessagesById((prev) => {
          const newMap = new Map(prev);
          olderMessages.forEach((msg: ChatMessage) =>
            newMap.set(msg.messageId, msg)
          );
          return newMap;
        });

        setMessageOrder((prevOrder) => {
          const allMsgs = [
            ...olderMessages,
            ...(prevOrder
              .map((id) => messagesById.get(id))
              .filter(Boolean) as ChatMessage[]),
          ];
          return allMsgs
            .sort(
              (a: ChatMessage, b: ChatMessage) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((msg: ChatMessage) => msg.messageId);
        });

        setPageToken(res?.data?.pageToken || "");
      })
      .catch((error) => {
        console.error("Error loading more messages:", error);
        setLoadingMore(false);
      });
  }, [pageToken, conversationId, loadingMore, messagesById]);

  // Create optimistic message for images
  const createOptimisticImageMessage = useCallback(
    (localImageUri: string, messageText: string) => {
      const messageId = uuidv4();
      const newMessage: ChatMessage = {
        messageId,
        conversationId,
        senderId: profile?.id || "",
        senderAvatar: profile?.displayPicture || null,
        senderName: profile?.name || "",
        message: messageText,
        isMine: true,
        content: messageText,
        messageType: "Media",
        chatType: "Normal",
        metadata: { mediaUrl: localImageUri },
        localImageUri,
        createdAt: new Date().toISOString(),
        status: "uploading",
        uploadProgress: 0,
        retryCount: 0,
      };

      setMessagesById((prev) => new Map(prev).set(messageId, newMessage));
      setMessageOrder((prevOrder) => {
        const merged = new Set<string>([...prevOrder, messageId]);
        const uniqueOrder = Array.from(merged);
        return uniqueOrder.sort((a: string, b: string) => {
          const msgA = messagesById.get(a) || newMessage;
          const msgB = messagesById.get(b) || newMessage;
          return (
            new Date(msgA.createdAt).getTime() -
            new Date(msgB.createdAt).getTime()
          );
        });
      });

      return messageId;
    },
    [conversationId, profile, messagesById]
  );

  // Update message upload progress
  const updateMessageProgress = useCallback((messageId: string, progress: number) => {
    setMessagesById((prev) => {
      const msg = prev.get(messageId);
      if (!msg) return prev;
      
      const newMap = new Map(prev);
      newMap.set(messageId, {
        ...msg,
        uploadProgress: progress,
        status: "uploading",
      });
      return newMap;
    });
  }, []);

  // Update message status
  const updateMessageStatus = useCallback(
    (messageId: string, status: MessageStatus, error?: string) => {
      setMessagesById((prev) => {
        const msg = prev.get(messageId);
        if (!msg) return prev;

        const newMap = new Map(prev);
        newMap.set(messageId, {
          ...msg,
          status,
          uploadError: error,
          uploadProgress: status === "sent" ? 100 : msg.uploadProgress,
        });
        return newMap;
      });
    },
    []
  );

  // Send message after upload completes
  const sendUploadedImageMessage = useCallback(
    (messageId: string, imageUri: string, requestId: string, messageText: string) => {
      const connectMessage = {
        action: "send_message",
        payload: {
          conversationId,
          message: messageText,
          messageType: "Media",
          senderId: profile?.id,
          messageId,
          metadata: {
            mediaUrl: imageUri,
            requestId: requestId,
          },
        },
      };

      console.log("💬 Sending uploaded image message via WebSocket:", {
        messageId,
        imageUri: imageUri.substring(0, 50) + "...",
        requestId,
      });

      // Ensure token is valid before sending image message
      const sendImageMessage = async () => {
        try {
          const isExpired = await TokenStore.isAccessTokenExpired();
          const shouldRefresh = await TokenStore.shouldRefreshAccessToken(2);
          
          if (isExpired || shouldRefresh) {
            if (__DEV__) {
              console.log("🔄 Token expired, refreshing before image message send...");
            }
            const newToken = await tokenRefreshManager.refreshToken();
            if (newToken) {
              setCurrentToken(newToken);
            } else {
              throw new Error("Token refresh failed");
            }
          }

          wssSendMessage(JSON.stringify(connectMessage));
          
          // Mark as sent immediately after successful WebSocket send
          setMessagesById((prev) => {
            const msg = prev.get(messageId);
            if (!msg) return prev;

            const newMap = new Map(prev);
            newMap.set(messageId, {
              ...msg,
              metadata: {
                ...msg.metadata,
                mediaUrl: imageUri,
                requestId,
              },
              status: "sent",
              uploadProgress: 100,
            });
            return newMap;
          });
          
          console.log(`✅ Image message ${messageId} marked as sent`);
        } catch (error) {
          console.error(`❌ Failed to send image message via WebSocket:`, error);
          setMessagesById((prev) => {
            const msg = prev.get(messageId);
            if (!msg) return prev;

            const newMap = new Map(prev);
            newMap.set(messageId, {
              ...msg,
              metadata: {
                ...msg.metadata,
                mediaUrl: imageUri,
                requestId,
              },
              status: "pending",
            });
            return newMap;
          });
        }
      };

      sendImageMessage();
    },
    [conversationId, profile, wssSendMessage]
  );

  // Ensure valid token and refresh if needed before sending
  const ensureValidTokenForSend = useCallback(async (): Promise<boolean> => {
    try {
      const isExpired = await TokenStore.isAccessTokenExpired();
      const shouldRefresh = await TokenStore.shouldRefreshAccessToken(2);
      
      if (isExpired || shouldRefresh) {
        if (__DEV__) {
          console.log("🔄 Token expired or expiring, refreshing before WebSocket send...");
        }
        const newToken = await tokenRefreshManager.refreshToken();
        if (newToken) {
          setCurrentToken(newToken);
          if (__DEV__) {
            console.log("✅ Token refreshed, WebSocket will reconnect with new token");
          }
          return true;
        }
        return false;
      }
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("❌ Token validation failed:", error);
      }
      return false;
    }
  }, []);

  // Send a new message - simplified production approach
  const sendMessage = useCallback(
    (
      content: string,
      type: "Text" | "Image" = "Text",
      imageUri?: string,
      requestId?: string,
      message?: string
    ) => {
      if (!content.trim() && type === "Text") return;
      if (type === "Image" && !imageUri) return;

      const messageId = uuidv4();
      const newMessage: ChatMessage = {
        messageId,
        conversationId,
        senderId: profile?.id || "",
        senderAvatar: profile?.displayPicture || null,
        senderName: profile?.name || "",
        message: type === "Text" ? content : "",
        isMine: true,
        content: type === "Text" ? content : "",
        messageType: type,
        chatType: "Normal",
        metadata: type === "Image" ? { uri: imageUri } : null,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      setMessagesById((prev) => new Map(prev).set(messageId, newMessage));
      setMessageOrder((prevOrder) => {
        const merged = new Set<string>([...prevOrder, messageId]);
        const uniqueOrder = Array.from(merged);
        return uniqueOrder.sort((a: string, b: string) => {
          const msgA = messagesById.get(a) || newMessage;
          const msgB = messagesById.get(b) || newMessage;
          return (
            new Date(msgA.createdAt).getTime() -
            new Date(msgB.createdAt).getTime()
          );
        });
      });

      const connectMessage = imageUri
        ? {
            action: "send_message",
            payload: {
              conversationId,
              message: message,
              messageType: "Media",
              senderId: profile?.id,
              messageId,
              metadata: {
                mediaUrl: imageUri,
                requestId: requestId,
              },
            },
          }
        : {
            action: "send_message",
            payload: {
              conversationId,
              message: content,
              messageType: type === "Text" ? 1 : 2,
              messageId,
              senderId: profile?.id,
            },
          };

      // Ensure token is valid before sending, refresh if needed
      ensureValidTokenForSend().then((isValid) => {
        if (!isValid) {
          if (__DEV__) {
            console.error("❌ Cannot send message - token validation failed");
          }
          setMessagesById((prev) => {
            const newMap = new Map(prev);
            const msg = newMap.get(messageId);
            if (msg) {
              newMap.set(messageId, { ...msg, status: "failed" });
            }
            return newMap;
          });
          return;
        }

        if (__DEV__) {
          console.log("\n📤 ═══ SENDING MESSAGE ═══");
          console.log("Message ID:", messageId);
          console.log("Type:", type);
          console.log("WS ReadyState:", readyState, "(1=OPEN)");
          console.log("Has Token:", !!currentToken);
          console.log("Full Payload:", JSON.stringify(connectMessage, null, 2));
          console.log("═══════════════════════════\n");
        }

        try {
          wssSendMessage(JSON.stringify(connectMessage));
          if (__DEV__) {
            console.log("✅ Message sent to WebSocket successfully");
          }
        } catch (error) {
          console.error("❌ Failed to send message:", error);
          setMessagesById((prev) => {
            const newMap = new Map(prev);
            const msg = newMap.get(messageId);
            if (msg) {
              newMap.set(messageId, { ...msg, status: "failed" });
            }
            return newMap;
          });
        }
      });

      return messageId;
    },
    [conversationId, profile, wssSendMessage, messagesById, readyState, currentToken, ensureValidTokenForSend]
  );

  // Retry a failed text message using its original messageId
  const retryTextMessage = useCallback((messageId: string) => {
    const failed = messagesById.get(messageId);
    if (!failed) return;
    if (failed.messageType === "Media") return;

    setMessagesById((prev) => {
      const msg = prev.get(messageId);
      if (!msg) return prev;
      const newMap = new Map(prev);
      newMap.set(messageId, {
        ...msg,
        status: "pending",
        uploadError: undefined,
        createdAt: new Date().toISOString(),
        retryCount: (msg.retryCount || 0) + 1,
      });
      return newMap;
    });

    const connectMessage = {
      action: "send_message",
      payload: {
        conversationId,
        message: failed.content,
        messageType: 1,
        messageId,
        senderId: profile?.id,
      },
    } as const;

    try {
      wssSendMessage(JSON.stringify(connectMessage));
    } catch {
      setMessagesById((prev) => {
        const msg = prev.get(messageId);
        if (!msg) return prev;
        const newMap = new Map(prev);
        newMap.set(messageId, { ...msg, status: "failed" });
        return newMap;
      });
    }
  }, [conversationId, profile?.id, wssSendMessage, messagesById]);

  // Mark failed messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessagesById((prev) => {
        const newMap = new Map(prev);
        let hasChanges = false;

        for (const [id, msg] of newMap.entries()) {
          // Increased timeout from 10s to 20s to allow more time for WebSocket acknowledgment
          // Special handling: Don't mark image messages as failed if they have metadata.mediaUrl
          // (indicates successful upload) - they might just be waiting for WebSocket acknowledgment
          const isImageWithSuccessfulUpload = 
            msg.messageType === "Media" && 
            msg.metadata?.mediaUrl && 
            !msg.metadata.mediaUrl.startsWith('file://');
          
          const timeoutMs = isImageWithSuccessfulUpload ? 30000 : 20000; // 30s for images, 20s for text
          
          if (
            msg.status === "pending" &&
            Date.now() - new Date(msg.createdAt).getTime() > timeoutMs
          ) {
            newMap.set(id, { ...msg, status: "failed" });
            hasChanges = true;
            if (__DEV__) {
              console.log("⏰ Message timeout:", {
                messageId: id,
                timeoutMs,
                content: msg.content?.substring(0, 30),
                type: msg.messageType,
              });
            }
          }
        }

        return hasChanges ? newMap : prev;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Get sorted messages for rendering
  const sortedMessages = React.useMemo(
    () => {
      const messages = messageOrder
        .map((id) => messagesById.get(id))
        .filter(Boolean) as ChatMessage[];
      
      console.log("\n🎨 ═══════ RENDERING MESSAGES ═══════");
      console.log("📊 Total messages to render:", messages.length);
      console.log("📊 messageOrder length:", messageOrder.length);
      console.log("📊 messagesById size:", messagesById.size);
      
      messages.forEach((msg, index) => {
        console.log(`  [${index}] ID: ${msg.messageId.substring(0, 8)}... | isMine: ${msg.isMine} | Content: "${msg.content?.substring(0, 20)}..." | Status: ${msg.status}`);
      });
      
      console.log("═══════════════════════════════════\n");
      
      return messages;
    },
    [messagesById, messageOrder]
  );

  // Get message by ID for retry
  const getMessageById = useCallback((messageId: string) => {
    return messagesById.get(messageId);
  }, [messagesById]);

  // Refresh to get latest messages
  const [refreshing, setRefreshing] = useState(false);

  const refreshLatestMessages = useCallback(async () => {
    if (!conversationId || refreshing) return;

    // Always get the latest token from TokenStore
    const latestToken = await TokenStore.getAccessToken();
    if (!latestToken) {
      console.error("❌ No access token available");
      return;
    }

    console.log("🔄 Refreshing latest messages...");
    setRefreshing(true);

    // Get the latest message timestamp to fetch only newer messages
    const latestMessage = sortedMessages[sortedMessages.length - 1];
    const latestTimestamp = latestMessage?.createdAt;

    const query = {
      PageSize: "20", // Fetch more to ensure we get new messages
      PageToken: "", // Start from the beginning (most recent)
    };

    try {
      const res: any = await conversationService?.getUserConversationChat(
        latestToken,
        conversationId,
        query
      );

      setRefreshing(false);

      if (res?.responseCode === 401) {
        console.error("❌ 401 error in refreshLatestMessages - Token may be invalid");
        router.push("/Onboarding");
        return;
      }

      const normalized = (res?.data?.dataset || []).map(normalizeApiMessage);

      // Filter to only include messages newer than our latest
      const newerMessages = latestTimestamp
        ? normalized.filter(
            (msg: ChatMessage) =>
              new Date(msg.createdAt).getTime() > new Date(latestTimestamp).getTime()
          )
        : normalized;

      if (newerMessages.length > 0) {
        console.log(`✅ Found ${newerMessages.length} new messages`);

        setMessagesById((prev) => {
          const newMap = new Map(prev);
          newerMessages.forEach((msg: ChatMessage) =>
            newMap.set(msg.messageId, msg)
          );
          return newMap;
        });

        setMessageOrder((prevOrder) => {
          const allMsgs = [
            ...(prevOrder
              .map((id) => messagesById.get(id))
              .filter(Boolean) as ChatMessage[]),
            ...newerMessages,
          ];
          return allMsgs
            .sort(
              (a: ChatMessage, b: ChatMessage) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((msg: ChatMessage) => msg.messageId);
        });

        setHasNewWebSocketMessage(true);
      } else {
        console.log("ℹ️ No new messages found");
      }
    } catch (error) {
      console.error("❌ Error refreshing latest messages:", error);
      setRefreshing(false);
    }
  }, [conversationId, refreshing, sortedMessages, messagesById]);

  return {
    messages: sortedMessages,
    sendMessage,
    retryTextMessage,
    loadInitialChat,
    loadMoreMessages,
    refreshLatestMessages,
    loadingInitial,
    loadingMore,
    refreshing,
    hasLoadedInitially,
    hasNewWebSocketMessage,
    setHasNewWebSocketMessage,
    createOptimisticImageMessage,
    updateMessageProgress,
    updateMessageStatus,
    sendUploadedImageMessage,
    getMessageById,
    isConnected: readyState === WebSocket.OPEN,
    isConnecting: readyState === WebSocket.CONNECTING,
    connectionError: readyState === WebSocket.CLOSED ? "Connection closed" : null,
    readyState,
  };
};

export default useChatMessages;
