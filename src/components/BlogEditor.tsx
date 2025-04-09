
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CamelCaseInput from "./CamelCaseInput";
import { ImageUploader } from "@/components";

interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  date: string;
}

interface BlogEditorProps {
  onSave: (blog: {
    title: string;
    content: string;
    author: string;
    image?: string;
    date: string;
  }) => void;
  onCancel: () => void;
  blogToEdit?: Blog | null;
}

const BlogEditor = ({ onSave, onCancel, blogToEdit }: BlogEditorProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // If editing a blog, populate form with blog data
  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title);
      setContent(blogToEdit.content);
      if (blogToEdit.image) {
        setImages([blogToEdit.image]);
      }
    }
  }, [blogToEdit]);
  
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }
    
    // Create new blog or update existing
    const blogData = {
      title,
      content,
      author: user?.name || "Anonymous User",
      image: images[0] || undefined,
      date: blogToEdit ? blogToEdit.date : new Date().toISOString(),
    };
    
    onSave(blogData);
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-white mt-4">
      <h2 className="text-xl font-bold">{blogToEdit ? "Edit Blog" : "Create New Blog"}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <CamelCaseInput
          id="title"
          defaultValue={title}
          onValueChange={setTitle}
          placeholder="Enter blog title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter blog content"
          className="min-h-[200px]"
        />
      </div>
      
      <div className="space-y-2">
        <ImageUploader 
          onImagesChange={setImages} 
          initialImages={images}
          sessionNumber="blog"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {blogToEdit ? "Update Blog" : "Publish Blog"}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
