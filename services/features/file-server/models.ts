export interface IProfileImageUploadRequest {
    file: any;
}

export interface IItemImageUploadRequest {
  files: any;
}
export interface IProfileImageUploadResponse {
  data: {
    requestId:  string ,
    resourceName :  string ,
    resourceUrl :  string ,
    resourcePath :  string ,
    resourceOwnerId : string ,
    resourceType :  string ,
    fileExtension :  string ,
    ContentType :  string ,
    storageLocation: number
  },
  message: string,
  responseCode: string
}

export interface IUploadLinkRequest {
  resourceName: string,
  contentType: string,
  fileSize: number
}

export interface IUploadLinkResponse {
data: {
    requestId: string,
    resourceName: string,
    resourceFolderName: string,
    resourceUrl: string,
    resourcePath: string,
    resourceOwnerId: string,
    resourceType: string,
    fileExtension: string,
    contentType: string,
    storageLocation: string
  },
  message: string,
  responseCode: string,
  status: 0
}







