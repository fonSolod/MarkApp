import axios from "axios";

export const apiRequest = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred";

    if (error.response) {
      if (error.response.status === 401) {
        message = "Invalid username or password";
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    } else if (error.request) {
      message = "Unable to reach the server";
    }

    return Promise.reject(new Error(message));
  }
);