// import { API_BASE_URL } from "@/configs/app-config";
// import { API_BASE_URL } from "../../../configs/app-config";
import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import {
  IUserConversationByIdRequest,
  IUserConversationByIdResponse,
} from "./models";

const conversationService = {
  getUserConversation: (
    token: string,
    { PageSize, PageToken }: IUserConversationByIdRequest
  ): Promise<ApiResponsePayload<IUserConversationByIdResponse>> => {
    return endpointService.GetWithParams(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/conversations/v1/user-conversations`,
      {
        PageSize,
        PageToken,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getUserConversationChat: (
    token: string,
    conversationId: string,
    { PageSize, PageToken }: IUserConversationByIdRequest
  ): Promise<ApiResponsePayload<IUserConversationByIdResponse>> => {
    return endpointService.GetWithParams(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/conversations/v1/user-conversations/${conversationId}/chats`,
      {
        PageSize,
        PageToken,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
};
export default conversationService;
