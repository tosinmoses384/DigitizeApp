export interface ILoginRequest {
    emailAddress: string,
    password: string,
}
export interface ILoginResponse {
        data:{
        accessToken: string,
        expiry: string,
        expiresIn: number,
        refreshToken: string,
        idToken: string,
        userGroups: [
          string
        ],
        userType: string,
        onboardingStatus: number,
        currentOnboardingStep: number
        },
        message: string,
        responseCode: string
}

export interface IUserOnboardingStepOneResponse {
  data: {
    isVerified: boolean
  },
  errors:any,
  message: string,
  responseCode: string
}
export interface IUserOnboardingStepOneRequest {
  countryCode: string,
  firstName: string,
  lastName: string,
  emailAddress: string,
  phone: string
}
export interface IUserVerificationRequest {
  emailAddress: string,
}

export interface IUserVerificationResponse {

    data: {
      succeeded: boolean
      duration:string
    },
    message: string,
    responseCode: string

}

export interface ISubmitUserVerificationRequest {
  emailAddress: string,
  verificationCode: string
}

export interface ISubmitForgotPasswordVerificationCode {
  emailAddress: string,
  resetCode: string
}

export interface ISubmitUserVerificationResponse {

  data: {
    isVerified: boolean
  },
  message: string,
  responseCode: string

}
export interface ISubmitForgotPasswordVerificationResponse {

  data:{
    isValid:boolean
  },
  message: string,
  responseCode: string

}

export interface ICreatePasswordRequest {
  emailAddress: string,
  verificationCode: string,
  password: string,
}

export interface ICreatePasswordResponse {

  data: any,
  message: string,
  responseCode: string

}

export interface IGetProfileResponse {
    id: string,
    profileImageUrl: string,
    firstName: string,
    lastName: string,
    userType: string,
    emailAddress: string,
    phoneNumber: string,
    createdOn: string,
    currentOnboardingStep: number,
    onboardingStatus: number,
    biography?: string,
    countryId?: string,
    locationId?: string,
    countryName?: string,
    locationName?: string,
    shouldShowLocation?: boolean,
    actionRequired?: string | null
}

export interface IRequestPasswordResetResponse {

      succeeded: boolean,
      duration: string
      message: string,
      responseCode: string

}

export interface IRequestPasswordResetRequest {
  emailAddress: string,

}

export interface ICreateNewPasswordResetRequest {
  emailAddress: string,
  resetCode: string,
  newPassword: string,
  // confirmPassword: string
}

export interface ICreateNewPasswordResetResponse {
  data:  {
    message: string
  },
  message: string,
  responseCode: string

}

export interface IUploadProfilleDetailsRequest {
  biography: string,
  countryId: string,
  locationId: string,
  languageId?: string,
  shouldShowLocation: boolean,
  dateOfBirth?:any;
  firstName?:string;
  lastName?:string;
  gender?:string;
}

export interface IUploadProfilleDetailsResponse {
  data: any,
  message: string,
  responseCode: string

}
export interface IChangePasswordRequest {
  oldPassword: string,
  newPassword: string,
  confirmPassword:string

}

export interface IChangePasswordResponse {
  data:  {
    isSuccessful: boolean
  },
  message: string,
  responseCode: string

}

export interface IGetShippingAddressResponse {
  data: {
    id: string,
    contactName: string,
    addressLine1: string,
    addressLine2: string,
    postalCode: string,
    locationId: string,
    countryId: string,
    deliveryInstructions: string
  },
  message: string,
  responseCode: string
}

export interface IShippingAddressRequest {
  contactName: string,
  addressLine1: string,
  addressLine2: string,
  postalCode: string,
  locationId: string,
  countryId: string,
  deliveryInstructions: string
}

export interface IShippingAddressResponse {
  data:  {
    id: string,
    isSuccessful: boolean
  },
  message: string,
  responseCode: string

}

export interface ISubmitUserChangeEmailVerificationRequest {
  currentEmailAddress: string,
 
}

export interface ISubmitUserCreateNewEmailVerificationRequest {
  verificationCode: string,
  newEmailAddress: string
}

export interface ISubmitUserChangeEmailVerificationResponse {

  
    data: {
      succeeded: boolean,
      duration: string
    },
    message: string,
    responseCode: string
  

}

export interface ISubmitUserCreateNewEmailVerificationResponse {

  
  data: {
    succeeded: boolean,
  
  },
  message: string,
  responseCode: string


}

export interface ICurrentPhoneNumberVerificationRequest {
  currentPhoneNumber: string,
}

export interface ICurrentPhoneNumberVerificationResponse {

  
  data: {
    succeeded: boolean,
    duration: string
  
  },
  message: string,
  responseCode: string


}

export interface IChangeUserPhoneNumberRequest {
  verificationCode: string,
  newPhoneNumber: string
}

export interface IChangeUserPhoneNumberResponse {

  
  data: {
    succeeded: boolean,
  
  },
  message: string,
  responseCode: string


}

export interface IEmailConfirmationResponse {

  
  data: {
    succeeded: boolean,
  
  },
  message: string,
  responseCode: string


}

export interface IRequestNewPhoneVerificationTokenRequest {
  newPhoneNumber: string,
}

export interface IRequestNewPhoneVerificationTokenResponse {
  data: {
    succeeded: boolean,
  },
  message: string,
  responseCode: string
}

export interface IEmailVerificationValidateRequest {
  verificationCode: string,
}

export interface IEmailVerificationValidateResponse {

  
  data: {
    isValid: boolean,
  
  },
  message: string,
  responseCode: string


}
export interface IDeleteAccountResponse {
  data: {
    status:string,
    requestedOn: string
  },
  message: string,
  responseCode: string,
  status: number
}

export interface IGetCookiesSettingsResponse {
   data : {
     id :  string ,
     allowFunctionalCookies : boolean,
     allowTargetingCookies : boolean,
     allowSocialMediaCookies : boolean
  },
   message :  string ,
   responseCode :  string ,
   status: number
}

export interface IUpdateCookiesSettings {
  allowFunctionalCookies: boolean,
  allowTargetingCookies: boolean,
  allowSocialMediaCookies: boolean
}
export interface IUpdateCookiesSettingsResponse {
 data : {
     id :  string ,
     isSuccessful : boolean
  },
   message :  string ,
   responseCode :  string ,
   status : number

}

export interface ICheckSignInMethodsRequest {
  emailAddress: string
}

export interface ICheckSignInMethodsResponse {
  userId: string
  userExists: boolean
  signInOptions: string[]
  socialIdentityProviders: string[]
  nextAction: string
}

export interface IRequestLoginOtpRequest {
  emailAddress: string
}

export interface IRequestLoginOtpResponse {
  succeeded: boolean
}

export interface IVerifyLoginOtpRequest {
  emailAddress: string
  oneTimePassword: string
}

export interface IVerifyLoginOtpResponse {
  accessToken: string
  expiry: string
  expiresIn: number
  idToken: string
  refreshToken: string
  userGroups: string[]
  userType: string
}

export interface IPasswordlessSignupRequest {
  countryCode: string
  firstName: string
  lastName: string
  emailAddress: string
  phone: string
}

export interface IPasswordlessSignupResponse {
  id: string
  countryId: string
  countryName: string
  firstName: string
  lastName: string
  emailAddress: string
  phone: string
}







