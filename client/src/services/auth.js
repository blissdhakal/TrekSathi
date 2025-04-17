import axios from "axios";
import { baseUrl } from "@/lib/constant";
export class AuthService {
  async createUser({ fullName, email, password, gender }) {
    try {
      const response = await axios.post(
        `${baseUrl}/user/register`,
        { fullName, email, password, gender },
        {
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        return this.login({ email, password });
      } else {
        return response.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }
  async login({ email, password }) {
    try {
      const response = await axios.post(
        `${baseUrl}/user/login`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.log("error at auth", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }
  async getCurrentUser() {
    try {
      return await axios.get(`${baseUrl}/user/me`, {
        withCredentials: true,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
    return null;
  }
  async logout() {
    try {
      return await axios.post(
        `${baseUrl}/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }
}
const authService = new AuthService();
export default authService;
