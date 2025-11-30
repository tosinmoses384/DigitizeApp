export interface IFeedbackSubmissionRequest {
  feedback: string;
  categoryId: string;
}

export interface IFeedbackSubmissionResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export interface IFeedbackCategory {
  id: string;
  title: string;
}
