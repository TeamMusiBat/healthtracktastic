
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from 'lucide-react';
import { BlogEditor } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
  },
  {
    id: '3',
    title: 'Maternal Health & Childbirth Safety',
    content: 'Maternal health encompasses the well-being of women during pregnancy, childbirth, and the postpartum period. Regular prenatal care is essential for detecting potential complications early and ensuring both mother and baby remain healthy. Healthcare providers should monitor vital signs, screen for common issues like gestational diabetes and preeclampsia, and provide nutritional guidance. Communities benefit from trained birth attendants and emergency transport systems for complicated deliveries. Postpartum care, including mental health support, is equally important for new mothers as they adjust to their changing bodies and new responsibilities.',
    author: 'Asif Jamali',
    date: '2023-07-10',
    image: 'https://images.unsplash.com/photo-1516832378525-cae96d32c952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '4',
    title: 'Water & Sanitation Practices',
    content: 'Access to clean water and proper sanitation facilities are fundamental determinants of community health. Waterborne diseases like cholera, dysentery, and typhoid remain prevalent in areas without safe water sources. Simple interventions such as handwashing stations, household water treatment methods, and proper waste disposal significantly reduce disease transmission. Community education on hygiene practices should be culturally appropriate and accessible to all age groups. Health workers can lead by example and work with local leaders to implement sustainable water and sanitation solutions that protect vulnerable populations, especially children under five.',
    author: 'Asif Jamali',
    date: '2023-08-05',
    image: 'https://images.unsplash.com/photo-1581093196277-9f695e9c0ef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '5',
    title: 'Preventing Childhood Diseases',
    content: 'Prevention is always better than cure, especially for childhood diseases. Beyond vaccinations, preventive strategies include good nutrition, regular physical activity, adequate sleep, and avoiding environmental hazards. Parents should be educated on recognizing early signs of common childhood illnesses and taught when to seek medical attention. Community health workers play a crucial role in surveillance, reporting disease outbreaks, and coordinating response efforts. School-based health programs can reach many children simultaneously and reinforce healthy habits that last a lifetime.',
    author: 'Asif Jamali',
    date: '2023-09-12',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80'
  }
];

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [showEditor, setShowEditor] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(4);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const { user, isAuthenticated } = useAuth();
  const isDeveloper = user?.role === 'developer';
  
  // Shuffle blogs on component mount to display random blogs
  useEffect(() => {
    const shuffled = [...initialBlogs].sort(() => 0.5 - Math.random());
    setBlogs(shuffled);
  }, []);
  
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
  
  const handleShowMore = () => {
    setDisplayLimit(blogs.length);
  };

  // Display all blogs when showAll is true, otherwise show limited blogs
  const visibleBlogs = blogs.slice(0, displayLimit);
  
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
        {visibleBlogs.map((blog) => (
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="mt-2 text-sm flex items-center gap-1"
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read More <ArrowRight size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  {selectedBlog && (
                    <>
                      {selectedBlog.image && (
                        <div className="relative h-64 w-full overflow-hidden rounded-t-lg mb-4">
                          <img 
                            src={selectedBlog.image} 
                            alt={selectedBlog.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold mb-2">{selectedBlog.title}</h2>
                      <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
                        <div>By {selectedBlog.author}</div>
                        <div>{formatDate(selectedBlog.date)}</div>
                      </div>
                      <div className="space-y-4">
                        {selectedBlog.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="text-foreground">{paragraph}</p>
                        ))}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
              <div>By {blog.author}</div>
              <div>{formatDate(blog.date)}</div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {displayLimit < blogs.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleShowMore} variant="outline" className="px-8">
            Show More Blogs
          </Button>
        </div>
      )}
      
      {blogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No blogs available.</p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
