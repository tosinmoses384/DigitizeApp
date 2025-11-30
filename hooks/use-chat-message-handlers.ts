import { useCallback, useRef } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { generateGUID } from "@helper/guid-number";
import fileServerServices from "@services/features/file-server/fileServer";
import { useI18n } from "@hooks/use-i18n";
import { ChatMessage, MessageStatus } from "models/ChatMessage";
import TokenStore from "../utils/tokenStore";
import tokenRefreshManager from "../utils/tokenRefreshManager";

interface UseChatMessageHandlersParams {
  isOffline: boolean;
  sendMessage: (
    content: string,
    type?: "Text" | "Image",
    imageUri?: string,
    requestId?: string,
    message?: string
  ) => string | undefined;
  createOptimisticImageMessage: (localImageUri: string, messageText: string) => string;
  updateMessageProgress: (messageId: string, progress: number) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus, error?: string) => void;
  sendUploadedImageMessage: (
    messageId: string,
    serverImageUrl: string,
    requestId: string,
    messageText: string
  ) => void;
  getMessageById: (messageId: string) => ChatMessage | undefined;
  retryTextMessage: (messageId: string) => void;
  token: string;
  setToastDetails: (details: { message: string; type: string; duration: number } | null) => void;
}

interface UseChatMessageHandlersReturn {
  handleSendTextMessage: (text: string) => Promise<void>;
  handleSendImageMessage: (localImageUri: string, messageText: string) => Promise<void>;
  handleRetryMessage: (messageId: string) => Promise<void>;
}

const ensureValidToken = async (currentToken: string): Promise<string | null> => {
  try {
    const isExpired = await TokenStore.isAccessTokenExpired();
    const shouldRefresh = await TokenStore.shouldRefreshAccessToken(2);
    
    if (isExpired || shouldRefresh) {
      if (__DEV__) {
        console.log("🔄 Token expired or expiring soon, refreshing before send...");
      }
      const newToken = await tokenRefreshManager.refreshToken();
      if (__DEV__) {
        console.log("✅ Token refreshed successfully before send");
      }
      return newToken;
    }
    
    return currentToken;
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Failed to ensure valid token:", error);
    }
    return null;
  }
};

