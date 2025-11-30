export interface ICreatePostRequest {
  requestId: string,
  isRequestIdWardrobeItemId: boolean,
  caption: string,
  tagIds: []
}

export interface IEditPostRequest {
  caption: string,
  tagIds: []
}

export interface ICreatePostResponse {
    data: {
    id: string,
    wardrobeItemId: string,
    caption: string,
    type: string,
    tagIds: [ ],
    createdOn: string
  },
  message: string,
  responseCode: string
}

export interface IIsLikePostResponse {

    data: {
      postId: string,
      succeeded: boolean
    },
    message: string,
    responseCode: string
  
}


export interface IEditPostResponse {
  data: {
  id: string,
  wardrobeItemId: string,
  caption: string,
  type: string,
  tagIds: [ ],
  createdOn: string
},
message: string,
responseCode: string
}

export interface IPostsResponse {
  data: {
      dataset: [],
      pageSize: number,
      pageItemCount: 0,
      pageToken: number,
      hasNextPage: boolean
    },
    message: string,
    responseCode: string
}

export interface ICommentResponse {
    data: [
      {
        id: string,
        posterUserId: string,
        posterUsername: string,
        posterUserImageUrl: string,
        comment: string,
        isEdited: boolean,
        updatedOn: string
      }
    ],
    message: string,
    responseCode: string
}

export interface IPostByIdResponse {

    data: {
      id: string,
      caption: string,
      type: string,
      likesCount: number,
      commentCount: number,
      posterUserId: string,
      posterUsername: string,
      posterUserImageUrl: string,
      posterUserRatings: number,
      posterIsVerified: boolean,
      tags: [
        {
          id: string,
          itemId: string,
          itemImageUrl: string,
          itemAmount: 0,
          type: string
        }
      ],
      itemRecommendations: [
        {
          itemId: string,
          itemImageUrl: string,
          itemAmount: number
        }
      ],
      createdOn: string
    },
    message: string,
    responseCode: string

}

export interface IPostCommentRequest {
   comment: string
}

export interface IPostCommentResponse {
  data: {
    id: string,
    posterUserId: string,
    posterUsername: string,
    posterUserImageUrl: string,
    comment: string,
    isEdited: true,
    updatedOn: string
  },
  message: string,
  responseCode: string
}

export interface IPostStoryRequest {
  requestId: string,
  storyType: string,
  caption: string,
  tagIds: any
}

export interface IPostStoryResponse {
  data: {
    id: string,
    caption: string,
    storyType: string,
    storyMediaUrl: string,
    storyTags:any,
    createdOn: string
  },
  message: string,
  responseCode: string,
  status: number
}

export interface IDeleteStoryResponse {
  data: {
    id: string,
    caption: string,
    storyMediaUrl: string,
    storyTags: [
      {
        id: string,
        name: string,
        imageUrl: string,
        amount: 0,
        currencySymbol: string,
        type: any,
        countryId: string
      }
    ]
  },
  message: string,
  responseCode: string,
  status: number
}

export interface IStoryTagRequest {
  caption?: string,
  tagIds: any
}

export interface IStoryTagResponse {
   data : {
     id :  string ,
     caption :  string ,
     storyMediaUrl :  string ,
     type :  string ,
     tags : any
  },
   message :  string ,
   responseCode :  string ,
   status : 0
}

export interface IStoryByIdResponse {

  data: {
    id: string,
    caption: string,
    type: string,
    likesCount: number,
    commentCount: number,
    tags: [
      {
        id: string,
        itemId: string,
        itemImageUrl: string,
        itemAmount: 0,
        type: string
      }
    ],
    itemRecommendations: [
      {
        itemId: string,
        itemImageUrl: string,
        itemAmount: number
      }
    ],
    createdOn: string
  },
  message: string,
  responseCode: string

}

export interface IViewedStoryResponse {
   data: {
    id: string,
    succeeded: boolean
  },
  message: string,
  responseCode: string,
  status: number
}

export interface IReportPostRequest {
  reason: string;
  comment: string;
  action: string; // e.g., 'ReportOnly' or 'BlockAndReport'
}

export interface IReportPostResponse {
  message: string;
  responseCode: string;
}


