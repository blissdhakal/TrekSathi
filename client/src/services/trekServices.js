import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const trekServices = {
  getAllTreks: async () => {
    try {
      const response = await axios.get(`${API_URL}/trek`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching treks:", error);
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
      throw error;
    }
  },
  
  getTrekBySlug: async (slug) => {
    try {
      
      const response = await axios.get(`${API_URL}/trek/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching trek with slug ${slug}:`, error);
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
      throw error;
    }
  }
};

export default trekServices;