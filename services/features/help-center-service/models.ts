export interface IHelpCenterCategoryResponse {
       data: [
     {
      id: string,
      name: string,
      languageCode: string,
      language: string,
      imageUrl: string
    }
  ],
  message: string,
  responseCode: string
}

export interface IHelpCenterPagesRequest {
  languageCode?:string,
  PageCategoryId:string,
  PageSize?:number,
  PageToken?:string,
}

export interface IHelpCenterPagesResponse {
data: {
    dataset: [],
    pageSize: number,
    pageItemCount: number,
    pageToken: string,
    hasNextPage: boolean
  },
message: string,
responseCode: string
}







