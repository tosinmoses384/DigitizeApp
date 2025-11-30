import identityServices from "../identity-service/loginService";
import {
  IUserVerificationRequest,
  IUserVerificationResponse,
} from "../identity-service/models";

export const requestVerificationCode = async (
  data: IUserVerificationRequest
): Promise<IUserVerificationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      identityServices
        .requestUserVerificationCode(data)
        .then((res: any) => {
          resolve(res);
        })
        .catch((error) => {
          return error;
        });
    }, 2000);
  });
};
