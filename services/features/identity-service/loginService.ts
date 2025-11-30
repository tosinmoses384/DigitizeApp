// import { API_BASE_URL } from "@/configs/app-config";
// import { API_BASE_URL } from "../../../configs/app-config";
import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import { ISocialAuthRequest } from "../social-auth/socialAuthService";

import {
  IChangePasswordRequest,
  IChangePasswordResponse,
  IChangeUserPhoneNumberRequest,
  IChangeUserPhoneNumberResponse,
  ICheckSignInMethodsRequest,
  ICheckSignInMethodsResponse,
  ICreateNewPasswordResetRequest,
  ICreateNewPasswordResetResponse,
  ICreatePasswordRequest,
  ICreatePasswordResponse,
  ICurrentPhoneNumberVerificationRequest,
  ICurrentPhoneNumberVerificationResponse,
  IEmailConfirmationResponse,
  IEmailVerificationValidateRequest,
  IEmailVerificationValidateResponse,
  IRequestNewPhoneVerificationTokenRequest,
  IRequestNewPhoneVerificationTokenResponse,
  IGetCookiesSettingsResponse,
  IGetProfileResponse,
  IGetShippingAddressResponse,
  ILoginRequest,
  ILoginResponse,
  IRequestLoginOtpRequest,
  IRequestLoginOtpResponse,
  IRequestPasswordResetRequest,
  IRequestPasswordResetResponse,
  IShippingAddressRequest,
  IShippingAddressResponse,
  ISubmitForgotPasswordVerificationCode,
  ISubmitForgotPasswordVerificationResponse,
  ISubmitUserChangeEmailVerificationRequest,
  ISubmitUserChangeEmailVerificationResponse,
  ISubmitUserCreateNewEmailVerificationRequest,
  ISubmitUserCreateNewEmailVerificationResponse,
  ISubmitUserVerificationRequest,
  ISubmitUserVerificationResponse,
  IUpdateCookiesSettings,
  IUpdateCookiesSettingsResponse,
  IUploadProfilleDetailsRequest,
  IUploadProfilleDetailsResponse,
  IUserOnboardingStepOneRequest,
  IUserOnboardingStepOneResponse,
  IUserVerificationRequest,
  IUserVerificationResponse,
  IVerifyLoginOtpRequest,
  IVerifyLoginOtpResponse,
  IPasswordlessSignupRequest,
  IPasswordlessSignupResponse,
} from "./models";

