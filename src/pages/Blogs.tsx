
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { BlogEditor } from '@/components';
import { useAuth } from '@/contexts/AuthContext';

interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  image?: string;
}

// Initial blogs
const initialBlogs: Blog[] = [
  {
    id: '1',
    title: 'The Importance of Child Nutrition',
    content: 'Proper nutrition in early childhood is crucial for cognitive and physical development. For children under 5, adequate protein, vitamins, and minerals establish foundations for lifelong health. Regular nutritional assessment helps identify deficiencies early and enables targeted interventions. Parents and caregivers should focus on diverse diets rich in fruits, vegetables, proteins, and whole grains while limiting processed foods and sugary drinks. Community health workers play a vital role in educating families and monitoring growth patterns.',
    author: 'Asif Jamali',
    date: '2023-05-15',
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80'
  },
  {
    id: '2',
    title: 'Vaccination: Protecting Communities',
    content: 'Vaccinations are one of the most effective public health interventions, preventing millions of deaths annually. They work by stimulating the immune system to recognize and fight specific pathogens. Community immunity (herd immunity) occurs when a significant portion of a population becomes immune, reducing disease spread. Following recommended vaccination schedules is crucial for children\'s health and community protection. Healthcare providers must address vaccine hesitancy through education and trust-building. Together, we can prevent the resurgence of deadly diseases through comprehensive vaccination programs.',
    author: 'Asif Jamali',
    date: '2023-06-20',
    image: 'https://images.unsplash.com/photo-1576765608866-5b51f5501212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2533&q=80'
  }
];

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [showEditor, setShowEditor] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const isDeveloper = user?.role === 'developer';
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleSaveBlog = (blog: Omit<Blog, 'id'>) => {
    const newBlog: Blog = {
      ...blog,
      id: Date.now().toString()
    };
    
    setBlogs([newBlog, ...blogs]);
    setShowEditor(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Health & Nutrition Blogs</h1>
        
        {isDeveloper && (
          <Button 
            onClick={() => setShowEditor(!showEditor)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>{showEditor ? 'Cancel' : 'Add Blog'}</span>
          </Button>
        )}
      </div>
      
      {showEditor && (
        <BlogEditor 
          onSave={handleSaveBlog}
          onCancel={() => setShowEditor(false)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="h-full flex flex-col">
            {blog.image && (
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{blog.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 mb-4">
                {blog.content.length > 300 
                  ? `${blog.content.substring(0, 300)}...` 
                  : blog.content}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
              <div>By {blog.author}</div>
              <div>{formatDate(blog.date)}</div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {blogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No blogs available.</p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
