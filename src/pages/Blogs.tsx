
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Sample blog data
const BLOGS = [
  {
    id: 1,
    title: "Understanding Child Nutrition",
    summary: "Learn about the importance of proper nutrition for children under five years old and how it affects their growth and development.",
    author: "Dr. Sarah Ahmed",
    date: "May 15, 2023",
    category: "Nutrition",
    content: `
      <p>Proper nutrition during the first five years of a child's life is crucial for healthy growth and development. Children need a variety of nutrients to support their rapid physical and mental development during these early years.</p>
      
      <h3>Key Nutrients for Children</h3>
      <ul>
        <li><strong>Protein:</strong> Essential for growth and repair of body tissues.</li>
        <li><strong>Calcium:</strong> Builds strong bones and teeth.</li>
        <li><strong>Iron:</strong> Prevents anemia and supports cognitive development.</li>
        <li><strong>Vitamin A:</strong> Important for vision, immune function, and skin health.</li>
        <li><strong>Zinc:</strong> Supports immune function and growth.</li>
      </ul>
      
      <p>Malnutrition in early childhood can lead to stunted growth, weakened immune systems, and cognitive delays. Regular screening using tools like Mid-Upper Arm Circumference (MUAC) measurements can help identify children at risk.</p>
    `,
  },
  {
    id: 2,
    title: "Importance of Childhood Vaccinations",
    summary: "Discover why vaccinations are essential for children's health and how they protect against serious diseases.",
    author: "Dr. Imran Khan",
    date: "June 2, 2023",
    category: "Immunization",
    content: `
      <p>Vaccinations are one of the most effective ways to protect children from serious diseases. They work by stimulating the immune system to recognize and fight specific pathogens without causing the disease itself.</p>
      
      <h3>Benefits of Vaccination</h3>
      <ul>
        <li>Prevents serious illnesses that can cause disability or death</li>
        <li>Protects others through herd immunity</li>
        <li>Saves time and money on medical treatments</li>
        <li>Protects future generations by reducing or eliminating diseases</li>
      </ul>
      
      <p>The standard vaccination schedule includes protection against polio, measles, mumps, rubella, diphtheria, tetanus, pertussis, and more. Following the recommended vaccination schedule is important for ensuring children receive the right protection at the right time.</p>
    `,
  },
  {
    id: 3,
    title: "Promoting Hygiene Awareness in Communities",
    summary: "Learn effective strategies for promoting hygiene practices in rural and urban communities.",
    author: "Fatima Zahra",
    date: "July 10, 2023",
    category: "Hygiene",
    content: `
      <p>Good hygiene practices are essential for preventing the spread of disease, especially in dense communities. Promoting these practices requires both education and access to necessary resources.</p>
      
      <h3>Key Hygiene Practices</h3>
      <ul>
        <li><strong>Handwashing:</strong> Proper handwashing with soap and water for at least 20 seconds.</li>
        <li><strong>Safe water:</strong> Access to clean drinking water and proper storage.</li>
        <li><strong>Sanitation:</strong> Proper disposal of waste and use of toilets.</li>
        <li><strong>Food safety:</strong> Proper food handling, cooking, and storage.</li>
      </ul>
      
      <p>Community awareness sessions can be effective in promoting these practices. Interactive demonstrations, role-playing, and involving community leaders can help reinforce the importance of hygiene practices.</p>
    `,
  },
];

const BlogPage: React.FC<{ id: number }> = ({ id }) => {
  const blog = BLOGS.find((b) => b.id === id);
  
  if (!blog) {
    return <div>Blog not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{blog.title}</h1>
        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
          <span>By {blog.author}</span>
          <span>•</span>
          <span>{blog.date}</span>
          <span>•</span>
          <span>{blog.category}</span>
        </div>
      </div>
      
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
};

const Blogs = () => {
  const [selectedBlog, setSelectedBlog] = useState<number | null>(null);
  
  if (selectedBlog) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedBlog(null)}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back to all blogs
        </button>
        
        <BlogPage id={selectedBlog} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Blogs</h1>
        <p className="text-gray-500">
          Read articles about health, nutrition, and hygiene awareness.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOGS.map((blog) => (
          <Card key={blog.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <FileText size={18} className="mt-1 text-blue-500" />
                <span>{blog.title}</span>
              </CardTitle>
              <CardDescription>{blog.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                  {blog.category}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="text-sm text-gray-500">
                {blog.date} • {blog.author}
              </div>
              <button
                onClick={() => setSelectedBlog(blog.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                Read more →
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
