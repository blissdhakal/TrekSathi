import React, { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Send,
  Shield,
  User,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import groupServices from "../services/groupServices";
import auth from "../services/auth";
import profileService from "@/services/profile";
import messageServices from "../services/messageServices";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

const GroupChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null); // Current user's profile image
  const [userProfiles, setUserProfiles] = useState({}); // Cache for all user profiles
  const [loading, setLoading] = useState(true);

  // Groups state
  const [userGroups, setUserGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  // Groups with last messages (for preview)
  const [groupsWithLastMessage, setGroupsWithLastMessage] = useState({});

  // Mobile responsive state
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatView, setShowChatView] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  const [showGroupDetailsDialog, setShowGroupDetailsDialog] = useState(false);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      // If switching to desktop view, make sure both panels are visible
      if (!mobile) {
        setShowChatView(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch the current user's profile image
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      if (currentUser) {
        try {
          const profileData = await profileService.getProfileDetails();
          if (profileData?.profilePicture?.url) {
            setUserProfileImage(profileData.profilePicture.url);

            // Add the current user's profile to the cache
            setUserProfiles((prev) => ({
              ...prev,
              [currentUser._id]: {
                profileImage: profileData.profilePicture.url,
              },
            }));
          }
        } catch (error) {
          console.error("Failed to load profile image:", error);
        }
      }
    };

    fetchUserProfileImage();
  }, [currentUser]);

  // Verify authentication and load initial data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await auth.getCurrentUser();
        setCurrentUser(userData.data.data);
        console.log("Current user data:", userData.data.data);
        await loadUserGroups();
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Load user's groups
  const loadUserGroups = async () => {
    try {
      const groups = await groupServices.getUserGroups();

      // Also load last message for each group
      const groupsWithMessages = {};

      for (const group of groups) {
        try {
          const messagesData = await messageServices.getGroupMessages(
            group._id,
            1
          );
          if (messagesData.length > 0) {
            groupsWithMessages[group._id] =
              messagesData[messagesData.length - 1];
          }
        } catch (err) {
          console.error(`Failed to load messages for group ${group._id}`, err);
        }
      }

      setGroupsWithLastMessage(groupsWithMessages);

      // Sort groups by last message timestamp if available
      const sortedGroups = [...groups].sort((a, b) => {
        const aLastMsg = groupsWithMessages[a._id];
        const bLastMsg = groupsWithMessages[b._id];

        if (!aLastMsg && !bLastMsg) return 0;
        if (!aLastMsg) return 1;
        if (!bLastMsg) return -1;

        return new Date(bLastMsg.createdAt) - new Date(aLastMsg.createdAt);
      });

      setUserGroups(sortedGroups);

      // Check if a specific group ID was passed in the location state
      const selectedGroupId = location.state?.selectedGroupId;

      if (selectedGroupId) {
        // If a specific group was requested, select it
        handleSelectGroup(selectedGroupId);

        // On mobile, show chat view when group is selected via direct link
        if (isMobileView) {
          setShowChatView(true);
        }
      } else if (!currentGroup && sortedGroups.length > 0) {
        // Otherwise, select the first group by default
        handleSelectGroup(sortedGroups[0]._id);

        // On mobile, don't automatically show chat view
        if (isMobileView) {
          setShowChatView(false);
        }
      }

      console.log("User groups loaded:", sortedGroups);
    } catch (error) {
      toast.error("Failed to load your groups");
      console.error(error);
    }
  };

  // Select and load a group
  const handleSelectGroup = async (groupId) => {
    try {
      setLoadingMessages(true);
      const groupData = await groupServices.getGroupById(groupId);
      setCurrentGroup(groupData);

      // Fetch profile images for all members when group is selected
      const membersWithProfiles = await Promise.all(
        groupData.members.map(async (member) => {
          // Check if we already have this user's profile in cache
          if (userProfiles[member._id]) {
            return member;
          }

          try {
            // If member is current user, use the current user's profile image
            if (member._id === currentUser?._id && userProfileImage) {
              setUserProfiles((prev) => ({
                ...prev,
                [member._id]: { profileImage: userProfileImage },
              }));
              return member;
            }

            // Otherwise fetch the member's profile image
            const profileData = await profileService.getUserProfileById(
              member._id
            );
            if (profileData?.profilePicture?.url) {
              setUserProfiles((prev) => ({
                ...prev,
                [member._id]: { profileImage: profileData.profilePicture.url },
              }));
              console.log(
                "Member profile loaded:",
                profileData.profilePicture.url
              );
            }
          } catch (error) {
            console.error(
              `Failed to load profile for member ${member._id}:`,
              error
            );
          }
          console.log("Member profile loaded:", member);
          return member;
        })
      );

      setGroupMembers(membersWithProfiles);

      // Load messages for this group
      const messagesData = await messageServices.getGroupMessages(groupId);
      setMessages(messagesData);

      // Clear unread count for this group
      setUnreadMessages((prev) => ({
        ...prev,
        [groupId]: 0,
      }));

      // On mobile, switch to chat view
      if (isMobileView) {
        setShowChatView(true);
      }

      // Focus on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initialize Pusher for real-time messaging
  useEffect(() => {
    // Subscribe to all groups for new message notifications
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    // Create channels for all user groups
    const channels = {};
    const updateChannels = {};

    userGroups.forEach((group) => {
      // Message channel
      channels[group._id] = pusher.subscribe(`group-${group._id}`);
      channels[group._id].bind("new-message", (data) => {
        // If this is the currently open group, add the message to chat
        if (currentGroup && group._id === currentGroup._id) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }

        // Update the last message for this group
        setGroupsWithLastMessage((prev) => ({
          ...prev,
          [group._id]: data,
        }));

        // Track unread messages
        if (currentGroup?._id !== group._id) {
          setUnreadMessages((prev) => ({
            ...prev,
            [group._id]: (prev[group._id] || 0) + 1,
          }));
        }

        // Move this group to the top of the list
        setUserGroups((prevGroups) => {
          const newGroups = [...prevGroups];
          const index = newGroups.findIndex((g) => g._id === group._id);
          if (index > 0) {
            // Only move if not already at the top
            const [movedGroup] = newGroups.splice(index, 1);
            newGroups.unshift(movedGroup);
          }
          return newGroups;
        });
      });

      // Updates channel
      updateChannels[group._id] = pusher.subscribe(
        `group-updates-${group._id}`
      );

      updateChannels[group._id].bind("member-joined", async (data) => {
        // Fetch profile image for new member
        try {
          const profileData = await profileService.getUserProfileById(
            data.member._id
          );
          if (profileData?.profilePicture?.url) {
            setUserProfiles((prev) => ({
              ...prev,
              [data.member._id]: {
                profileImage: profileData.profilePicture.url,
              },
            }));
          }
        } catch (error) {
          console.error(`Failed to load profile for new member:`, error);
        }

        if (currentGroup && group._id === currentGroup._id) {
          setGroupMembers((prevMembers) => [...prevMembers, data.member]);
        }
      });

      updateChannels[group._id].bind("member-left", (data) => {
        if (currentGroup && group._id === currentGroup._id) {
          setGroupMembers((prevMembers) =>
            prevMembers.filter((member) => member._id !== data.memberId)
          );
        }
      });
    });

    return () => {
      // Clean up all subscriptions
      Object.keys(channels).forEach((groupId) => {
        pusher.unsubscribe(`group-${groupId}`);
      });

      Object.keys(updateChannels).forEach((groupId) => {
        pusher.unsubscribe(`group-updates-${groupId}`);
      });
    };
  }, [userGroups, currentGroup]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if message is a system message
  const isSystemMessage = (msg) => {
    // Enhanced system message detection
    const systemMsgPatterns = [
      "created this group",
      "created the group",
      "joined the group",
      "left the group",
      "added to the group",
      "removed from group",
    ];

    // Check for date/time patterns with UTC
    const isDateTimeMessage =
      msg.text?.includes("UTC") ||
      msg.text?.includes("Date and Time") ||
      /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(msg.text);

    return (
      msg.isSystemMessage ||
      systemMsgPatterns.some((pattern) => msg.text?.includes(pattern)) ||
      isDateTimeMessage
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateString || "Unknown date";
    }
  };

  // Format time for message preview
  const formatMessageTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      // If the message is from today
      if (date.toDateString() === now.toDateString()) {
        return format(date, "h:mm a");
      }
      // If the message is from yesterday
      else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
      // If the message is from this year
      else if (date.getFullYear() === now.getFullYear()) {
        return format(date, "MMM d");
      }
      // If the message is older
      else {
        return format(date, "MM/dd/yy");
      }
    } catch (error) {
      return "";
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim() || !currentGroup || sendingMessage) return;

    try {
      setSendingMessage(true);
      await messageServices.sendMessage({
        groupId: currentGroup._id,
        text: message,
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setSendingMessage(false);
      textareaRef.current?.focus();
    }
  };

  // Handle key press for sending messages with Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Join a group
  const handleJoinGroup = async (groupId) => {
    try {
      await groupServices.joinGroup(groupId);
      toast.success("Successfully joined the group");
      await loadUserGroups();
      await handleSelectGroup(groupId);
    } catch (error) {
      toast.error(error.message || "Failed to join group");
    }
  };

  // Leave a group
  const handleLeaveGroup = async () => {
    if (!currentGroup) return;

    try {
      await groupServices.leaveGroup(currentGroup._id);
      toast.success("Successfully left the group");

      // Update local state
      setUserGroups(userGroups.filter((g) => g._id !== currentGroup._id));
      setCurrentGroup(null);
      setMessages([]);

      // On mobile, go back to list view
      if (isMobileView) {
        setShowChatView(false);
      }

      await loadUserGroups();
    } catch (error) {
      toast.error("Failed to leave group");
    }
  };

  // Make user an admin
  const handleMakeAdmin = async (userId) => {
    try {
      await groupServices.makeAdmin(currentGroup._id, userId);
      toast.success("User promoted to admin");

      // Update group members to reflect the change
      setGroupMembers(
        groupMembers.map((member) => {
          if (member._id === userId) {
            return { ...member, role: "admin" };
          }
          return member;
        })
      );
    } catch (error) {
      toast.error("Failed to make user an admin");
    }
  };

  // Remove a member from the group
  const handleRemoveMember = async (userId) => {
    try {
      await groupServices.removeMember(currentGroup._id, userId);
      toast.success("Member removed from group");

      // Update group members
      setGroupMembers(groupMembers.filter((member) => member._id !== userId));
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  // Check if current user is admin
  const isCurrentUserAdmin = () => {
    if (!currentGroup || !currentUser) return false;

    const currentUserInGroup = groupMembers.find(
      (member) => member._id === currentUser._id
    );
    return (
      currentUserInGroup?.role === "admin" ||
      currentUserInGroup?.role === "owner"
    );
  };

  // Get role badge component
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
          >
            <Shield className="w-3 h-3 mr-1" /> Admin
          </Badge>
        );
      case "owner":
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-purple-100 text-purple-800 border-purple-200"
          >
            <Shield className="w-3 h-3 mr-1" /> Owner
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-gray-100 text-gray-600 border-gray-200"
          >
            <User className="w-3 h-3 mr-1" /> Member
          </Badge>
        );
    }
  };

  // Sort members by role (owner first, then admins, then members)
  const sortedMembers = () => {
    if (!groupMembers.length) return [];

    return [...groupMembers].sort((a, b) => {
      const roleWeight = {
        owner: 3,
        admin: 2,
        member: 1,
      };

      return roleWeight[b.role] - roleWeight[a.role];
    });
  };

  // Get message preview text
  const getMessagePreview = (groupId) => {
    const lastMsg = groupsWithLastMessage[groupId];
    if (!lastMsg) return "No messages yet";

    if (isSystemMessage(lastMsg)) {
      return lastMsg.text;
    }

    // If current user sent the message
    if (lastMsg.sender === currentUser?._id) {
      return `You: ${lastMsg.text}`;
    }

    return `${lastMsg.senderUsername}: ${lastMsg.text}`;
  };

  // Get profile image for a user
  const getUserProfileImage = (userId) => {
    if (userId === currentUser?._id) {
      return userProfileImage;
    }

    return userProfiles[userId]?.profileImage || null;
  };

  // Generate initials from a name
  const getInitials = (name) => {
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Groups List - hidden on mobile when chat is active */}
        <Card
          className={`${
            isMobileView ? "col-span-12" : "col-span-4"
          } border-[#6366f1]/20 ${
            isMobileView && showChatView ? "hidden" : "block"
          }`}
        >
          <CardHeader className="bg-gradient-to-r from-[#6366f1]/5 to-[#6366f1]/10 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#6366f1]">Groups</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#6366f1] hover:bg-[#6366f1]/90"
                  onClick={() => navigate("/groupformation")}
                >
                  <Plus className="w-4 h-4 mr-1" /> New
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-1 p-2">
                {userGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You haven't joined any groups yet.
                    <p className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/joingroups")}
                      >
                        Explore Groups
                      </Button>
                    </p>
                  </div>
                ) : (
                  userGroups.map((group) => (
                    <div
                      key={group._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-[#6366f1]/5 ${
                        currentGroup?._id === group._id
                          ? "bg-[#6366f1]/10 border-l-4 border-[#6366f1]"
                          : ""
                      }`}
                      onClick={() => handleSelectGroup(group._id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={group.groupImage}
                            alt={group.name}
                          />
                          <AvatarFallback className="bg-[#6366f1]/20">
                            {group.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="font-medium">{group.name}</span>
                            {/* Message time */}
                            {groupsWithLastMessage[group._id] && (
                              <span className="text-xs text-gray-500">
                                {formatMessageTime(
                                  groupsWithLastMessage[group._id].createdAt
                                )}
                              </span>
                            )}
                          </div>
                          {/* Message preview */}
                          <div className="text-xs text-gray-500 truncate flex items-center justify-between">
                            <span className="truncate">
                              {getMessagePreview(group._id)}
                            </span>
                            {unreadMessages[group._id] > 0 && (
                              <Badge className="ml-1 bg-[#6366f1] text-white min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                                {unreadMessages[group._id]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area - full width on mobile */}
        <Card
          className={`${
            isMobileView ? "col-span-12" : "col-span-8"
          } border-[#6366f1]/20 ${
            isMobileView && !showChatView ? "hidden" : "block"
          }`}
        >
          <CardHeader className="bg-gradient-to-r from-[#6366f1]/5 to-[#6366f1]/10 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-1 p-1"
                    onClick={() => setShowChatView(false)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                {currentGroup && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={currentGroup.groupImage}
                        alt={currentGroup.name}
                      />
                      <AvatarFallback className="bg-[#6366f1]/20">
                        {currentGroup.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-[#6366f1]">
                      {currentGroup.name}
                    </CardTitle>
                  </>
                )}
                {!currentGroup && (
                  <CardTitle className="text-[#6366f1]">Group Chat</CardTitle>
                )}
              </div>
              {currentGroup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGroupDetailsDialog(true)}
                >
                  Group Details
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
                <span className="ml-2">Loading messages...</span>
              </div>
            ) : (
              <>
                {currentGroup ? (
                  <div className="flex flex-col h-[calc(100vh-12rem)]">
                    <ScrollArea className="flex-1 p-4">
                      {/* Messages */}
                      <div className="space-y-4">
                        {messages.map((msg, index) => {
                          // Check if it's a system message
                          if (isSystemMessage(msg)) {
                            return (
                              <div
                                key={msg._id || index}
                                className="flex justify-center"
                              >
                                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {msg.text}
                                </div>
                              </div>
                            );
                          }

                          const isCurrentUserMsg =
                            msg.sender === currentUser._id;

                          // Get profile image for this message sender
                          const profileImage = getUserProfileImage(msg.sender);

                          return (
                            <div
                              key={msg._id || index}
                              className={`flex ${
                                isCurrentUserMsg
                                  ? "justify-end"
                                  : "justify-start"
                              } w-full`}
                            >
                              <div
                                className={`flex items-start gap-2 max-w-[80%]`}
                              >
                                {!isCurrentUserMsg && (
                                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                                    <AvatarImage
                                      src={profileImage || msg.senderAvatar}
                                      alt={msg.senderUsername}
                                    />
                                    <AvatarFallback className="bg-[#6366f1]/20 text-[#6366f1]">
                                      {getInitials(msg.senderUsername)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <div>
                                  {!isCurrentUserMsg && (
                                    <div className="text-xs text-gray-500 mb-1 pl-1">
                                      {msg.senderUsername}
                                    </div>
                                  )}

                                  <div
                                    className={`px-4 py-2 rounded-2xl shadow-sm break-words
                                      ${
                                        isCurrentUserMsg
                                          ? "bg-[#0084ff] text-white"
                                          : "bg-gray-200 text-gray-800"
                                      }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-3 bg-white">
                      <div className="flex items-end gap-2">
                        <Textarea
                          ref={textareaRef}
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="flex-1 resize-none rounded-xl"
                          rows={1}
                          style={{
                            minHeight: "44px",
                            maxHeight: "120px",
                          }}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || sendingMessage}
                          className="bg-[#6366f1] hover:bg-[#6366f1]/90 rounded-full h-[44px] w-[44px] p-0 flex items-center justify-center"
                        >
                          {sendingMessage ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-center">
                        Press Enter to send, Shift+Enter for new line
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-gray-500">
                    <div className="text-xl mb-4">
                      Select a group to start chatting
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/joingroups")}
                    >
                      Explore Groups
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Details Dialog */}
      <Dialog
        open={showGroupDetailsDialog}
        onOpenChange={setShowGroupDetailsDialog}
        className="overflow-y-auto"
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {currentGroup && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={currentGroup.groupImage}
                      alt={currentGroup.name}
                    />
                    <AvatarFallback className="bg-[#6366f1]/20 text-[#6366f1]">
                      {currentGroup.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-lg">
                      {currentGroup.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />{" "}
                      {currentGroup.trekRoute}
                    </div>
                    <div className="flex mt-1 gap-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {groupMembers.length}{" "}
                        members
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Created{" "}
                        {formatDate(currentGroup.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {currentGroup.description && (
                  <div className="mt-2 text-sm text-gray-700">
                    {currentGroup.description}
                  </div>
                )}

                {currentGroup.trekDetails && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="font-medium text-sm mb-2">Trek Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Dates:</div>
                      <div>
                        {formatDate(currentGroup.trekDetails.startDate)} -{" "}
                        {formatDate(currentGroup.trekDetails.endDate)}
                      </div>

                      <div className="text-gray-500">Group Type:</div>
                      <div className="capitalize">
                        {currentGroup.trekDetails.genderPreference || "Mixed"}
                      </div>

                      {(currentGroup.trekDetails.ageFrom ||
                        currentGroup.trekDetails.ageTo) && (
                        <>
                          <div className="text-gray-500">Age Range:</div>
                          <div>
                            {currentGroup.trekDetails.ageFrom || "Any"} -{" "}
                            {currentGroup.trekDetails.ageTo || "Any"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      Members ({groupMembers.length})
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {sortedMembers().map((member) => {
                      // Get profile image for this member
                      const memberProfileImage = getUserProfileImage(
                        member._id
                      );

                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[#6366f1]/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={memberProfileImage || member.avatarUrl}
                                alt={member.user?.fullName || "User"}
                              />
                              <AvatarFallback className="bg-[#6366f1]/20 text-[#6366f1]">
                                {getInitials(member.user?.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium flex items-center">
                                {member.user?.fullName || "User"}
                                {getRoleBadge(member.role)}
                                {member._id === currentUser._id && (
                                  <Badge className="ml-2 bg-green-50 text-green-700 border-green-100">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                Joined{" "}
                                {formatDate(
                                  member.joinedAt || currentGroup.createdAt
                                )}
                              </div>
                            </div>
                          </div>
                          {isCurrentUserAdmin() &&
                            member._id !== currentUser._id && (
                              <div className="space-x-2">
                                {member.role !== "admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMakeAdmin(member._id)}
                                  >
                                    Make Admin
                                  </Button>
                                )}
                                {member.role !== "owner" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveMember(member._id)
                                    }
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveGroup}
                  >
                    Leave Group
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupChat;
