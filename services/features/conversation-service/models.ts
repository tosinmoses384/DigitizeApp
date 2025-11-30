export interface IUserConversationByIdResponse {
    data: [
      {
        id: string,
        displayPicture: string,
        name: string,
        description: string,
        conversationType: string,
        recipientUserId: string,
        lastUpdated: string,
        createdByUserId: string
      }
      ],
      message: string,
      responseCode: string
}


export interface IUserConversationByIdRequest {
  PageSize: string,
  PageToken: string,

}




