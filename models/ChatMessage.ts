export type MessageStatus = "pending" | "uploading" | "sent" | "failed";

export type ChatMessage = {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderAvatar: string | null;
  senderName: string;
  message: string;
  isMine: boolean;
  content: string;
  messageType: "Text" | "Image" | "Media" | string;
  chatType: "Normal" | string;
  metadata: Record<string, any> | null;
  createdAt: string;
  status?: MessageStatus;
  uploadProgress?: number;
  uploadError?: string;
  localImageUri?: string;
  retryCount?: number;
};