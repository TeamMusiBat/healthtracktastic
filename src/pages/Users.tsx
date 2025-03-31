
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Search, Trash2, Eye, EyeOff, UserCircle, MapPin } from "lucide-react";
import { useAuth, User, UserRole } from "@/contexts/AuthContext";
import CamelCaseInput from "@/components/CamelCaseInput";

// Mock users with only developer user
const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "asifjamali83",
    name: "Asif Jamali",
    role: "developer",
    isOnline: true,
  }
];

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "" as UserRole,
  });
  
  // Handle showing developer account based on role
  const filteredUsers = users.filter((u) => {
    // Only developer can see developer accounts
    if (u.role === "developer" && user?.role !== "developer") {
      return false;
    }
    
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleAddUser = () => {
    // Validate form
    if (!newUser.username || !newUser.name || !newUser.password || !newUser.role) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Check if username already exists
    if (users.some((u) => u.username === newUser.username)) {
      toast.error("Username already exists");
      return;
    }
    
    // Add new user
    const newUserObj: User = {
      id: (users.length + 1).toString(),
      username: newUser.username,
      name: newUser.name,
      email: newUser.email || undefined,
      phoneNumber: newUser.phoneNumber || undefined,
      role: newUser.role,
      isOnline: false,
    };
    
    setUsers([...users, newUserObj]);
    
    // Reset form
    setNewUser({
      username: "",
      name: "",
      password: "",
      email: "",
      phoneNumber: "",
      role: "" as UserRole,
    });
    
    toast.success("User added successfully");
  };
  
  const handleDeleteUser = (userId: string) => {
    // Prevent deleting your own account
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    
    // Developer can delete any user, master can only delete fmt/sm users
    if (user?.role === "master") {
      const userToDelete = users.find((u) => u.id === userId);
      if (userToDelete && (userToDelete.role === "developer" || userToDelete.role === "master")) {
        toast.error("You don't have permission to delete this user");
        return;
      }
    }
    
    // Delete user
    setUsers(users.filter((u) => u.id !== userId));
    toast.success("User deleted successfully");
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const getLocationLink = (user: User) => {
    if (user.location) {
      return `https://www.google.com/maps?q=${user.location.latitude},${user.location.longitude}`;
    }
    return "#";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <CamelCaseInput
                  id="name"
                  defaultValue={newUser.name}
                  onValueChange={(value) => setNewUser({ ...newUser, name: value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                <Input
                  id="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                  value={newUser.role}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === "developer" && (
                      <SelectItem value="developer">Developer (Full Access)</SelectItem>
                    )}
                    {(user?.role === "developer" || user?.role === "master") && (
                      <SelectItem value="master">Master (User Management)</SelectItem>
                    )}
                    <SelectItem value="fmt">FMT (Field Worker)</SelectItem>
                    <SelectItem value="socialMobilizer">Social Mobilizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <UserCircle size={24} className="text-gray-400" />
                  <div>
                    <CardTitle className="text-base">{u.name}</CardTitle>
                    <CardDescription className="text-xs">@{u.username}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center">
                  {(user?.role === "developer" || (user?.role === "master" && (u.role === "fmt" || u.role === "socialMobilizer"))) && u.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Role</div>
                <div className="font-medium">
                  {u.role === "developer" && "Developer"}
                  {u.role === "master" && "Master"}
                  {u.role === "fmt" && "FMT"}
                  {u.role === "socialMobilizer" && "Social Mobilizer"}
                </div>
                
                {u.email && (
                  <>
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium">{u.email}</div>
                  </>
                )}
                
                {u.phoneNumber && (
                  <>
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium">{u.phoneNumber}</div>
                  </>
                )}
                
                <div className="text-gray-500">Status</div>
                <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      u.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <span>{u.isOnline ? "Online" : "Offline"}</span>
                </div>
                
                {u.isOnline && u.location && (
                  <div className="col-span-2 mt-2">
                    <a 
                      href={getLocationLink(u)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <MapPin size={14} />
                      <span>Track Location</span>
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Users;
