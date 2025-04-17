import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Search,
  ChevronRight,
  PlusCircle,
  Loader2,
  AlertCircle,
  MessageCircle,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import groupServices from "@/services/groupServices";
import { Alert, AlertDescription } from "@/components/ui/alert";
import auth from "@/services/auth"; // Import auth service
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const JoinGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [joiningGroup, setJoiningGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    difficulty: "",
    duration: "",
    groupType: "",
    age: "Any",
    gender: "Any",
  });

  // Fetch current user and groups when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get current user data
        const userData = await auth.getCurrentUser();
        console.log("Current user data:", userData);
        setCurrentUser(userData.data.data);

        console.log("Current user loaded:", userData);

        // Then fetch groups
        await fetchGroups();
      } catch (err) {
        console.error("Failed to initialize:", err);
        setError("Failed to load user data. Please try logging in again.");
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all available groups
      const response = await groupServices.getAllGroups();

      // Format the data to match our UI needs
      if (response?.groups) {
        setGroups(response.groups);
      } else {
        setGroups([]);
      }

      console.log("Fetched groups:", response?.groups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroup(groupId);
      setError(null);

      await groupServices.joinGroup(groupId);

      // Refresh the groups list after joining
      await fetchGroups();

      // Show success message
      setSuccessMessage("You have joined the group successfully!");

      // Navigate to group chat
      navigate(`/groupchat`, { state: { selectedGroupId: groupId } });
    } catch (err) {
      console.error("Failed to join group:", err);
      setError(err.message || "Failed to join group. Please try again later.");
    } finally {
      setJoiningGroup(null);
    }
  };

  const handleOpenChat = (groupId) => {
    navigate(`/groupchat`, { state: { selectedGroupId: groupId } });
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "Dates not specified";

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } catch (err) {
      return "Invalid dates";
    }
  };

  // Check if user is a member of the group
  const isUserMember = (group) => {
    if (!currentUser) return false;

    // Check if user is the creator
    if (group.createdBy && group.createdBy._id === currentUser._id) {
      return true;
    }

    // Check if user is in members array
    if (group.members && Array.isArray(group.members)) {
      return group.members.some((member) => {
        if (member.user) {
          return member.user._id === currentUser._id;
        }
        // Check if member has user field or is directly the user
        return member._id === currentUser._id;
      });
    }

    return false;
  };

  // Check if user is an admin of the group
  const isUserAdmin = (group) => {
    if (!currentUser) return false;

    // Check if user is the creator
    if (group.createdBy && group.createdBy._id === currentUser._id) {
      return true;
    }

    // Check if user is an admin member
    if (group.members && Array.isArray(group.members)) {
      return group.members.some((member) => {
        // If member has user property (nested structure)
        if (member.user && member.role === "admin") {
          return member.user._id === currentUser._id;
        }
        // If member is directly the user
        return member._id === currentUser._id && member.role === "admin";
      });
    }

    return false;
  };

  // Check if user meets age requirements
  const userMeetsAgeRequirements = (group) => {
    if (!currentUser || !currentUser.age) return true; // If we don't have user age, assume eligible

    const userAge = currentUser.age;
    const minAge = group.trekDetails?.ageFrom || 0;
    const maxAge = group.trekDetails?.ageTo || 999;

    return userAge >= minAge && userAge <= maxAge;
  };

  // Check if user meets gender requirements
  const userMeetsGenderRequirements = (group) => {
    if (!currentUser || !currentUser.gender) return true; // If we don't have user gender, assume eligible

    const userGender = currentUser.gender.toLowerCase();
    console.log("user gender is ", userGender);
    const groupGenderPref = (
      group.trekDetails?.genderPreference || "any"
    ).toLowerCase();
    console.log("trek gender pref is ", groupGenderPref);

    // If group accepts any gender
    if (groupGenderPref === "any" || groupGenderPref === "mixed") return true;

    // If group is gender specific
    console.log("answer is ", userGender === groupGenderPref);
    return userGender === groupGenderPref;
  };

  // Check if the group is full
  const isGroupFull = (group) => {
    // memberCount is people who have already joined
    const memberCount = group.memberCount || group.members?.length || 0;

    // The total capacity is the existing group size plus additional members they want to add
    const totalCapacity =
      (group.trekDetails?.groupSize || 0) +
      (group.trekDetails?.additionalMembers || 0);

    // The group is full when the current members equal or exceed the total capacity
    return memberCount >= totalCapacity;
  };

  // Check all eligibility criteria
  const checkEligibility = (group) => {
    if (!currentUser) return { eligible: false, reason: "Please log in first" };

    // First check if group is full
    if (isGroupFull(group)) {
      return { eligible: false, reason: "Group is full" };
    }

    // Check age requirements
    if (!userMeetsAgeRequirements(group)) {
      return {
        eligible: false,
        reason: `Age requirement: ${group.trekDetails?.ageFrom || "any"} - ${
          group.trekDetails?.ageTo || "any"
        }`,
      };
    }

    // Check gender requirements
    if (!userMeetsGenderRequirements(group)) {
      return {
        eligible: false,
        reason: `Gender requirement: ${(
          group.trekDetails?.genderPreference || "any"
        ).toUpperCase()}`,
      };
    }

    // All checks passed
    return { eligible: true };
  };

  // Get group status based on various conditions
  const getGroupStatus = (group) => {
    if (!currentUser) return "Can Join"; // Default if user not loaded yet

    // Debug log to help identify issues
    console.log(
      `Checking group ${group.name} - Current user ID: ${currentUser._id}`
    );
    console.log(`Group creator: ${group.createdBy?._id}`);

    // Check if current user is the creator
    if (group.createdBy && group.createdBy._id === currentUser._id) {
      return "Your Group";
    }

    // Check if user is an admin
    if (isUserAdmin(group)) {
      return "Your Group";
    }

    // Check if user is a member
    if (isUserMember(group)) {
      return "Member";
    }

    // Check if group is full
    if (isGroupFull(group)) {
      return "Full";
    }

    // Now check other requirements
    const eligibility = checkEligibility(group);
    if (!eligibility.eligible) {
      return "Not Eligible";
    }

    return "Can Join";
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.trekRoute?.toLowerCase().includes(searchQuery.toLowerCase());

    // For demo, we'll ignore some filters that aren't in our API yet
    const matchesGender =
      filters.gender === "Any" ||
      group.trekDetails?.genderPreference === filters.gender.toLowerCase() ||
      group.trekDetails?.genderPreference === "any";

    // We'll do simple age range matching
    let matchesAge = true;
    if (filters.age !== "Any") {
      const [minAge, maxAge] = filters.age.split("-").map((a) => parseInt(a));
      const groupMinAge = group.trekDetails?.ageFrom || 0;
      const groupMaxAge = group.trekDetails?.ageTo || 999;

      // Check if age ranges overlap
      matchesAge = !(groupMaxAge < minAge || groupMinAge > maxAge);
    }

    return matchesSearch && matchesGender && matchesAge;
  });

  return (
    <div className=" mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="flex flex-col  gap-4">
          <div className="my-6 flex justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-[#6366f1] border-[#6366f1] hover:bg-[#6366f1] hover:text-white"
              onClick={() => navigate("/groupformation")}
            >
              <PlusCircle className="h-5 w-5" />
              Create Your Group
            </Button>
          </div>

          {/* Success message */}
          {successMessage && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              className="pl-10 border border-gray-300 rounded-lg focus:border-[#6366f1] focus:ring-[#6366f1]"
              placeholder="Search treks, guides, or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg focus:border-[#6366f1] focus:ring-[#6366f1]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="border border-gray-300 rounded-lg">
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, age: value }))
              }
            >
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg focus:border-[#6366f1] focus:ring-[#6366f1]">
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent className="border border-gray-300 rounded-lg">
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="20-30">20-30</SelectItem>
                <SelectItem value="25-35">25-35</SelectItem>
                <SelectItem value="30-40">30-40</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-[#6366f1] animate-spin" />
            <span className="ml-2 text-lg text-gray-600">
              Loading groups...
            </span>
          </div>
        )}

        {/* Groups Section */}
        {!loading && (
          <section>
            <div className="flex justify-between items-center mb-4 mt-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Available Groups
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGroups}
                className="text-sm text-[#6366f1] hover:bg-[#6366f1]/10"
              >
                Refresh
              </Button>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  No groups found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.map((group) => {
                  const status = getGroupStatus(group);
                  const memberCount =
                    group.memberCount || group.members?.length || 0;

                  // Calculate total capacity (existing group + additional spots)
                  const baseGroupSize = group.trekDetails?.groupSize || 0;
                  const additionalMembers =
                    group.trekDetails?.additionalMembers || 0;
                  const totalCapacity = baseGroupSize + additionalMembers;

                  const dateRange = formatDateRange(
                    group.trekDetails?.startDate,
                    group.trekDetails?.endDate
                  );
                  const genderPref =
                    group.trekDetails?.genderPreference || "any";
                  const ageRange =
                    group.trekDetails?.ageFrom && group.trekDetails?.ageTo
                      ? `${group.trekDetails.ageFrom}-${group.trekDetails.ageTo}`
                      : "any";

                  // Check if user is a member or admin
                  const isMember =
                    status === "Your Group" || status === "Member";

                  // Check eligibility (get details if not eligible)
                  const eligibility = checkEligibility(group);

                  // For debugging
                  console.log(
                    `Group ${group.name} - Status: ${status}, isMember: ${isMember}`
                  );

                  return (
                    <Card
                      key={group._id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-300 rounded-lg"
                      onClick={() => {
                        if (isMember) {
                          handleOpenChat(group._id);
                        }
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-gray-700">
                              {group.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              {group.trekRoute}
                            </p>
                          </div>
                          <Badge
                            variant={
                              status === "Your Group"
                                ? "outline"
                                : status === "Member"
                                ? "secondary"
                                : status === "Can Join"
                                ? "success"
                                : status === "Not Eligible"
                                ? "destructive"
                                : "secondary"
                            }
                            className={`${
                              status === "Your Group"
                                ? "bg-purple-100 text-purple-700 border-purple-300"
                                : status === "Member"
                                ? "bg-blue-100 text-blue-700"
                                : status === "Can Join"
                                ? "bg-green-100 text-green-700"
                                : status === "Not Eligible"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-700"
                            } rounded-lg px-2 py-1`}
                          >
                            {status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-5 w-5" />
                            <span>
                              {memberCount}/{totalCapacity} members
                            </span>
                            {baseGroupSize > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Group of {baseGroupSize} looking for{" "}
                                      {additionalMembers} more
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-5 w-5" />
                            <span>{dateRange}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Age: {ageRange}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>
                              Gender:{" "}
                              {genderPref === "any"
                                ? "Mixed"
                                : genderPref.charAt(0).toUpperCase() +
                                  genderPref.slice(1)}
                            </span>
                          </div>

                          {/* Action buttons based on status */}
                          {status === "Can Join" && (
                            <Button
                              variant="success"
                              size="sm"
                              disabled={joiningGroup === group._id}
                              className="bg-[#6366f1] text-white hover:bg-[#6366f1]/90 w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinGroup(group._id);
                              }}
                            >
                              {joiningGroup === group._id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Joining...
                                </>
                              ) : (
                                "Join Group"
                              )}
                            </Button>
                          )}

                          {isMember && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChat(group._id);
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                              Open Chat
                            </Button>
                          )}

                          {status === "Full" && !isMember && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="w-full opacity-50 cursor-not-allowed"
                            >
                              Group Full
                            </Button>
                          )}

                          {status === "Not Eligible" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="w-full flex items-center justify-center gap-2 border-orange-300 text-orange-700 bg-orange-50"
                                  >
                                    <Info className="h-4 w-4" />
                                    Not Eligible
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white p-2 shadow-lg rounded-md border">
                                  <p>{eligibility.reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default JoinGroups;
