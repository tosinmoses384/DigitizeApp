import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useApiService } from '../use-auth-guard/useApiService';
import feedbackServices from '../../services/features/feedback-service/feedbackServices';
import { IFeedbackSubmissionRequest } from '../../services/features/feedback-service/models';

interface UseFeedbackSubmissionReturn {
  isSubmitting: boolean;
  submitFeedback: (payload: IFeedbackSubmissionRequest) => Promise<void>;
}

export const useFeedbackSubmission = (): UseFeedbackSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { callApiWithLoading } = useApiService();
  const toast = useToast();

  const submitFeedback = useCallback(async (payload: IFeedbackSubmissionRequest) => {
    await callApiWithLoading(
      (token) => feedbackServices.submitFeedback(payload, token),
      setIsSubmitting,
      {
        onSuccess: (response) => {
          if (response?.status === 200 || response?.status === 201) {
            toast.show("Thank you for your feedback! We appreciate you taking the time to help us improve.", {
              type: "success",
              duration: 4000,
            });
            // Navigate back after a short delay to allow user to see the success message
            setTimeout(() => {
              router.back();
            }, 1500);
          } else {
            throw new Error(response?.detail || response?.message || "Failed to submit feedback");
          }
        },
        onError: (error: any) => {
          console.error("Feedback submission error:", error);
          
          let errorMessage = "Failed to submit feedback. Please try again.";
          
          if (error?.response?.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error?.response?.status === 400) {
            errorMessage = "Invalid feedback data. Please check your input.";
          } else if (error?.response?.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (error?.message) {
            errorMessage = error.message;
          }

          toast.show(errorMessage, {
            type: "danger",
            duration: 4000,
          });
        },
        onAuthError: () => {
          toast.show("Authentication required. Please log in again.", {
            type: "danger",
            duration: 4000,
          });
        },
      }
    );
  }, [callApiWithLoading, toast]);

  return {
    isSubmitting,
    submitFeedback,
  };
};

export default useFeedbackSubmission;
