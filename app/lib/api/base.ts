import { APIServiceBase } from "@/lib/types/api";

export class APIBase implements APIServiceBase {
  // Helper to get the auth token from localStorage
  getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };
}