const identityServices = {
  userLogin: (
    model: ILoginRequest
  ): Promise<ApiResponsePayload<ILoginResponse>> => {
    return endpointService.Post<ILoginRequest, ILoginResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user`,
      {
        emailAddress: model.emailAddress,
        password: model.password,
      }
    );
  },
  userOnboardingStepOne: (
    model: IUserOnboardingStepOneRequest
  ): Promise<ApiResponsePayload<IUserOnboardingStepOneResponse>> => {
    return endpointService.Post<
      IUserOnboardingStepOneRequest,
      IUserOnboardingStepOneResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/create-profile`,
      {
        countryCode: model.countryCode,
        firstName: model.firstName,
        lastName: model.lastName,
        emailAddress: model.emailAddress,
        phone: model.phone,
      }
    );
  },
  requestUserVerificationCode: (
    model: IUserVerificationRequest
  ): Promise<ApiResponsePayload<IUserVerificationResponse>> => {
    return endpointService.Post<
      IUserVerificationRequest,
      IUserVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/request-verification-code`,
      {
        emailAddress: model.emailAddress,
      }
    );
  },
  submitUserVerificationCode: (
    model: ISubmitUserVerificationRequest
  ): Promise<ApiResponsePayload<ISubmitUserVerificationResponse>> => {
    return endpointService.Post<
      ISubmitUserVerificationRequest,
      ISubmitUserVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/submit-verification-code`,
      {
        emailAddress: model.emailAddress,
        verificationCode: model.verificationCode,
      }
    );
  },

  submitForgotPasswordVerificationCode: (
    model: ISubmitForgotPasswordVerificationCode
  ): Promise<ApiResponsePayload<ISubmitForgotPasswordVerificationResponse>> => {
    return endpointService.Post<
      ISubmitForgotPasswordVerificationCode,
      ISubmitForgotPasswordVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account-recovery/verify-reset-code`,
      {
        emailAddress: model.emailAddress,
        resetCode: model.resetCode,
      }
    );
  },

  createUserPassword: (
    model: ICreatePasswordRequest
  ): Promise<ApiResponsePayload<ICreatePasswordResponse>> => {
    return endpointService.Post<
      ICreatePasswordRequest,
      ICreatePasswordResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/create-password`,
      {
        emailAddress: model.emailAddress,
        verificationCode: model.verificationCode,
        password: model?.password,
      }
    );
  },
  getUserProfile: (
    token: string
  ): Promise<ApiResponsePayload<IGetProfileResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  requestPasswordReset: (
    model: IRequestPasswordResetRequest
  ): Promise<ApiResponsePayload<IRequestPasswordResetResponse>> => {
    return endpointService.Post<
      IRequestPasswordResetRequest,
      IRequestPasswordResetResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account-recovery/request-password-reset`,
      {
        emailAddress: model.emailAddress,
      }
    );
  },

  createNewPasswordReset: (
    model: ICreateNewPasswordResetRequest
  ): Promise<ApiResponsePayload<ICreateNewPasswordResetResponse>> => {
    return endpointService.Post<
      ICreateNewPasswordResetRequest,
      ICreateNewPasswordResetResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account-recovery/create-password`,
      {
        resetCode: model.resetCode,
        emailAddress: model.emailAddress,
        newPassword: model.newPassword,
        // confirmPassword: model.confirmPassword
      }
    );
  },

  updateProfileDetails: (
    model: IUploadProfilleDetailsRequest,
    token: string
  ): Promise<ApiResponsePayload<IUploadProfilleDetailsResponse>> => {
    return endpointService.Put<
      IUploadProfilleDetailsRequest,
      IUploadProfilleDetailsResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/profile`,
      {
        biography: model?.biography,
        countryId: model?.countryId,
        locationId: model?.locationId,
        languageId: model?.languageId,
        shouldShowLocation: model?.shouldShowLocation,
        firstName: model?.firstName,
        lastName: model?.lastName,
        gender: model?.gender,
        dateOfBirth: model?.dateOfBirth,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  changePassword: (
    token: string,
    model: IChangePasswordRequest
  ): Promise<ApiResponsePayload<IChangePasswordResponse>> => {
    return endpointService.Put<IChangePasswordRequest, IChangePasswordResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/change-password`,
      {
        oldPassword: model?.oldPassword,
        newPassword: model?.newPassword,
        confirmPassword: model?.confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
  getShippingAddress: (
    token: string
  ): Promise<ApiResponsePayload<IGetShippingAddressResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/shipping-address`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
  createShippingAddress: (
    token: string,
    model: IShippingAddressRequest
  ): Promise<ApiResponsePayload<IShippingAddressResponse>> => {
    return endpointService.Post<
      IShippingAddressRequest,
      IShippingAddressResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/shipping-address`,
      {
        contactName: model?.contactName,
        addressLine1: model?.addressLine1,
        addressLine2: model?.addressLine2,
        postalCode: model?.postalCode,
        locationId: model?.locationId,
        countryId: model?.countryId,
        deliveryInstructions: model?.deliveryInstructions,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  editShippingAddress: (
    token: string,
    model: IShippingAddressRequest
  ): Promise<ApiResponsePayload<IShippingAddressResponse>> => {
    return endpointService.Put<
      IShippingAddressRequest,
      IShippingAddressResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/shipping-address`,
      {
        contactName: model?.contactName,
        addressLine1: model?.addressLine1,
        addressLine2: model?.addressLine2,
        postalCode: model?.postalCode,
        locationId: model?.locationId,
        countryId: model?.countryId,
        deliveryInstructions: model?.deliveryInstructions,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  submitUserChangeEmailVerificationCode: (
    token: string,
    model: ISubmitUserChangeEmailVerificationRequest
  ): Promise<
    ApiResponsePayload<ISubmitUserChangeEmailVerificationResponse>
  > => {
    return endpointService.Post<
      ISubmitUserChangeEmailVerificationRequest,
      ISubmitUserChangeEmailVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/change-email/request-verification-code`,
      {
        currentEmailAddress: model.currentEmailAddress,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  submitUserCreateNewEmailVerificationCode: (
    token: string,
    model: ISubmitUserCreateNewEmailVerificationRequest
  ): Promise<
    ApiResponsePayload<ISubmitUserCreateNewEmailVerificationResponse>
  > => {
    return endpointService.Post<
      ISubmitUserCreateNewEmailVerificationRequest,
      ISubmitUserCreateNewEmailVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/change-email`,
      {
        verificationCode: model?.verificationCode,
        newEmailAddress: model?.newEmailAddress,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  changeCurrentPhoneNumberVerificationCode: (
    token: string,
    model: ICurrentPhoneNumberVerificationRequest
  ): Promise<ApiResponsePayload<ICurrentPhoneNumberVerificationResponse>> => {
    return endpointService.Post<
      ICurrentPhoneNumberVerificationRequest,
      ICurrentPhoneNumberVerificationResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/change-phone-number/request-verification-code`,
      {
        currentPhoneNumber: model?.currentPhoneNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  changeUserPhoneNumber: (
    token: string,
    model: IChangeUserPhoneNumberRequest
  ): Promise<ApiResponsePayload<IChangeUserPhoneNumberResponse>> => {
    return endpointService.Post<
      IChangeUserPhoneNumberRequest,
      IChangeUserPhoneNumberResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/change-phone-number`,
      {
        verificationCode: model?.verificationCode,
        newPhoneNumber: model?.newPhoneNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  confirmEmailVerification: (
    token: string
  ): Promise<ApiResponsePayload<IEmailConfirmationResponse>> => {
    return endpointService.Post<null, IEmailConfirmationResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/email-verification/request-token`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  emailVerificationValidate: (
    token: string,
    model: IEmailVerificationValidateRequest
  ): Promise<ApiResponsePayload<IEmailVerificationValidateResponse>> => {
    return endpointService.Post<
      IEmailVerificationValidateRequest,
      IEmailVerificationValidateResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/email-verification/validate`,
      {
        verificationCode: model?.verificationCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  confirmPhoneVerification: (
    token: string
  ): Promise<ApiResponsePayload<IEmailConfirmationResponse>> => {
    return endpointService.Post<null, IEmailConfirmationResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/phone-verification/request-token`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  requestNewPhoneVerificationToken: (
    token: string,
    model: IRequestNewPhoneVerificationTokenRequest
  ): Promise<ApiResponsePayload<IRequestNewPhoneVerificationTokenResponse>> => {
    return endpointService.Post<
      IRequestNewPhoneVerificationTokenRequest,
      IRequestNewPhoneVerificationTokenResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/phone-verification/request-token`,
      {
        newPhoneNumber: model.newPhoneNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  phoneNumberVerificationValidate: (
    token: string,
    model: IEmailVerificationValidateRequest
  ): Promise<ApiResponsePayload<IEmailVerificationValidateResponse>> => {
    return endpointService.Post<
      IEmailVerificationValidateRequest,
      IEmailVerificationValidateResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/phone-verification/validate`,
      {
        verificationCode: model?.verificationCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  deleteUserAccount: (
    token: string
  ): Promise<ApiResponsePayload<IEmailVerificationValidateResponse>> => {
    return endpointService.Post<null, IEmailVerificationValidateResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/deletion`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  cancelDeleteUserAccount: (
    token: string
  ): Promise<ApiResponsePayload<IEmailVerificationValidateResponse>> => {
    return endpointService.Put<null, IEmailVerificationValidateResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/deletion/cancel`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
  getCookiesSettings: (
    token: string
  ): Promise<ApiResponsePayload<IGetCookiesSettingsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/cookie-settings`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },
  updateCookiesSettings: (
    token: string,
    model: IUpdateCookiesSettings
  ): Promise<ApiResponsePayload<IUpdateCookiesSettingsResponse>> => {
    return endpointService.Put<
      IUpdateCookiesSettings,
      IUpdateCookiesSettingsResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/cookie-settings`,
      {
        allowFunctionalCookies: model?.allowFunctionalCookies,
        allowTargetingCookies: model?.allowTargetingCookies,
        allowSocialMediaCookies: model?.allowSocialMediaCookies,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      }
    );
  },

  checkSignInMethods: (
    model: ICheckSignInMethodsRequest
  ): Promise<ApiResponsePayload<ICheckSignInMethodsResponse>> => {
    return endpointService.Post<
      ICheckSignInMethodsRequest,
      ICheckSignInMethodsResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/methods`,
      {
        emailAddress: model.emailAddress,
      }
    );
  },

  requestLoginOtp: (
    model: IRequestLoginOtpRequest
  ): Promise<ApiResponsePayload<IRequestLoginOtpResponse>> => {
    return endpointService.Post<
      IRequestLoginOtpRequest,
      IRequestLoginOtpResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/otp`,
      {
        emailAddress: model.emailAddress,
      }
    );
  },

  verifyLoginOtp: (
    model: IVerifyLoginOtpRequest
  ): Promise<ApiResponsePayload<IVerifyLoginOtpResponse>> => {
    return endpointService.Post<
      IVerifyLoginOtpRequest,
      IVerifyLoginOtpResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/otp/verify`,
      {
        emailAddress: model.emailAddress,
        oneTimePassword: model.oneTimePassword,
      }
    );
  },

  passwordlessSignup: (
    model: IPasswordlessSignupRequest
  ): Promise<ApiResponsePayload<IPasswordlessSignupResponse>> => {
    return endpointService.Post<
      IPasswordlessSignupRequest,
      IPasswordlessSignupResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signup/passwordless`,
      {
        countryCode: model.countryCode,
        firstName: model.firstName,
        lastName: model.lastName,
        emailAddress: model.emailAddress,
        phone: model.phone,
      }
    );
  },

  // Social Authentication
  socialSignIn: (
    model: ISocialAuthRequest
  ): Promise<ApiResponsePayload<ILoginResponse>> => {
    return endpointService.Post<ISocialAuthRequest, ILoginResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/social-signin`,
      {
        provider: model.provider,
        platform: model.platform,
        token: model.token,
        authorizationCode: model.authorizationCode
      }
    );
  },
};
export default identityServices;
