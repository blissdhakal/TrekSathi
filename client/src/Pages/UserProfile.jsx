import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Instagram,
  Facebook,
  Twitter,
  Camera,
  MapPin,
  Loader2,
  User,
  Phone,
  Calendar,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import profileService from "@/services/profile";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserProfile = () => {
  // State management
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [imageLoading, setImageLoading] = useState(false);

  // User data from Redux store
  const userData = useSelector((state) => state.auth.userData);

  // Form hooks
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  // Profile image handling
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Trek selection state
  const [selectedTreks, setSelectedTreks] = useState([]);
  const [customTrekInput, setCustomTrekInput] = useState("");

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await profileService.getProfileDetails();
        setProfileData(response);

        // Set profile image if available
        if (response?.profilePicture?.url) {
          setPreviewUrl(response.profilePicture.url);
        }

        // Set form values from fetched data
        if (response) {
          // Initialize the form with existing values
          const profileValues = {
            age: response.age || "",
            phone: response.contactInfo?.phone || "",
            location: response.contactInfo?.location || "",
            bio: response.bio || "",
            gender: response.gender || "",
            instagram: response.socialMedia?.instagram || "",
            facebook: response.socialMedia?.facebook || "",
            twitter: response.socialMedia?.twitter || "",
          };

          // Set past treks if available
          if (response.pastTreks && Array.isArray(response.pastTreks)) {
            setSelectedTreks(response.pastTreks);
          }

          // Reset form with values
          reset(profileValues);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [reset]);

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview and set file
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setImageLoading(true);
      // Auto-upload image immediately when selected
      const formData = new FormData();
      formData.append("newProfilePicture", file);

      await profileService.updateProfile({
        newProfilePicture: file,
      });

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setImageLoading(false);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle adding a trek
  const handleAddTrek = (trek) => {
    if (!trek || trek.trim() === "") return;

    if (!selectedTreks.includes(trek)) {
      setSelectedTreks([...selectedTreks, trek]);
      setCustomTrekInput("");
    } else {
      toast.info("This trek is already in your list");
    }
  };

  // Handle removing a trek
  const handleRemoveTrek = (trek) => {
    setSelectedTreks(selectedTreks.filter((t) => t !== trek));
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Prepare social media data
      const socialMedia = {
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        twitter: data.twitter || "",
      };

      // Create contact info object
      const contactInfo = {
        phone: data.phone || "",
        location: data.location || "",
      };

      // Submit the form data
      const updatedData = {
        age: data.age,
        gender: data.gender,
        bio: data.bio,
        socialMedia,
        contactInfo,
        pastTreks: selectedTreks,
      };

      const response = await profileService.updateProfile(updatedData);

      if (response) {
        // Update local state with the response
        setProfileData(response);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Popular treks list
  const popularTreks = [
    "Everest Base Camp",
    "Annapurna Circuit",
    "Langtang Valley",
    "Manaslu Circuit",
    "Gosaikunda Trek",
    "Mardi Himal",
    "Annapurna Base Camp",
    "Poon Hill Trek",
    "Upper Mustang",
    "Ghorepani Trek",
    "Kanchenjunga Base Camp",
    "Upper Dolpo",
  ];

  // Loading spinner during initial load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Profile Card */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              <div className="relative group mb-4">
                {imageLoading && (
                  <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}

                {previewUrl ? (
                  <Avatar className="h-36 w-36 border-4 border-white shadow-lg group-hover:opacity-90 transition-opacity">
                    <AvatarImage
                      src={previewUrl}
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xl font-bold">
                      {userData?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-36 w-36 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-indigo-400" />
                  </div>
                )}

                <label
                  htmlFor="profile-image"
                  className="absolute bottom-2 right-1 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md z-20"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">{userData?.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {userData?.email}
                </p>
              </div>

              <Separator className="my-4" />

              {/* Extra Details */}
              {profileData && (
                <div className="w-full space-y-4">
                  {profileData.contactInfo?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      <span>{profileData.contactInfo.location}</span>
                    </div>
                  )}

                  {profileData.contactInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      <span>{profileData.contactInfo.phone}</span>
                    </div>
                  )}

                  {profileData.age && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span>{profileData.age} years old</span>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Social Media Links */}
              {profileData?.socialMedia && (
                <div className="flex justify-center gap-4 mt-2">
                  {profileData.socialMedia.instagram && (
                    <a
                      href={profileData.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-5 w-5 text-indigo-600 hover:text-indigo-800" />
                    </a>
                  )}
                  {profileData.socialMedia.facebook && (
                    <a
                      href={profileData.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="h-5 w-5 text-indigo-600 hover:text-indigo-800" />
                    </a>
                  )}
                  {profileData.socialMedia.twitter && (
                    <a
                      href={profileData.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-5 w-5 text-indigo-600 hover:text-indigo-800" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="treks">Trek History</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)}>
                <TabsContent value="personal" className="space-y-4 mt-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        value={userData?.fullName || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Name cannot be changed
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age" className="required-field">
                          Age
                        </Label>
                        <Input
                          type="number"
                          id="age"
                          placeholder="Enter your age"
                          {...register("age", {
                            required: "Age is required",
                            min: {
                              value: 16,
                              message: "Age must be at least 16",
                            },
                            max: {
                              value: 100,
                              message: "Please enter a valid age",
                            },
                          })}
                        />
                        {errors.age && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.age.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
                              <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">
                                  Prefer not to say
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about yourself..."
                        className="min-h-[100px]"
                        {...register("bio")}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData?.email || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="required-field">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        id="phone"
                        placeholder="e.g., 9862383881"
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Please enter a valid 10-digit phone number",
                          },
                        })}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location" className="required-field">
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g., Kathmandu, Nepal"
                        {...register("location", {
                          required: "Location is required",
                        })}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-3">
                        Social Media (optional)
                      </h3>

                      <div className="space-y-3">
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="instagram"
                            placeholder="Instagram profile URL"
                            className="pl-10"
                            {...register("instagram")}
                          />
                        </div>

                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="facebook"
                            placeholder="Facebook profile URL"
                            className="pl-10"
                            {...register("facebook")}
                          />
                        </div>

                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="twitter"
                            placeholder="Twitter profile URL"
                            className="pl-10"
                            {...register("twitter")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="treks" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="past_treks" className="block mb-2">
                      Past Treks
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add trekking routes you've completed in the past.
                    </p>

                    {/* Trek Input and Add Button */}
                    <div className="relative mb-4">
                      <Input
                        list="trek-options"
                        placeholder="Type or select a trek..."
                        value={customTrekInput}
                        onChange={(e) => setCustomTrekInput(e.target.value)}
                        className="pr-20"
                      />
                      <datalist id="trek-options">
                        {popularTreks
                          .filter((trek) => !selectedTreks.includes(trek))
                          .map((trek) => (
                            <option key={trek} value={trek} />
                          ))}
                      </datalist>
                      <Button
                        type="button"
                        onClick={() => handleAddTrek(customTrekInput)}
                        className="absolute right-0 top-0 h-full"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Selected Treks Display */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTreks.map((trek) => (
                        <div
                          key={trek}
                          className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {trek}
                          <button
                            type="button"
                            onClick={() => handleRemoveTrek(trek)}
                            className="ml-1 hover:text-indigo-900"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {selectedTreks.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No treks added yet.
                        </p>
                      )}
                    </div>

                    {/* Popular Treks Suggestions */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2">
                        Popular Treks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {popularTreks
                          .filter((trek) => !selectedTreks.includes(trek))
                          .slice(0, 8)
                          .map((trek) => (
                            <button
                              key={trek}
                              type="button"
                              onClick={() => handleAddTrek(trek)}
                              className="bg-white text-xs border border-gray-200 hover:border-indigo-300 px-2.5 py-1 rounded-full text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                              + {trek}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Save Button - Always visible */}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting || !isDirty}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
