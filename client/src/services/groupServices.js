import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const groupServices = {
  // Create a new trekking group
// Create a new trekking group
async createGroup(groupData) {
    try {
      if (!groupData.name || !groupData.trekRoute || !groupData.startDate || !groupData.endDate || !groupData.groupSize) {
        throw new Error("Required fields are missing");
      }
  
      // Log the full URL for debugging
      console.log(`Making request to: ${API_URL}/groups`);
      
      const response = await axios.post(
        `${API_URL}/groups`,
        groupData,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Full error:", error);
      const errorMessage = error.response?.data?.message || "Failed to create group";
      throw new Error(errorMessage);
    }
  },

  // Get all available groups
  async getAllGroups(queryParams = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add any query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await axios.get(
        `${API_URL}/groups${params.toString() ? `?${params.toString()}` : ''}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch groups";
      throw new Error(errorMessage);
    }
  },

  // Get user's groups
  async getUserGroups() {
    try {
      const response = await axios.get(
        `${API_URL}/groups/my-groups`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch your groups";
      throw new Error(errorMessage);
    }
  },

  // Get details of a specific group
  async getGroupById(groupId) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      const response = await axios.get(
        `${API_URL}/groups/${groupId}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch group details";
      throw new Error(errorMessage);
    }
  },

  // Update group details
  async updateGroup(groupId, updateData) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      const response = await axios.patch(
        `${API_URL}/groups/${groupId}`,
        updateData,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update group";
      throw new Error(errorMessage);
    }
  },

  // Join a group
  async joinGroup(groupId) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      const response = await axios.post(
        `${API_URL}/groups/${groupId}/join`,
        {},
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to join group";
      throw new Error(errorMessage);
    }
  },

  // Leave a group
  async leaveGroup(groupId) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      const response = await axios.post(
        `${API_URL}/groups/${groupId}/leave`,
        {},
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to leave group";
      throw new Error(errorMessage);
    }
  },

  // Make a user an admin
  async makeAdmin(groupId, userId) {
    try {
      if (!groupId || !userId) {
        throw new Error("Group ID and User ID are required");
      }

      const response = await axios.post(
        `${API_URL}/groups/${groupId}/make-admin/${userId}`,
        {},
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to promote user to admin";
      throw new Error(errorMessage);
    }
  },

  // Remove a member from group
  async removeMember(groupId, userId) {
    try {
      if (!groupId || !userId) {
        throw new Error("Group ID and User ID are required");
      }

      const response = await axios.delete(
        `${API_URL}/groups/${groupId}/members/${userId}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove member";
      throw new Error(errorMessage);
    }
  },
  
  // Upload group image (if needed)
  async uploadGroupImage(groupId, imageFile) {
    try {
      if (!groupId || !imageFile) {
        throw new Error("Group ID and image file are required");
      }

      const formData = new FormData();
      formData.append("groupImage", imageFile);

      const response = await axios.post(
        `${API_URL}/groups/${groupId}/upload-image`,
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
      const errorMessage = error.response?.data?.message || "Failed to upload group image";
      throw new Error(errorMessage);
    }
  },
  
  // Search groups
  async searchGroups(searchQuery) {
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      
      const response = await axios.get(
        `${API_URL}/groups?${params.toString()}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to search groups";
      throw new Error(errorMessage);
    }
  },
  
  // Filter groups by trek dates
  async filterGroupsByDate(startDateFrom, startDateTo) {
    try {
      const params = new URLSearchParams();
      if (startDateFrom) {
        params.append('startDateFrom', startDateFrom);
      }
      if (startDateTo) {
        params.append('startDateTo', startDateTo);
      }
      
      const response = await axios.get(
        `${API_URL}/groups?${params.toString()}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to filter groups by date";
      throw new Error(errorMessage);
    }
  }
};

export default groupServices;