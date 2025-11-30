import { API_BASE_URL } from "../../../configs/app-config";
import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import {
  IHelpCenterCategoryResponse,
  IHelpCenterPagesRequest,
  IHelpCenterPagesResponse,
} from "./models";

const helpCenterServices = {
  helpCenterCategories: (
    languageCode?: string
  ): Promise<ApiResponsePayload<IHelpCenterCategoryResponse>> => {
    return endpointService.GetWithParams(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/help-centre/v1/help-page-categories/lov`,
      { ...(languageCode ? { languageCode: languageCode } : "") }
    );
  },

  helpCenterPages: ({
    languageCode,
    PageCategoryId,
    PageSize,
    PageToken,
  }: IHelpCenterPagesRequest): Promise<
    ApiResponsePayload<IHelpCenterPagesResponse>
  > => {
    return endpointService.GetWithParams(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/help-centre/v1/help-pages`,
      {
        ...(languageCode ? { languageCode: languageCode } : ""),
        ...(PageCategoryId ? { PageCategoryId: PageCategoryId } : ""),
        ...(PageSize ? { PageSize: PageSize } : ""),
        ...(PageToken ? { PageToken: PageToken } : ""),
      }
    );
  },
};
export default helpCenterServices;
