import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from 'lucide-react';
import socialServices from "@/services/socialServices";

const NewTrekPostForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data) => {
    try {
      const { description, location } = data;
      await socialServices.addPost({ profilePicture: images, text: description, location });
      reset();
      setImages([]);
      console.log("Post added successfully");
    } catch (error) {
      console.error("Error adding post:", error.message);
    }
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">John Doe</p>
            </div>
          </div>

          <Textarea
            {...register("description", { required: true })}
            placeholder="Share your trek experience..."
            className="w-full min-h-[100px] border-none focus:ring-0 text-lg resize-none"
          />

          <input
            {...register("location", { required: true })}
            placeholder="Enter location"
            className="w-full border-none focus:ring-0 text-lg resize-none"
          />

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Uploaded preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex space-x-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Image className="w-6 h-6 text-[#1877F2]" />
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-1 rounded-md"
            >
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTrekPostForm;