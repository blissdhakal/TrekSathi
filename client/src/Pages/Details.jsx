import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import socialServices from "@/services/socialServices";
import trekServices from "../services/trekServices";
import CommentsModal from "../components/CommentsModal";
import auth from "../services/auth"; // Import auth service

import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Share2,
  Bookmark,
  MapPin,
  Clock,
  Mountain,
  Ruler,
  Footprints,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";

// Inline UploadBox component
function UploadBox({ onFileChange, previewUrl }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileChange(file);
  };

  return (
    <div className="relative my-2 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-100 h-80 overflow-hidden">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Uploaded file preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-500 text-sm">
          Choose a file or drag and drop it here
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

export default function Details() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [trekDetails, setTrekDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingPostId, setVotingPostId] = useState(null); // Track which post is being voted on
  const [currentUserId, setCurrentUserId] = useState(null); // Store current user ID

  // Posts state with pagination
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 10;
  const [hasMore, setHasMore] = useState(true);

  const [newPost, setNewPost] = useState({
    text: "",
    profilePicture: null,
    location: "",
  });
  // For previewing the selected image inside upload box
  const [previewUrl, setPreviewUrl] = useState(null);
  // State to toggle the location input visibility (location is optional)
  const [showLocation, setShowLocation] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams();

  // Ref for intersection observer to auto-load more posts
  const loaderRef = useRef(null);

  // Get current user authentication
  const checkAuth = async () => {
    try {
      const userData = await auth.getCurrentUser();
      setCurrentUserId(userData.data.data._id);
      console.log("Current user ID:", userData.data.data._id);
    } catch (error) {
      console.error("Authentication check failed:", error);
    }
  };

  // Fixed vote handlers to prevent race conditions
  const handleUpvote = async (postId) => {
    // If already voting on this or another post, do nothing
    if (votingPostId) return;

    try {
      setVotingPostId(postId); // Set the currently voting post

      // Optimistically update UI for better UX
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            // If already upvoted, simulate removing upvote
            if (post.hasUpvoted) {
              return {
                ...post,
                hasUpvoted: false,
                voteCount: Math.max(0, (post.voteCount || 0) - 1),
              };
            }
            // If downvoted, simulate removing downvote and adding upvote
            else if (post.hasDownvoted) {
              return {
                ...post,
                hasUpvoted: true,
                hasDownvoted: false,
                voteCount: (post.voteCount || 0) + 2,
              };
            }
            // Otherwise, simulate adding upvote
            else {
              return {
                ...post,
                hasUpvoted: true,
                voteCount: (post.voteCount || 0) + 1,
              };
            }
          }
          return post;
        })
      );

      await socialServices.upvote(postId);

      // Refresh posts after upvote to get the actual updated vote count from server
      if (trekDetails) {
        fetchPosts(trekDetails._id, 1);
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
      // Revert optimistic update on error
      if (trekDetails) {
        fetchPosts(trekDetails._id, 1);
      }
    } finally {
      setVotingPostId(null); // Clear voting state regardless of outcome
    }
  };

  const handleDownvote = async (postId) => {
    // If already voting on this or another post, do nothing
    if (votingPostId) return;

    try {
      setVotingPostId(postId); // Set the currently voting post

      // Optimistically update UI for better UX
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            // If already downvoted, simulate removing downvote
            if (post.hasDownvoted) {
              return {
                ...post,
                hasDownvoted: false,
                voteCount: (post.voteCount || 0) + 1,
              };
            }
            // If upvoted, simulate removing upvote and adding downvote
            else if (post.hasUpvoted) {
              return {
                ...post,
                hasUpvoted: false,
                hasDownvoted: true,
                voteCount: (post.voteCount || 0) - 2,
              };
            }
            // Otherwise, simulate adding downvote
            else {
              return {
                ...post,
                hasDownvoted: true,
                voteCount: (post.voteCount || 0) - 1,
              };
            }
          }
          return post;
        })
      );

      await socialServices.downvote(postId);

      // Refresh posts to get actual server state
      if (trekDetails) {
        fetchPosts(trekDetails._id, 1);
      }
    } catch (error) {
      console.error("Error downvoting post:", error);
      // Revert optimistic update on error
      if (trekDetails) {
        fetchPosts(trekDetails._id, 1);
      }
    } finally {
      setVotingPostId(null); // Clear voting state regardless of outcome
    }
  };

  const handleOpenComments = (post) => {
    setSelectedPost(post);
  };

  const handleCloseComments = () => {
    if (selectedPost) {
      // Update the post in posts array with the potentially updated comment count
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPost._id ? selectedPost : post
        )
      );
    }
    setSelectedPost(null);
  };

  useEffect(() => {
    // Get current user authentication
    checkAuth();

    const fetchTrekDetails = async () => {
      try {
        setLoading(true);
        const trekData = await trekServices.getTrekBySlug(slug);
        console.log("Fetched trek details by slug:", slug);
        setTrekDetails(trekData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load trek details");
        setLoading(false);
        console.error("Error fetching trek details:", err);
      }
    };

    fetchTrekDetails();
  }, [slug]);

  // Fetch posts with pagination
  const fetchPosts = useCallback(
    async (trekid, currentPage = 1, limit = postsPerPage) => {
      try {
        console.log("Fetching posts for trek:", trekid, "Page:", currentPage);
        // socialServices.getAllPosts is assumed to accept page and limit parameters
        const postsData = await socialServices.getAllPosts(
          trekid,
          currentPage,
          limit
        );

        // Process posts to check if current user has upvoted or downvoted
        const processedPosts = postsData.map((post) => {
          const hasUpvoted =
            post.upvotes &&
            Array.isArray(post.upvotes) &&
            post.upvotes.some((userId) =>
              typeof userId === "object"
                ? userId._id === currentUserId
                : userId === currentUserId
            );

          const hasDownvoted =
            post.downvotes &&
            Array.isArray(post.downvotes) &&
            post.downvotes.some((userId) =>
              typeof userId === "object"
                ? userId._id === currentUserId
                : userId === currentUserId
            );

          return {
            ...post,
            hasUpvoted,
            hasDownvoted,
          };
        });

        if (processedPosts.length < limit) {
          setHasMore(false);
        }

        if (currentPage === 1) {
          setPosts(processedPosts);
        } else {
          setPosts((prev) => [...prev, ...processedPosts]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },
    [postsPerPage, currentUserId] // Add currentUserId as dependency
  );

  useEffect(() => {
    if (trekDetails) {
      fetchPosts(trekDetails._id, page);
    }
  }, [trekDetails, page, fetchPosts]);

  // Intersection Observer for automatic "load more" when reaching bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore]);

  // Sticky header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight * 1.1;
      setIsScrolled(scrollPosition > viewportHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddPost = async () => {
    try {
      if (!newPost.text.trim() || !newPost.profilePicture || isSubmitting) {
        alert("Please provide both text and an image");
        return;
      }

      setIsSubmitting(true); // Disable the post button

      await socialServices.addPost({
        profilePicture: [newPost.profilePicture],
        text: newPost.text,
        location: newPost.location, // location can be empty if not provided
        trekId: trekDetails._id,
      });

      console.log("Post added successfully for slug:", slug);
      setNewPost({ text: "", profilePicture: null, location: "" });
      setPreviewUrl(null);
      setShowLocation(false);
      setPage(1);
      setHasMore(true);
      fetchPosts(trekDetails._id, 1);
    } catch (error) {
      console.error("Error adding post:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false); // Re-enable the post button
    }
  };

  // Handle file change from the inline UploadBox by updating newPost and preview state
  const handleFileChange = (file) => {
    setNewPost((prev) => ({ ...prev, profilePicture: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trek details...</p>
        </div>
      </div>
    );
  }

  if (error || !trekDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Trek not found"}</p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-white/80 backdrop-blur-lg shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center p-4 py-3 relative">
              {/* Back Button - Positioned Absolutely */}
              <Link
                to="/"
                className="p-2 hover:bg-white/50 rounded-full transition-colors absolute left-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              {/* Stats Section - Centered */}
              <div className="flex items-center justify-center gap-1 sm:gap-3 lg:gap-8 mx-auto">
                {/* Distance */}
                <div className="flex flex-col items-center px-3 sm:px-5">
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <Ruler className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm">
                    {trekDetails.distance}
                  </span>
                  <span className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    Distance
                  </span>
                </div>

                {/* Separator */}
                <div className="h-12 border-l border-gray-300"></div>

                {/* Duration */}
                <div className="flex flex-col items-center px-3 sm:px-5">
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm">
                    {trekDetails.duration}
                  </span>
                  <span className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    Duration
                  </span>
                </div>

                {/* Separator */}
                <div className="h-12 border-l border-gray-300"></div>

                {/* Elevation */}
                <div className="flex flex-col items-center px-3 sm:px-5">
                  <div className="flex items-center justify-center text-red-600 mb-1">
                    <Mountain className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm">
                    {trekDetails.elevation}
                  </span>
                  <span className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    Elevation
                  </span>
                </div>
              </div>

              {/* Trek Button - Positioned Absolutely */}
              <button
                onClick={() => navigate(`/trekitinerary/${slug}`)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors sm:font-medium text-sm absolute right-4"
              >
                <Footprints className="h-5 w-5" />
                <span className="hidden sm:inline">Take This Trek</span>
                <span className="sm:hidden">Trek</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-[70vh] w-full">
        <img
          src={trekDetails.image}
          alt={trekDetails.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4">
          <Link
            to="/"
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <div className="flex gap-3">
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
              <Share2 className="h-6 w-6 text-white" />
            </button>
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
              <Bookmark className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Trek Details */}
      <div className="bg-white rounded-t-[2.5rem] -mt-10 relative max-w-4xl mx-auto">
        <div id="trek-details" className="px-6 pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{trekDetails.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="h-5 w-5" />
                  <span>{trekDetails.location}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/trekitinerary/${slug}`)}
                className="flex items-center gap-1 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                <Footprints className="h-4 w-4 sm:h-5 sm:w-5" />
                Take This Trek
              </button>
            </div>
            <div className="flex justify-between items-center py-6 border-y border-gray-100">
              <div className="text-center px-4">
                <Ruler className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Distance</p>
                <p className="font-semibold text-lg">{trekDetails.distance}</p>
              </div>
              <div className="text-center px-4 border-x border-gray-100">
                <Clock className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-lg">{trekDetails.duration}</p>
              </div>
              <div className="text-center px-4">
                <Mountain className="h-6 w-6 mx-auto text-red-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Elevation</p>
                <p className="font-semibold text-lg">{trekDetails.elevation}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                {trekDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8 px-6 max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Recent Updates
          </h3>

          {/* Post Input */}
          <div className="my-6 p-6 bg-white shadow-lg rounded-xl">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="What's on your mind?"
              value={newPost.text}
              onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
              disabled={isSubmitting}
            />
            {/* Location Field */}
            {showLocation ? (
              <input
                type="text"
                className="my-4 w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Add a location"
                value={newPost.location}
                onChange={(e) =>
                  setNewPost({ ...newPost, location: e.target.value })
                }
                disabled={isSubmitting}
              />
            ) : (
              <button
                onClick={() => setShowLocation(true)}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
                type="button"
                disabled={isSubmitting}
              >
                <MapPin className="h-5 w-5" />
                Add Location (Optional)
              </button>
            )}
            {/* Inline UploadBox Component */}
            <UploadBox
              onFileChange={handleFileChange}
              previewUrl={previewUrl}
            />
            <button
              className={`mt-4 w-full py-3 bg-blue-600 text-white rounded-full transition duration-200 ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              onClick={handleAddPost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>

          {posts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="text-4xl">🏔️</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  No Stories Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your trekking adventure and inspire others!
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 pb-20">
              {posts.map((post) => (
                <Card
                  key={post._id}
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          {post?.userProfile?.profilePicture?.url ? (
                            <AvatarImage
                              src={post.userProfile.profilePicture.url}
                              alt={post.userFullName}
                            />
                          ) : (
                            <AvatarFallback>
                              {post.userFullName.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {post.userFullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                    {/* Post Content */}
                    <div className="px-4 py-2">
                      <p className="text-sm leading-relaxed">{post.text}</p>
                    </div>
                    {/* Post Image */}
                    {post.image?.url && (
                      <div className="mt-2 relative aspect-video">
                        <img
                          src={post.image.url}
                          alt="post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Post Actions */}
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Upvote button - Reddit style */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full p-0 h-8 w-8 flex items-center justify-center ${
                            votingPostId === post._id ? "opacity-50" : ""
                          }`}
                          onClick={() => handleUpvote(post._id)}
                          disabled={votingPostId !== null}
                        >
                          {votingPostId === post._id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-orange-500 rounded-full"></div>
                          ) : (
                            <ArrowUp
                              className={`h-5 w-5 ${
                                post.hasUpvoted
                                  ? "text-orange-500 fill-orange-500"
                                  : "text-gray-500 stroke-[1.5]"
                              }`}
                            />
                          )}
                        </Button>

                        <span className="text-sm font-medium">
                          {post.voteCount || 0}
                        </span>

                        {/* Downvote button - Reddit style */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full p-0 h-8 w-8 flex items-center justify-center ${
                            votingPostId === post._id ? "opacity-50" : ""
                          }`}
                          onClick={() => handleDownvote(post._id)}
                          disabled={votingPostId !== null}
                        >
                          {votingPostId === post._id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-red-500 rounded-full"></div>
                          ) : (
                            <ArrowDown
                              className={`h-5 w-5 ${
                                post.hasDownvoted
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-500 stroke-[1.5]"
                              }`}
                            />
                          )}
                        </Button>

                        {/* Comment button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500"
                          onClick={() => handleOpenComments(post)}
                        >
                          <MessageCircle className="h-5 w-5 mr-1" />
                          <span className="text-xs">
                            {post.commentCount || 0}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </CardContent>
                </Card>
              ))}
              {/* Loader element for auto-load more */}
              {hasMore && (
                <div ref={loaderRef} className="py-4 text-center text-gray-600">
                  Loading more posts...
                </div>
              )}
              {/* Comments Modal */}
              {selectedPost && (
                <CommentsModal
                  post={selectedPost}
                  onClose={handleCloseComments}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
