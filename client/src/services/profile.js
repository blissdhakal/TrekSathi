import axios from "axios";
import { baseUrl } from "@/lib/constant";

class ProfileService {
  async completeProfile({ profilePicture, phone, location }) {
    try {
      const formData = new FormData();
      if (!profilePicture || !phone || !location) {
        throw new Error("All fields are required");
      }
      formData.append("profilePicture", profilePicture[0]);
      formData.append("phone", phone);
      formData.append("location", location);
      const response = await axios.post(
        `${baseUrl}/profile/complete`,
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

  async updateProfile(profileData) {
    try {
      let formData = new FormData();
      
      // Handle file upload if a new profile picture is provided
      if (profileData.newProfilePicture) {
        formData.append('profilePicture', profileData.newProfilePicture);
        
        // Send only the image update if that's all we're updating
        if (Object.keys(profileData).length === 1) {
          const response = await axios.patch(
            `${baseUrl}/profile/updateProfileImage`,
            formData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          return response.data.data;
        }
      }
      
      // Handle regular profile data updates
      // Convert all data to proper format for the API
      const { 
        age, gender, bio, phone, location, 
        instagram, facebook, twitter, pastTreks,
        contactInfo, socialMedia
      } = profileData;
      
      // Process nested objects
      const profileUpdate = {};
      
      // Add basic fields if they exist
      if (age !== undefined) profileUpdate.age = age;
      if (gender !== undefined) profileUpdate.gender = gender;
      if (bio !== undefined) profileUpdate.bio = bio;
      if (pastTreks !== undefined) profileUpdate.pastTreks = pastTreks;
      
      // Handle contact info
      profileUpdate.contactInfo = contactInfo || {};
      if (phone !== undefined) profileUpdate.contactInfo.phone = phone;
      if (location !== undefined) profileUpdate.contactInfo.location = location;
      
      // Handle social media
      profileUpdate.socialMedia = socialMedia || {};
      if (instagram !== undefined) profileUpdate.socialMedia.instagram = instagram;
      if (facebook !== undefined) profileUpdate.socialMedia.facebook = facebook;
      if (twitter !== undefined) profileUpdate.socialMedia.twitter = twitter;
      
      // For regular updates (non-file), use JSON
      const response = await axios.patch(
        `${baseUrl}/profile/updateProfile`,
        profileUpdate,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }

  async getProfileDetails() {
    try {
      const response = await axios.get(`${baseUrl}/profile/get`, {
        withCredentials: true,
      });
      return response.data?.data?.[0] || null;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }


  // Add this method to your existing profileService.js file

async getUserProfileById(userId) {
  try {
    const response = await axios.get(`${baseUrl}/profile/user/${userId}`, {
      withCredentials: true,
    });
    return response.data?.data || null;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;  // Return null instead of throwing error for better UX
  }
}
}



const profileService = new ProfileService();
export default profileService;