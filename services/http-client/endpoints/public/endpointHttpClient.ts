import axios from "axios";
import apiService from "../../../api";
// import { API_BASE_URL } from "../../../../configs/app-config";
// import _ from "lodash"; // Remove unused lodash import to fix linting
// import { redirect } from "next/navigation";

// Create a bridge that uses our JWT refresh token enabled apiService
// but maintains compatibility with the existing response format
const createEndpointHttpClient = () => {
  const client = axios.create({
    // baseURL: API_BASE_URL,
    timeout: 60000,
  });

  // Override the request methods to use our JWT-enabled apiService with better error handling
  client.get = async (url, config) => {
    try {
      const response = await apiService.get(url, config);
      return response.data; // Return just the data to match existing format
    } catch (error) {
      if (__DEV__) {
        console.error(`[EndpointHttpClient] GET ${url} failed:`, error);
      }
      throw error; // Re-throw to maintain error chain
    }
  };

  client.post = async (url, data, config) => {
    try {
      const response = await apiService.post(url, data, config);
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error(`[EndpointHttpClient] POST ${url} failed:`, {
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
          timeout: config?.timeout,
          isNetworkError: error?.message?.includes('Network Error'),
          isTimeout: error?.code === 'ECONNABORTED',
          url: url,
        });
      }
      throw error;
    }
  };

  client.put = async (url, data, config) => {
    try {
      const response = await apiService.put(url, data, config);
      return response.data; // Return just the data to match existing format
    } catch (error) {
      if (__DEV__) {
        console.error(`[EndpointHttpClient] PUT ${url} failed:`, error);
      }
      throw error; // Re-throw to maintain error chain
    }
  };

  client.delete = async (url, config) => {
    try {
      const response = await apiService.delete(url, config);
      return response.data; // Return just the data to match existing format
    } catch (error) {
      if (__DEV__) {
        console.error(`[EndpointHttpClient] DELETE ${url} failed:`, error);
      }
      throw error; // Re-throw to maintain error chain
    }
  };

  client.patch = async (url, data, config) => {
    try {
      const response = await apiService.patch(url, data, config);
      return response.data; // Return just the data to match existing format
    } catch (error) {
      if (__DEV__) {
        console.error(`[EndpointHttpClient] PATCH ${url} failed:`, error);
      }
      throw error; // Re-throw to maintain error chain
    }
  };

  return client;
};

const endpointHttpClient = createEndpointHttpClient();

export default endpointHttpClient;
