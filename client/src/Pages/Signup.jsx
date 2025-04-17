import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Lock,
  Compass,
  Flag,
  Phone,
  MapPin,
  Calendar,
  Mountain,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { PiMountainsDuotone } from "react-icons/pi";
import authService from "@/services/auth";
import profileService from "@/services/profile";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-5">
      {[...Array(20)].map((_, i) => (
        <React.Fragment key={i}>
          <PiMountainsDuotone
            className="absolute animate-float opacity-20 text-blue-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${
                Math.random() * 30 - 15
              }deg)`,
            }}
          />
          <Compass
            className="absolute animate-float opacity-20 text-sky-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${0.3 + Math.random() * 0.3})`,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form hook for each step
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    control: controlStep1,
    formState: { errors: errorsStep1 },
  } = useForm();

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    control: controlStep2,
    formState: { errors: errorsStep2 },
  } = useForm();

  // Options for select inputs
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const experienceLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "experienced", label: "Experienced" },
    { value: "expert", label: "Expert" },
  ];

  const interestOptions = [
    "Mountain climbing",
    "Hiking",
    "Trail running",
    "Camping",
    "Photography",
    "Bird watching",
    "Wildlife spotting",
    "Meditation",
  ];

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  // Step 1 submission (basic info)
  const handleStep1Submit = async (data) => {
    try {
      setIsSubmitting(true);
      // Register the user first
      const createdUser = await authService.createUser(data);

      // Save the logged in user for step 2
      setRegisteredUser({
        _id: createdUser.data.loggedInUser._id,
        fullName: createdUser.data.loggedInUser.fullName,
        email: createdUser.data.loggedInUser.email,
      });

      // Proceed to next step
      setStep(2);
      toast.success(
        "Account created successfully! Let's complete your profile."
      );
    } catch (error) {
      toast.error(error.message || "Failed to create account");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 submission (profile details)
  const handleStep2Submit = async (data) => {
    try {
      setIsSubmitting(true);

      if (!profileImage) {
        toast.error("Please upload a profile picture");
        setIsSubmitting(false);
        return;
      }

      // Complete the profile with additional details
      await profileService.completeProfile({
        profilePicture: [profileImage],
        phone: data.phone,
        location: data.location,
        age: data.age,
        trekExperience: data.trekExperience,
        interests: data.interests,
      });

      // Login the user
      dispatch(login(registeredUser));

      // Redirect to home page
      toast.success("Profile completed! Welcome to TrekSathi");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to complete profile");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundPattern />

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/90 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <PiMountainsDuotone className="h-16 w-16 text-[#6366f1] animate-bounce" />
        </div>

        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-sky-400 to-blue-300 bg-clip-text text-[#6366f1]">
            {step === 1 ? "Reach New Heights" : "Complete Your Journey"}
          </CardTitle>
          <p className="text-sm text-center text-gray-600">
            {step === 1
              ? "Begin your ascent to the summit"
              : "Just a few more steps to the peak"}
          </p>
        </CardHeader>

        <CardContent>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form
              onSubmit={handleSubmitStep1(handleStep1Submit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                  <Input
                    id="fullName"
                    placeholder="Full Name"
                    className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                    {...registerStep1("fullName", {
                      required: "Full name is required",
                    })}
                  />
                </div>
                {errorsStep1.fullName && (
                  <p className="text-sm text-red-500">
                    {errorsStep1.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                    {...registerStep1("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errorsStep1.email && (
                  <p className="text-sm text-red-500">
                    {errorsStep1.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="gender"
                  control={controlStep1}
                  rules={{ required: "Please select your gender" }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-12 border-slate-200 focus:border-sky-400">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {genderOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {error && (
                        <p className="text-sm text-red-500">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                    {...registerStep1("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                </div>
                {errorsStep1.password && (
                  <p className="text-sm text-red-500">
                    {errorsStep1.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#6366f1] hover:from-sky-500 hover:to-blue-400 text-white font-medium rounded-lg transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <form
              onSubmit={handleSubmitStep2(handleStep2Submit)}
              className="space-y-4"
            >
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#6366f1]/30 bg-slate-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <label
                    htmlFor="profile-photo"
                    className="absolute bottom-0 right-0 bg-[#6366f1] p-1.5 rounded-full cursor-pointer shadow-md"
                  >
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <Label className="text-sm text-gray-500">
                  Upload Profile Picture
                </Label>
                {!imagePreview && (
                  <p className="text-xs text-red-500">
                    Profile picture is required
                  </p>
                )}
              </div>

              <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="trekking">Trekking Info</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                      <Input
                        placeholder="Phone Number"
                        className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                        {...registerStep2("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Please enter a valid 10-digit phone number",
                          },
                        })}
                      />
                    </div>
                    {errorsStep2.phone && (
                      <p className="text-sm text-red-500">
                        {errorsStep2.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                      <Input
                        placeholder="Location (City, Country)"
                        className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                        {...registerStep2("location", {
                          required: "Location is required",
                        })}
                      />
                    </div>
                    {errorsStep2.location && (
                      <p className="text-sm text-red-500">
                        {errorsStep2.location.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                      <Input
                        type="number"
                        placeholder="Age"
                        className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                        {...registerStep2("age", {
                          required: "Age is required",
                          min: {
                            value: 16,
                            message: "You must be at least 16 years old",
                          },
                          max: {
                            value: 100,
                            message: "Please enter a valid age",
                          },
                        })}
                      />
                    </div>
                    {errorsStep2.age && (
                      <p className="text-sm text-red-500">
                        {errorsStep2.age.message}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="trekking" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Trek Experience Level</Label>
                    <Controller
                      name="trekExperience"
                      control={controlStep2}
                      defaultValue="beginner"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-12 border-slate-200 focus:border-sky-400">
                            <SelectValue placeholder="Select Experience Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {experienceLevels.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trekking Interests</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {interestOptions.map((interest) => (
                        <div
                          key={interest}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={interest}
                            value={interest}
                            className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]"
                            {...registerStep2(`interests`)}
                          />
                          <label htmlFor={interest} className="text-sm">
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#6366f1] hover:from-sky-500 hover:to-blue-400 text-white font-medium rounded-lg transition-all duration-300"
                  disabled={isSubmitting || !imagePreview}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Sign Up
                      <Mountain className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              Already part of the expedition?{" "}
            </span>
            <br />
            <button
              onClick={() => navigate("/login")}
              className="text-[#6366f1] hover:text-sky-600 font-medium transition-colors duration-300"
            >
              Return to Base Camp (Login)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
