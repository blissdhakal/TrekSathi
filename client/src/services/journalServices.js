import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const journalServices = {
  async addJournalEntry({ position, name, description, image }) {
    try {
      if (!position || !name || !description || !image) {
        throw new Error("All fields are required");
      }

      const formData = new FormData();
      formData.append("position", JSON.stringify(position));
      formData.append("name", name);
      formData.append("description", description);
      formData.append("image", image);
      // User ID is not needed in the request as the backend will identify the user from the session/token
      
      console.log("FormData: ", formData);
      console.log("Position: ", position);

      const response = await axios.post(
        `${API_URL}/journal/addentry`,
        formData,
        {
          withCredentials: true, // This ensures cookies/authentication are sent
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async getAllJournalEntries() {
    try {
      const response = await axios.get(`${API_URL}/journal/getallentries`, {
        withCredentials: true,
      });
      console.log("Response: ", response); 
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },
  
  // New method to get only the current user's journal entries
  async getUserJournalEntries() {
    try {
      const response = await axios.get(`${API_URL}/journal/getuserentries`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },
  
  // Get entries for a specific user (for admin purposes)
  async getEntriesByUserId(userId) {
    try {
      const response = await axios.get(`${API_URL}/journal/getentriesbyuser/${userId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async deleteJournalEntry(entryId) {
    try {
      const response = await axios.post(`${API_URL}/journal/deleteentry/${entryId}`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },
  
  // Get a specific journal entry by ID
  async getJournalEntryById(entryId) {
    try {
      const response = await axios.get(`${API_URL}/journal/getentry/${entryId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },
  
  // Update an existing journal entry
  async updateJournalEntry(entryId, { position, name, description, image }) {
    try {
      const formData = new FormData();
      
      if (position) formData.append("position", JSON.stringify(position));
      if (name) formData.append("name", name);
      if (description) formData.append("description", description);
      if (image && image instanceof File) formData.append("image", image);
      
      const response = await axios.put(
        `${API_URL}/journal/updateentry/${entryId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }
};

export default journalServices;