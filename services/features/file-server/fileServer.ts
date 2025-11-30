// import { API_BASE_URL } from "@/configs/app-config";

import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import {
  IItemImageUploadRequest,
  IProfileImageUploadRequest,
  IProfileImageUploadResponse,
  IUploadLinkRequest,
  IUploadLinkResponse,
} from "./models";

const fileServerServices = {
  profileImageUpload: (
    model: any,
    isAndroid: boolean,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid
          ? data?.imageUri
          : data?.imageUri?.replace("file://", ""),
        name: data?.imageUri?.split("/").pop(),
        type: data?.type,
      };

      formData.append("file", newData);
    });

    return endpointService.Post<
      IProfileImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/profile`,
      formData,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  itemImageUpload: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    console.log("=== fileServer: itemImageUpload ===");
    console.log("Request ID:", requestId);
    console.log("Is Android:", isAndroid);
    console.log("Model data count:", model?.length);

    model?.forEach((data: any, idx: number) => {
      const originalUri = data?.imageUri;
      const processedUri = isAndroid
        ? data?.imageUri
        : data?.imageUri?.replace("file://", "");
      const extractedName = data?.imageUri?.split("/").pop();
      
      let newData = {
        uri: processedUri,
        name: extractedName,
        type: data?.type,
      };

      console.log(`FormData entry ${idx + 1}:`, JSON.stringify(newData, null, 2));
      formData.append("files", newData);
    });

    return endpointService.Post<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/listings`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          "Content-Type": "multipart/form-data",
          requestId,
        },
      }
    );
  },

  postTimeLineImageUpload: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid
          ? data?.imageUri
          : data?.imageUri?.replace("file://", ""),
        name: data?.imageUri?.split("/").pop(),
        type: data?.type,
      };

      formData.append("file", newData);
    });

    return endpointService.Post<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/timeline-posts`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          "Content-Type": "multipart/form-data",
          requestId,
        },
      }
    );
  },

  postStoryImageUpload: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid ? data?.uri : data?.uri?.replace("file://", ""),
        name: data?.uri?.split("/").pop(),
        type: data?.mimeType,
      };

      formData.append("file", newData);
    });

    return endpointService.Post<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/timeline-stories/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          requestId,
        },
      }
    );
  },

  postConversationImageUpload: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid ? data?.uri : data?.uri?.replace("file://", ""),
        name: data?.uri?.split("/").pop(),
        type: data?.mimeType,
      };

      formData.append("files", newData);
    });

    return endpointService.Post<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/conversation-media/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          "Content-Type": "multipart/form-data",
          requestId,
        },
      }
    );
  },

  outfitImageUpload: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid
          ? data?.imageUri
          : data?.imageUri?.replace("file://", ""),
        name: data?.imageUri?.split("/").pop(),
        type: data?.type,
      };
      formData.append("files", newData);
    });

    return endpointService.Post<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/outfits`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          "Content-Type": "multipart/form-data",
          requestId,
        },
      }
    );
  },

  updateOutfitImage: (
    model: any,
    isAndroid: boolean,
    requestId: string,
    token: string,
    oldResourceName: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    let formData: any = new FormData();

    model?.forEach((data: any) => {
      let newData = {
        uri: isAndroid
          ? data?.imageUri
          : data?.imageUri?.replace("file://", ""),
        name: data?.imageUri?.split("/").pop(),
        type: data?.type,
      };
      formData.append("file", newData);
    });

    return endpointService.Put<
      IItemImageUploadRequest,
      IProfileImageUploadResponse
    >(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/outfits`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          requestId,
          oldResourceName,
        },
      }
    );
  },

  deleteItemImage: (
    token: string,
    requestId: string,
    resourceName: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Delete(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/listings/${requestId}/image`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          resourceName,
        },
      }
    );
  },

  getUserProfilePicture: (
    token: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/profile`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getUserItemPicture: (
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/items/${requestId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
  getTransparentItemPicture: (
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/items/${requestId}/transparent-image`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getUserItemListPicture: (
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/listings/${requestId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getTimeLineImagePicture: (
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/timeline-posts/${requestId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getUserOutfitPicture: (
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/outfits/${requestId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  getTransparentOutfitPicture: (
    token: string,
    resourceName: string,
    requestId: string
  ): Promise<ApiResponsePayload<IProfileImageUploadResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/items/${requestId}/transparent-image`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
          resourceName,
        },
      }
    );
  },

  uploadLink: (
    model: IUploadLinkRequest,
    token: string,
    requestId: string
  ): Promise<ApiResponsePayload<IUploadLinkResponse>> => {
    return endpointService.Post<IUploadLinkRequest, IUploadLinkResponse>(
      `${process.env.EXPO_PUBLIC_FILE_SERVER_BASE_URL}/api/v1/timeline-stories/video/upload-link`,
      {
        resourceName: model?.resourceName,
        contentType: model?.contentType,
        fileSize: model?.fileSize,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          requestId,
        },
      }
    );
  },

  uploadVideo: (url: string, file: any): Promise<ApiResponsePayload<any>> => {
    return endpointService.Put<any, IUploadLinkResponse>(
      `${url}`,
      {
        file: file,
      }
      // {
      //     headers: {
      //         Authorization:`Bearer ${token}`, //Change value
      //         requestId
      //     }
      // }
    );
  },
};
export default fileServerServices;
