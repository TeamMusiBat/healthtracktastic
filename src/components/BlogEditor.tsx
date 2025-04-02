
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CamelCaseInput from "./CamelCaseInput";
import { ImageUploader } from "@/components";

interface BlogEditorProps {
  onSave: (blog: {
    title: string;
    content: string;
    author: string;
    image?: string;
    date: string;
  }) => void;
  onCancel: () => void;
}

const BlogEditor = ({ onSave, onCancel }: BlogEditorProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }
    
    // Create new blog
    const newBlog = {
      title,
      content,
      author: user?.name || "Asif Jamali",
      image: images[0] || undefined,
      date: new Date().toISOString(),
    };
    
    onSave(newBlog);
    toast.success("Blog created successfully");
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h2 className="text-xl font-bold">Create New Blog</h2>
      
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
          Publish Blog
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
