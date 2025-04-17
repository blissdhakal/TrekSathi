import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  X,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import socialServices from "../services/socialServices";
import { useForm } from "react-hook-form";
import auth from "../services/auth"; // Make sure to import your auth service

const CommentsModal = ({ post, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();

  const commentText = watch("text", "");
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCommentCount, setOriginalCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [votingCommentId, setVotingCommentId] = useState(null); // Track which comment is being voted on
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Function to check authentication and get current user
  const checkAuth = async () => {
    try {
      const userData = await auth.getCurrentUser();
      setCurrentUser(userData.data.data);
      // Set current user ID for upvote/downvote highlighting
      setCurrentUserId(userData.data.data._id);
      console.log("Current user data:", userData.data.data);
    } catch (error) {
      console.error("Authentication check failed:", error);
      // Handle auth error - possibly redirect or show message
    }
  };

  // Ref for scrolling to bottom on new comment
  const commentListRef = useRef(null);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await socialServices.addComment({
        post_id: post._id,
        text: data.text,
      });

      // Get updated comments
      await getAllComments();

      // Update the post's comment count in the parent component
      if (post.commentCount !== undefined) {
        post.commentCount += 1;
      }

      reset();

      // Scroll to bottom after adding comment
      setTimeout(() => {
        if (commentListRef.current) {
          commentListRef.current.scrollTop =
            commentListRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllComments = async () => {
    try {
      setIsLoading(true);
      const commentsForPost = await socialServices.getAllComments({
        postId: post._id,
      });
      setComments(commentsForPost);
      console.log("Fetched comments:", commentsForPost);

      // Store the original comment count on first load
      if (originalCommentCount === 0) {
        setOriginalCommentCount(commentsForPost.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upvote/downvote with loading state to prevent race conditions
  const handleVote = async (commentId, isUpvote) => {
    // If already voting on any comment, do nothing
    if (votingCommentId) return;

    try {
      setVotingCommentId(commentId); // Set which comment is being voted on

      if (isUpvote) {
        await socialServices.upvoteComment(commentId);
      } else {
        await socialServices.downvoteComment(commentId);
      }

      // Refresh comments to get updated vote counts
      await getAllComments();
    } catch (error) {
      console.error(
        `Error ${isUpvote ? "upvoting" : "downvoting"} comment:`,
        error
      );
    } finally {
      setVotingCommentId(null); // Clear voting state
    }
  };

  // When the modal is closing, update the comment count if it has changed
  const handleClose = () => {
    // If comments count has changed from original, update the post object
    if (
      post.commentCount !== undefined &&
      comments.length !== originalCommentCount
    ) {
      post.commentCount = comments.length;
    }
    onClose();
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time to readable format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format relative time (e.g. "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffMins > 0) {
      return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
    } else {
      return "Just now";
    }
  };

  useEffect(() => {
    // Check authentication and get current user when component mounts
    checkAuth();
    // Get all comments for the post
    getAllComments();
  }, [post._id]);

  // Modal closing animation
  const [isClosing, setIsClosing] = useState(false);

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      handleClose();
    }, 300); // Match this with the CSS transition duration
  };

  // Get upvote count
  const getUpvoteCount = (comment) => {
    if (Array.isArray(comment.upvotes)) {
      return comment.upvotes.length;
    }
    return typeof comment.upvotes === "number" ? comment.upvotes : 0;
  };

  // Get downvote count
  const getDownvoteCount = (comment) => {
    if (Array.isArray(comment.downvotes)) {
      return comment.downvotes.length;
    }
    return typeof comment.downvotes === "number" ? comment.downvotes : 0;
  };

  // Check if current user has upvoted a comment
  const hasUserUpvoted = (comment) => {
    if (!Array.isArray(comment.upvotes) || !currentUserId) return false;

    // Check if the current user's ID is in the upvotes array
    return comment.upvotes.some((upvoter) =>
      typeof upvoter === "object"
        ? upvoter._id === currentUserId
        : upvoter === currentUserId
    );
  };

  // Check if current user has downvoted a comment
  const hasUserDownvoted = (comment) => {
    if (!Array.isArray(comment.downvotes) || !currentUserId) return false;

    // Check if the current user's ID is in the downvotes array
    return comment.downvotes.some((downvoter) =>
      typeof downvoter === "object"
        ? downvoter._id === currentUserId
        : downvoter === currentUserId
    );
  };

  // Handle Enter key press for submitting comment
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action (new line)
      if (commentText.trim() && !isSubmitting) {
        handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleModalClose}
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl p-0 w-full max-w-md shadow-2xl transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              Comments {comments?.length > 0 && `(${comments.length})`}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleModalClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Post Summary */}
        <div className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-500">
              {post.userProfile?.profilePicture?.url ? (
                <AvatarImage
                  src={post.userProfile.profilePicture.url}
                  alt={post.userFullName}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {post.userFullName?.[0] || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{post.userFullName}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                {post.text}
              </p>
            </div>
          </div>
        </div>

        {/* Comments  List */}
        <div
          ref={commentListRef}
          className="overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: "calc(85vh - 250px)", minHeight: "200px" }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading comments...
              </p>
            </div>
          ) : comments?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No comments yet.
                <br />
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment._id}
                className={`animate-fadeIn transition-all duration-300 ${
                  index === comments.length - 1 && comments.length > 5
                    ? "pb-2"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      {comment.user?.fullName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm">
                          {comment.user?.fullName || "Anonymous"}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 break-words">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 px-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(comment.created_at)}</span>
                      </div>

                      {/* Vote buttons with counts */}
                      <div className="flex items-center ml-auto space-x-3">
                        {/* Upvote section */}
                        <div className="flex items-center">
                          <button
                            className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                              votingCommentId === comment._id
                                ? "opacity-50"
                                : hasUserUpvoted(comment)
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500"
                                : "hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-800 dark:hover:text-green-500"
                            }`}
                            onClick={() => handleVote(comment._id, true)}
                            disabled={votingCommentId !== null}
                            title="Upvote"
                          >
                            {votingCommentId === comment._id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-current rounded-full"></div>
                            ) : (
                              <ThumbsUp className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                            {getUpvoteCount(comment)}
                          </span>
                        </div>

                        {/* Downvote section */}
                        <div className="flex items-center">
                          <button
                            className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                              votingCommentId === comment._id
                                ? "opacity-50"
                                : hasUserDownvoted(comment)
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500"
                                : "hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-500"
                            }`}
                            onClick={() => handleVote(comment._id, false)}
                            disabled={votingCommentId !== null}
                            title="Downvote"
                          >
                            {votingCommentId === comment._id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-current rounded-full"></div>
                            ) : (
                              <ThumbsDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                            {getDownvoteCount(comment)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {index < comments.length - 1 && (
                  <div className="ml-10 mt-4 mb-4">
                    <Separator className="dark:bg-gray-700" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-start space-x-2"
          >
            <Avatar className="h-8 w-8 mt-2">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                {currentUser?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative flex items-start">
              <textarea
                placeholder="Add a comment... (Press Enter to send)"
                {...register("text", {
                  required: "Comment text is required",
                  minLength: {
                    value: 1,
                    message: "Comment cannot be empty",
                  },
                })}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-l-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.text ? "border-red-500 focus:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
                rows={2}
                style={{ resize: "none", maxHeight: "100px" }}
                onKeyDown={handleKeyDown} // Handle Enter key
              />
              <Button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className={`h-full rounded-r-2xl rounded-l-none px-4 flex items-center justify-center ${
                  !commentText.trim()
                    ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
          {errors.text && (
            <span className="text-red-500 text-xs mt-1 ml-10">
              {errors.text.message}
            </span>
          )}
          <div className="mt-2 ml-10 text-xs text-gray-500 dark:text-gray-400">
            {commentText.length > 0 && `${commentText.length} characters`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