export const useChatMessageHandlers = ({
  isOffline,
  sendMessage,
  createOptimisticImageMessage,
  updateMessageProgress,
  updateMessageStatus,
  sendUploadedImageMessage,
  getMessageById,
  retryTextMessage,
  token,
  setToastDetails,
}: UseChatMessageHandlersParams): UseChatMessageHandlersReturn => {
  const { t } = useI18n();
  const inFlightUploadsRef = useRef<Set<string>>(new Set());

  const handleSendTextMessage = useCallback(async (text: string) => {
    if (isOffline) {
      return;
    }

    const validToken = await ensureValidToken(token);
    if (!validToken) {
      setToastDetails({
        message: t('chat.sessionExpired'),
        type: "error",
        duration: 4000,
      });
      router.push("/Onboarding");
      return;
    }
    
    sendMessage(text, "Text");
  }, [isOffline, sendMessage, token, setToastDetails, t]);

  const handleSendImageMessage = useCallback(async (localImageUri: string, messageText: string) => {
    if (isOffline) {
      return;
    }

    if (inFlightUploadsRef.current.has(localImageUri)) {
      if (__DEV__) {
        console.log("⚠️ Duplicate upload prevented for:", localImageUri.substring(0, 50));
      }
      return;
    }

    const validToken = await ensureValidToken(token);
    if (!validToken) {
      setToastDetails({
        message: t('chat.sessionExpired'),
        type: "error",
        duration: 4000,
      });
      router.push("/Onboarding");
      return;
    }

    inFlightUploadsRef.current.add(localImageUri);

    const optimisticMessageId = createOptimisticImageMessage(localImageUri, messageText);
    
    try {
      const getGuid = generateGUID();
      const isAndroid = Platform.OS === "android";

      const imageData = [{
        uri: localImageUri,
        type: "image",
        mimeType: "image/jpeg",
        fileName: `image.jpeg`,
      }];

      updateMessageProgress(optimisticMessageId, 10);

      const uploadResponse = await fileServerServices.postConversationImageUpload(
        imageData,
        isAndroid,
        getGuid,
        validToken
      );

      updateMessageProgress(optimisticMessageId, 90);

      if (uploadResponse?.status === 200) {
        const serverImageUrl = (uploadResponse.data as any)?.[0]?.resourceUrl;
        const requestId = (uploadResponse.data as any)?.[0]?.requestId;

        updateMessageProgress(optimisticMessageId, 100);

        sendUploadedImageMessage(
          optimisticMessageId,
          serverImageUrl,
          requestId,
          messageText
        );
      } else if (uploadResponse?.responseCode === 401) {
        updateMessageStatus(optimisticMessageId, "failed" as MessageStatus, "Authentication failed");
        router.push("/Onboarding");
      } else {
        const errorMessage = uploadResponse?.detail || uploadResponse?.message || "Upload failed";
        updateMessageStatus(optimisticMessageId, "failed" as MessageStatus, errorMessage);
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      }
    } catch {
      updateMessageStatus(optimisticMessageId, "failed" as MessageStatus, "Failed to upload image");
      setToastDetails({
        message: t('chat.failedToUpload'),
        type: "error",
        duration: 4000,
      });
    } finally {
      inFlightUploadsRef.current.delete(localImageUri);
    }
  }, [
    isOffline,
    createOptimisticImageMessage,
    updateMessageProgress,
    updateMessageStatus,
    sendUploadedImageMessage,
    token,
    setToastDetails,
    t,
  ]);

  const handleRetryMessage = useCallback(async (messageId: string) => {
    const failedMessage = getMessageById(messageId);
    if (!failedMessage) return;
    
    const retryCount = (failedMessage.retryCount || 0) + 1;
    if (retryCount > 3) {
      setToastDetails({
        message: t('chat.maxRetryAttempts'),
        type: "error",
        duration: 4000,
      });
      return;
    }

    const validToken = await ensureValidToken(token);
    if (!validToken) {
      setToastDetails({
        message: t('chat.sessionExpired'),
        type: "error",
        duration: 4000,
      });
      router.push("/Onboarding");
      return;
    }

    if (!failedMessage.localImageUri) {
      retryTextMessage(messageId);
      return;
    }

    updateMessageStatus(messageId, "uploading" as MessageStatus);

    try {
      const getGuid = generateGUID();
      const isAndroid = Platform.OS === "android";

      const imageData = [{
        uri: failedMessage.localImageUri,
        type: "image",
        mimeType: "image/jpeg",
        fileName: `image.jpeg`,
      }];

      updateMessageProgress(messageId, 10);

      const uploadResponse = await fileServerServices.postConversationImageUpload(
        imageData,
        isAndroid,
        getGuid,
        validToken
      );

      updateMessageProgress(messageId, 90);

      if (uploadResponse?.status === 200) {
        const serverImageUrl = (uploadResponse.data as any)?.[0]?.resourceUrl;
        const requestId = (uploadResponse.data as any)?.[0]?.requestId;

        updateMessageProgress(messageId, 100);

        sendUploadedImageMessage(
          messageId,
          serverImageUrl,
          requestId,
          failedMessage.content
        );
      } else {
        const errorMessage = uploadResponse?.detail || uploadResponse?.message || "Upload failed";
        updateMessageStatus(messageId, "failed" as MessageStatus, errorMessage);
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      }
    } catch {
      updateMessageStatus(messageId, "failed" as MessageStatus, "Failed to upload image");
      setToastDetails({
        message: t('chat.failedToUpload'),
        type: "error",
        duration: 4000,
      });
    }
  }, [
    getMessageById,
    updateMessageStatus,
    updateMessageProgress,
    sendUploadedImageMessage,
    retryTextMessage,
    token,
    setToastDetails,
    t,
  ]);

  return {
    handleSendTextMessage,
    handleSendImageMessage,
    handleRetryMessage,
  };
};

