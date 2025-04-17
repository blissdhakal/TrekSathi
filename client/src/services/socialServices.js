import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const socialServices = {
  async addPost({ profilePicture, text, location, trekId }) {
    try {
      if (!profilePicture || !text || !location) {
        throw new Error("All fields are required");
      }

      const formData = new FormData();
      formData.append("image", profilePicture[0]);
      formData.append("text", text);
      formData.append("location", location);

      if (trekId) {
        formData.append("trekId", trekId);
      }


      const response = await axios.post(
        `${API_URL}/post/addpost`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    console.log("total uplaod form: ",formData);
      return response.data.data;

    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async getAllPosts(trekId = null) {
    try {
      const response = await axios.get(`${API_URL}/post/getallpost`, {
        params: { trekId }, // Pass trekId as query parameter
        withCredentials: true,

      });
      console.log("response",response);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },


  async deletePost(postId) {
    try {
      const response = await axios.post(`${API_URL}/post/deletepost/${postId}`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async addComment({ post_id, text }) {
    try {
      if (!post_id || !text) {
        throw new Error("Post ID and text are required");
      }

      const response = await axios.post(
        `${API_URL}/comment/addcomment`,
        { post_id, text },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async getAllComments({ postId }) {
    try {
      if (!postId) {
        throw new Error("Post ID is required");
      }
      
      const response = await axios.get(`${API_URL}/comment/getcomment/${postId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async deleteComment(commentId) {
    try {
      const response = await axios.post(`${API_URL}/comment/deletecomment/${commentId}`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async upvoteComment(commentId) {
    try {
      const response = await axios.post(`${API_URL}/comment/upvote/${commentId}`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  async downvoteComment(commentId) {
    try {
      const response = await axios.post(`${API_URL}/comment/downvote/${commentId}`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  },

  // NEW METHODS FOR POST VOTING

  async upvote(postId) {
    try {
      if (!postId) {
        throw new Error("Post ID is required");
      }
      
      const response = await axios.post(
        `${API_URL}/post/upvote/${postId}`, 
        {}, 
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while upvoting post";
      console.error("Upvote error:", error);
      throw new Error(errorMessage);
    }
  },

  async downvote(postId) {
    try {
      if (!postId) {
        throw new Error("Post ID is required");
      }
      
      const response = await axios.post(
        `${API_URL}/post/downvote/${postId}`, 
        {}, 
        {
          withCredentials: true,
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while downvoting post";
      console.error("Downvote error:", error);
      throw new Error(errorMessage);
    }
  }
};

export default socialServices;