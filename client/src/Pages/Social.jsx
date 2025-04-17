import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import NewTrekPostForm from "@/components/TrekForm";
import TrekPost from "@/components/TrekPost";
import socialServices from "@/services/socialServices";
import { useSelector } from "react-redux";

const Social = () => {
  const [trekPosts, setTrekPosts] = useState([]);
  const currentUserId = useSelector((state) => state.auth.userData._id);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await socialServices.getAllPosts();
        setTrekPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  const handleAddPost = async (newPost) => {
    try {
      const addedPost = await socialServices.addPost(newPost);
      setTrekPosts([addedPost, ...trekPosts]);
    } catch (error) {
      console.error("Error adding post:", error.message);
    }
  };

  const handleDeletePost = (postId) => {
    setTrekPosts(trekPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center text-[#6366F1] mb-10">Trek Social</h1>

      <div className="mb-12">
        <NewTrekPostForm onAddPost={handleAddPost} />
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-[#6366F1] mb-8">Recent Treks</h2>
        {trekPosts.map((post) => (
          <div key={post._id} className="mb-8">
            <TrekPost
              id={post._id}
              author={post.user.fullName}
              location={post.location}
              date={new Date(post.created_at).toLocaleDateString()}
              description={post.text}
              imageUrl={post.userProfile?.profilePicture.url}
              comments={post.comments} // Ensure this field is passed correctly
              onDeletePost={handleDeletePost}
              currentUserId={currentUserId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Social;
