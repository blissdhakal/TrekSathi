import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  Mountain,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import groupServices from "@/services/groupServices"; // Adjust the import path as necessary

const GroupFormation = () => {
  const [groupSize, setGroupSize] = useState(null);
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      trekRoute: "",
      startDate: null,
      endDate: null,
      genderPreference: "",
      ageFrom: "",
      ageTo: "",
      additionalMembers: "",
      groupSize: "",
    },
    mode: "onChange", // Enable validation on change
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
    trigger,
  } = methods;
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  // Watch all form fields to enable real-time validation
  const watchedFields = {
    trekRoute: watch("trekRoute"),
    startDate: watch("startDate"),
    endDate: watch("endDate"),
    groupSize: watch("groupSize"),
    additionalMembers: watch("additionalMembers"),
    genderPreference: watch("genderPreference"),
    ageFrom: watch("ageFrom"),
    ageTo: watch("ageTo"),
  };

  // Validate each step before proceeding to the next
  const validateStep = async (currentStep) => {
    let isStepValid = false;
    let fieldsToValidate = [];

    // Define required fields for each step
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["trekRoute", "startDate", "endDate"];
        break;
      case 2:
        fieldsToValidate = ["groupSize", "additionalMembers"];
        break;
      case 3:
        fieldsToValidate = ["genderPreference", "ageFrom", "ageTo"];
        break;
    }

    // Trigger validation for the fields in current step
    const result = await trigger(fieldsToValidate);

    if (result) {
      // Additional custom validation logic
      if (
        currentStep === 1 &&
        watchedFields.startDate &&
        watchedFields.endDate
      ) {
        if (watchedFields.endDate < watchedFields.startDate) {
          setFormErrors({
            ...formErrors,
            endDate: "End date must be after start date",
          });
          return false;
        }
      }

      if (currentStep === 2) {
        if (parseInt(watchedFields.groupSize) <= 0) {
          setFormErrors({
            ...formErrors,
            groupSize: "Group size must be at least 1",
          });
          return false;
        }
      }

      return true;
    }

    return false;
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
      setFormErrors({});
    }
  };

  const handleCreateGroup = async (data) => {
    const isValid = await validateStep(3);
    if (!isValid) return;

    // Show what URL we're using (for debugging)
    console.log("API URL:", import.meta.env.VITE_BACKEND_URL);

    const newGroup = {
      name: data.trekRoute,
      trekRoute: data.trekRoute,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
      endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : null,
      groupSize: data.groupSize,
      additionalMembers: data.additionalMembers,
      genderPreference: data.genderPreference,
      ageFrom: data.ageFrom,
      ageTo: data.ageTo,
      description: "",
    };

    try {
      console.log("Sending group data:", newGroup);
      const response = await groupServices.createGroup(newGroup);
      console.log("Success response:", response);
      navigate("/groupchat");
    } catch (error) {
      console.error("Full error object:", error);
      setFormErrors({
        ...formErrors,
        general: `Failed to create group: ${error.message}`,
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              step === num
                ? "bg-[#6366f1] text-white"
                : step > num
                ? "bg-[#6366f1]/20 text-[#6366f1]"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {num}
          </div>
          {num < 3 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2",
                step > num ? "bg-[#6366f1]" : "bg-gray-100"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Error message display component
  const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
      <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#6366f1]/60 bg-clip-text text-transparent">
                Create Your Trek Group
              </h1>
              <p className="text-gray-500 mt-2">
                Find the perfect companions for your adventure
              </p>
            </div>

            {renderStepIndicator()}

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(handleCreateGroup)}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="trekRoute"
                      rules={{ required: "Trek route is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Mountain className="w-4 h-4" />
                            Trek Route*
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Everest Base Camp"
                              {...field}
                              className={cn(
                                "h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20",
                                errors.trekRoute && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <ErrorMessage message={errors.trekRoute?.message} />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="startDate"
                        control={control}
                        rules={{ required: "Start date is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Start Date*
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-12 w-full rounded-xl border-gray-200",
                                      !field.value && "text-gray-400",
                                      errors.startDate && "border-red-500"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMM d, yyyy")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  className="rounded-lg border"
                                />
                              </PopoverContent>
                            </Popover>
                            <ErrorMessage message={errors.startDate?.message} />
                          </FormItem>
                        )}
                      />

                      <Controller
                        name="endDate"
                        control={control}
                        rules={{ required: "End date is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              End Date*
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-12 w-full rounded-xl border-gray-200",
                                      !field.value && "text-gray-400",
                                      errors.endDate && "border-red-500"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMM d, yyyy")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  className="rounded-lg border"
                                />
                              </PopoverContent>
                            </Popover>
                            <ErrorMessage message={errors.endDate?.message} />
                            <ErrorMessage message={formErrors.endDate} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="groupSize"
                      rules={{
                        required: "Group size is required",
                        min: {
                          value: 1,
                          message: "Group size must be at least 1",
                        },
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Please enter a valid number",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Current Group Size*
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              placeholder="How many trekkers do you have?"
                              className={cn(
                                "h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20",
                                errors.groupSize && "border-red-500"
                              )}
                              onChange={(e) => {
                                field.onChange(e);
                                setGroupSize(parseInt(e.target.value, 10));
                              }}
                            />
                          </FormControl>
                          <ErrorMessage message={errors.groupSize?.message} />
                          <ErrorMessage message={formErrors.groupSize} />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="additionalMembers"
                      rules={{
                        required: "Additional members needed is required",
                        min: { value: 0, message: "Cannot be negative" },
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Please enter a valid number",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <UsersIcon className="w-4 h-4" />
                            Additional Members Needed*
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="How many more people do you need?"
                              className={cn(
                                "h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20",
                                errors.additionalMembers && "border-red-500"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <ErrorMessage
                            message={errors.additionalMembers?.message}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="genderPreference"
                      rules={{ required: "Please select a gender preference" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Gender Preference*
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-12 rounded-xl border-gray-200",
                                  errors.genderPreference && "border-red-500"
                                )}
                              >
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <ErrorMessage
                            message={errors.genderPreference?.message}
                          />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="ageFrom"
                        rules={{
                          required: "Minimum age is required",
                          min: { value: 1, message: "Age must be positive" },
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Please enter a valid number",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Age Range (From)*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Min age"
                                className={cn(
                                  "h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20",
                                  errors.ageFrom && "border-red-500"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <ErrorMessage message={errors.ageFrom?.message} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="ageTo"
                        rules={{
                          required: "Maximum age is required",
                          min: { value: 1, message: "Age must be positive" },
                          validate: {
                            greaterThanFrom: (value) => {
                              return (
                                parseInt(value) >=
                                  parseInt(watchedFields.ageFrom) ||
                                "To age must be greater than or equal to From age"
                              );
                            },
                          },
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Please enter a valid number",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              To*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Max age"
                                className={cn(
                                  "h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20",
                                  errors.ageTo && "border-red-500"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <ErrorMessage message={errors.ageTo?.message} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Display general form errors if any */}
                {Object.keys(formErrors).length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fix the errors before proceeding.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="rounded-xl border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10"
                    >
                      Previous
                    </Button>
                  )}
                  {step < 3 && (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className={cn(
                        "ml-auto rounded-xl bg-[#6366f1] hover:bg-[#6366f1]/90 text-white",
                        Object.keys(errors).length > 0 &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {step === 3 && (
                    <Button
                      type="submit"
                      className={cn(
                        "ml-auto rounded-xl bg-[#6366f1] hover:bg-[#6366f1]/90 text-white",
                        Object.keys(errors).length > 0 &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Create Group
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupFormation;
