import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const messageServices = {
  /**
   * Get all messages for a specific group
   * @param {string} groupId - ID of the group to fetch messages for
   * @param {Object} params - Optional query parameters
   * @param {number} params.limit - Number of messages to fetch
   * @param {string} params.before - Fetch messages created before this ID (for pagination)
   * @returns {Promise<Array>} - Array of message objects
   */
  async getGroupMessages(groupId, params = {}) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.before) queryParams.append('before', params.before);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await axios.get(
        `${API_URL}/groups/${groupId}/messages${queryString}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch messages";
      console.error("Error fetching messages:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Send a new message to a group
   * @param {Object} messageData - Message data object
   * @param {string} messageData.groupId - ID of the group to send message to
   * @param {string} messageData.text - Text content of the message
   * @returns {Promise<Object>} - Created message object
   */
  async sendMessage(messageData) {
    try {
      if (!messageData.groupId || !messageData.text) {
        throw new Error("Group ID and message text are required");
      }

      // Fixed the URL - removed '/message/' and just used '/messages'
      const response = await axios.post(
        `${API_URL}/messages`,
        { 
          groupId: messageData.groupId,
          text: messageData.text 
        },
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send message";
      console.error("Error sending message:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a message
   * @param {string} groupId - ID of the group the message belongs to
   * @param {string} messageId - ID of the message to delete
   * @returns {Promise<Object>} - Response object
   */
  async deleteMessage(groupId, messageId) {
    try {
      if (!groupId || !messageId) {
        throw new Error("Group ID and Message ID are required");
      }

      // Update to use the endpoint your backend is expecting
      const response = await axios.delete(
        `${API_URL}/messages/${messageId}`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete message";
      console.error("Error deleting message:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Edit a message
   * @param {string} groupId - ID of the group the message belongs to
   * @param {string} messageId - ID of the message to edit
   * @param {string} text - New message text
   * @returns {Promise<Object>} - Updated message object
   */
  async editMessage(groupId, messageId, text) {
    try {
      if (!groupId || !messageId || !text) {
        throw new Error("Group ID, Message ID, and text are required");
      }

      // Update to use the endpoint your backend is expecting
      const response = await axios.patch(
        `${API_URL}/messages/${messageId}`,
        { text },
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to edit message";
      console.error("Error editing message:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Mark messages as read
   * @param {string} groupId - ID of the group
   * @returns {Promise<Object>} - Response object
   */
  async markMessagesAsRead(groupId) {
    try {
      if (!groupId) {
        throw new Error("Group ID is required");
      }

      // This endpoint might need to be updated if not implemented yet
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/messages/read`,
        {},
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to mark messages as read";
      console.error("Error marking messages as read:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get unread message count for all user's groups
   * @returns {Promise<Object>} - Object with groupId keys and message count values
   */
  async getUnreadMessageCounts() {
    try {
      // This endpoint might need to be updated if not implemented yet
      const response = await axios.get(
        `${API_URL}/messages/unread-counts`,
        {
          withCredentials: true,
        }
      );
      
      return response.data.data || {};
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to get unread message counts";
      console.error("Error getting unread message counts:", error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Upload file attachment to message (if supported)
   * @param {string} groupId - Group ID
   * @param {File} file - File to upload
   * @returns {Promise<Object>} - Uploaded file object
   */
  async uploadAttachment(groupId, file) {
    try {
      if (!groupId || !file) {
        throw new Error("Group ID and file are required");
      }

      const formData = new FormData();
      formData.append('attachment', file);

      // This endpoint might need to be updated if not implemented yet
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/messages/attachment`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to upload file";
      console.error("Error uploading attachment:", error);
      throw new Error(errorMessage);
    }
  }
};

export default messageServices;