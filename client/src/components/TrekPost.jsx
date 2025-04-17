"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowBigUp, ArrowBigDown, MessageSquare, MapPin, Calendar } from 'lucide-react';
import socialServices from "@/services/socialServices";

const TrekPost = ({ id, author, location, date, description, imageUrl, comments: initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
console.log(author)
  const handleVote = async (commentId, voteType) => {
    try {
      if (voteType === "up") {
        await socialServices.upvoteComment(commentId);
      } else {
        await socialServices.downvoteComment(commentId);
      }
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, votes: comment.votes + (voteType === "up" ? 1 : -1) }
            : comment
        )
      );
    } catch (error) {
      console.error(`Error ${voteType}voting comment:`, error.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const addedComment = await socialServices.addComment({
          post_id: id,
          text: newComment,
        });
        setComments([...comments, addedComment]);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error.response?.data?.message || "An error occurred");
      }
    }
  };

  return (
    <Card className="mb-6 overflow-hidden shadow-lg rounded-lg bg-white max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="border-2 border-white">
            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={author} />
            <AvatarFallback>{author ? author[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{author}</h3>
            <div className="flex items-center space-x-2 text-sm opacity-80">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
              <span>•</span>
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="mb-4 text-gray-700 text-lg">{description}</p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Trek image"
            className="w-full h-80 object-cover rounded-lg shadow-md mb-4"
          />
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col items-start bg-gray-50 pt-4">
        <h4 className="font-semibold mb-4 text-indigo-600 text-lg">Comments</h4>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 mb-4 w-full">
              <Avatar>
                <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={comment.author} />
                <AvatarFallback>{comment.author ? comment.author[0] : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-grow bg-white p-3 rounded-lg shadow">
                <p className="text-sm font-semibold text-gray-700">{comment.author}</p>
                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, "up")}
                    className="text-indigo-600 hover:text-indigo-800 p-0"
                  >
                    <ArrowBigUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold">{comment.votes}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, "down")}
                    className="text-gray-600 hover:text-gray-800 p-0"
                  >
                    <ArrowBigDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
        <form onSubmit={handleAddComment} className="flex items-center space-x-2 w-full mt-4">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow p-2 border rounded-md border-indigo-300 focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comment
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};


export default TrekPost;