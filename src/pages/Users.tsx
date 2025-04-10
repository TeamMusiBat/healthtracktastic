import React, { useState, useEffect } from "react";
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
import ApiService from "@/services/ApiService";
import { Button3d } from "@/components/ui/button-3d";

const Users = () => {
  const { user, canAddMasters, canAddUsers, canEditUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "" as UserRole,
    designation: "",
  });
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        if (navigator.onLine) {
          const fetchedUsers = await ApiService.getUsers();
          console.log("Fetched users:", fetchedUsers);
          setUsers(fetchedUsers);
          
          // Cache users for offline mode
          localStorage.setItem("cached_users", JSON.stringify(fetchedUsers));
        } else {
          toast.warning("You are offline. User data may not be up to date.");
          // Try to use cached data if available
          const cachedUsers = localStorage.getItem("cached_users");
          if (cachedUsers) {
            setUsers(JSON.parse(cachedUsers));
          }
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    // Only developer can see developer accounts
    if (u.role === "developer" && user?.role !== "developer") {
      return false;
    }
    
    return u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleAddUser = async () => {
    // Validate form
    if (!newUser.username || !newUser.name || !newUser.password || !newUser.role) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Check permissions for adding master role
    if (newUser.role === "master" && !canAddMasters) {
      toast.error("You don't have permission to add a Master user");
      return;
    }
    
    // Set default designation based on role if not provided
    let designation = newUser.designation;
    if (!designation) {
      switch (newUser.role) {
        case "master": designation = "Master"; break;
        case "fmt": designation = "Field Monitoring Team"; break;
        case "socialMobilizer": designation = "Social Mobilizer"; break;
        default: designation = newUser.role;
      }
    }
    
    // Update new user data
    const userData = {
      ...newUser,
      designation
    };
    
    try {
      // Check if online
      if (!navigator.onLine) {
        toast.error("You are offline. Cannot add users while offline.");
        return;
      }
      
      setIsSubmitting(true);
      
      // Add user via API
      const success = await ApiService.addUser(userData);
      
      if (success) {
        // Refresh user list
        const updatedUsers = await ApiService.getUsers();
        setUsers(updatedUsers);
        
        // Update cache
        localStorage.setItem("cached_users", JSON.stringify(updatedUsers));
        
        // Reset form
        setNewUser({
          username: "",
          name: "",
          password: "",
          email: "",
          phoneNumber: "",
          role: "" as UserRole,
          designation: "",
        });
        
        // Close dialog
        setIsAddUserDialogOpen(false);
        
        toast.success("User added successfully");
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error(`Failed to add user: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
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
    
    try {
      // Check if online
      if (!navigator.onLine) {
        toast.error("You are offline. Cannot delete users while offline.");
        return;
      }
      
      // Delete user via API
      const success = await ApiService.deleteUser(userId);
      
      if (success) {
        // Update local state
        const updatedUsers = users.filter((u) => u.id !== userId);
        setUsers(updatedUsers);
        
        // Update cache
        localStorage.setItem("cached_users", JSON.stringify(updatedUsers));
        
        toast.success("User deleted successfully");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("Failed to delete user. Please try again.");
    }
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
  
  if (!canAddUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to access the User Management page.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button3d variant="3d" className="flex items-center gap-2 bg-green-600 text-white border-b-4 border-green-800 hover:bg-green-700">
              <Plus size={16} />
              <span>Add User</span>
            </Button3d>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New User</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new user account with appropriate role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                  className="bg-background text-foreground border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <CamelCaseInput
                  id="name"
                  defaultValue={newUser.name}
                  onValueChange={(value) => setNewUser({ ...newUser, name: value })}
                  placeholder="Enter full name"
                  className="bg-background text-foreground border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="designation" className="text-foreground">Designation</Label>
                <CamelCaseInput
                  id="designation"
                  defaultValue={newUser.designation}
                  onValueChange={(value) => setNewUser({ ...newUser, designation: value })}
                  placeholder="Enter designation"
                  className="bg-background text-foreground border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  className="bg-background text-foreground border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="text-foreground">Phone Number (optional)</Label>
                <Input
                  id="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                  className="bg-background text-foreground border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    className="bg-background text-foreground border-border"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-foreground">Role</Label>
                <Select
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                  value={newUser.role}
                >
                  <SelectTrigger id="role" className="bg-white text-foreground border-border">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-foreground border-border">
                    {canAddMasters && (
                      <SelectItem value="master">Master (User Management)</SelectItem>
                    )}
                    <SelectItem value="fmt">FMT (Field Worker)</SelectItem>
                    <SelectItem value="socialMobilizer">Social Mobilizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button3d 
                onClick={handleAddUser}
                disabled={isSubmitting}
                variant="3d" 
                className="bg-green-600 text-white border-b-4 border-green-800 hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </Button3d>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Network status warning */}
      {!navigator.onLine && (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded mb-4 shadow">
          <div className="flex">
            <div className="py-1 mr-2">⚠️</div>
            <div>
              <p className="font-medium">You are offline</p>
              <p className="text-sm">User management features are limited while offline.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Search bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search users..."
          className="pl-10 bg-white text-foreground border-border shadow-inner w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Users grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <Card key={u.id || u.username} className="bg-white border-border shadow hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 bg-white text-foreground">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <UserCircle size={36} className="text-primary" />
                    <div>
                      <CardTitle className="text-base text-foreground">{u.name || 'Unnamed'}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">@{u.username}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {canEditUsers && u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-white text-foreground">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground font-medium">Role</div>
                  <div className="font-medium text-foreground">
                    {u.role === "developer" && "Developer"}
                    {u.role === "master" && "Master"}
                    {u.role === "fmt" && "FMT"}
                    {u.role === "socialMobilizer" && "Social Mobilizer"}
                  </div>
                  
                  <div className="text-muted-foreground font-medium">Designation</div>
                  <div className="font-medium text-foreground">{u.designation || u.role || 'Not specified'}</div>
                  
                  {u.email && (
                    <>
                      <div className="text-muted-foreground font-medium">Email</div>
                      <div className="font-medium text-foreground">{u.email}</div>
                    </>
                  )}
                  
                  {u.phoneNumber && (
                    <>
                      <div className="text-muted-foreground font-medium">Phone</div>
                      <div className="font-medium text-foreground">{u.phoneNumber}</div>
                    </>
                  )}
                  
                  <div className="text-muted-foreground font-medium">Status</div>
                  <div className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        u.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <span className="text-foreground">{u.isOnline ? "Online" : "Offline"}</span>
                  </div>
                  
                  {u.isOnline && u.location && (
                    <div className="col-span-2 mt-2">
                      <a 
                        href={getLocationLink(u)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
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
      ) : (
        <div className="flex justify-center items-center h-60 bg-white/50 border border-border rounded-lg shadow-inner">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Users;
