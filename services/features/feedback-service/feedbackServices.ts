import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import {
  IFeedbackSubmissionRequest,
  IFeedbackSubmissionResponse,
} from "./models";

const feedbackServices = {
  submitFeedback: (
    model: IFeedbackSubmissionRequest,
    token: string
  ): Promise<ApiResponsePayload<IFeedbackSubmissionResponse>> => {
    return endpointService.Post<IFeedbackSubmissionRequest, IFeedbackSubmissionResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/help-centre/v1/feedback/submissions`,
      {
        feedback: model.feedback,
        categoryId: model.categoryId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};

export default feedbackServices;
