// src/services/ApiService.ts
import { User, UserRole } from "@/contexts/AuthContext";
import { AwarenessSession, ChildScreening } from "@/contexts/HealthDataContext";
import { toast } from "sonner";

class ApiService {
  // Base API URL - Updated to use your domain
  private apiBaseUrl = "https://healthbyasif.buylevi.xyz/api";
  private currentUser: User | null = null;
  
  // Method to set the current user
  setUser(user: User | null): void {
    this.currentUser = user;
  }
  
  // Method to handle API requests with improved error handling
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      // Check network status
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }
      
      const response = await fetch(`${this.apiBaseUrl}/${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      
      // Handle empty responses gracefully
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      try {
        const data = JSON.parse(text);
        if (!data.success) {
          throw new Error(data.message || "API request failed");
        }
        return data;
      } catch (parseError) {
        console.error("Failed to parse JSON:", text);
        throw new Error(`Failed to parse server response: ${(parseError as Error).message}`);
      }
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      throw error;
    }
  }
  
  // User related API methods
  async getUsers(): Promise<User[]> {
    try {
      const result = await this.request<{ success: boolean; data: User[] }>("users.php");
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  }
  
  async addUser(userData: {
    username: string;
    name: string;
    password: string;
    role: UserRole;
    email?: string;
    phoneNumber?: string;
    designation?: string;
  }): Promise<boolean> {
    try {
      await this.request("users.php", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return true;
    } catch (error) {
      console.error("Add user error:", error);
      return false;
    }
  }
  
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.request("users.php", {
        method: "DELETE",
        body: JSON.stringify({ id: userId }),
      });
      return true;
    } catch (error) {
      console.error("Delete user error:", error);
      return false;
    }
  }
  
  async login(username: string, password: string): Promise<User | null> {
    try {
      const result = await this.request<{ success: boolean; user: User }>("login.php", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      return result.user || null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }
  
  async updateLocation(userId: string, latitude: number, longitude: number): Promise<boolean> {
    try {
      await this.request("update_location.php", {
        method: "POST",
        body: JSON.stringify({ userId, latitude, longitude }),
      });
      return true;
    } catch (error) {
      console.error("Update location error:", error);
      return false;
    }
  }
  
  // Health data API methods
  async syncData(userId: string, data: {
    sessions?: AwarenessSession[];
    screenings?: ChildScreening[];
  }): Promise<boolean> {
    try {
      await this.request("sync_data.php", {
        method: "POST",
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });
      return true;
    } catch (error) {
      console.error("Sync data error:", error);
      return false;
    }
  }
  
  async getAwarenessSessions(): Promise<AwarenessSession[]> {
    try {
      const result = await this.request<{ success: boolean; data: AwarenessSession[] }>("awareness_sessions.php");
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch awareness sessions:", error);
      return [];
    }
  }
  
  async addAwarenessSession(session: Omit<AwarenessSession, 'id'>): Promise<string> {
    try {
      const result = await this.request<{ success: boolean; id: string }>("awareness_sessions.php", {
        method: "POST",
        body: JSON.stringify(session),
      });
      return result.id;
    } catch (error) {
      console.error("Failed to add awareness session:", error);
      throw error;
    }
  }
  
  async deleteAwarenessSession(id: string): Promise<boolean> {
    try {
      await this.request("awareness_sessions.php", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      return true;
    } catch (error) {
      console.error("Failed to delete awareness session:", error);
      return false;
    }
  }
  
  async getChildScreenings(): Promise<ChildScreening[]> {
    try {
      const result = await this.request<{ success: boolean; data: ChildScreening[] }>("screenings.php");
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch child screenings:", error);
      return [];
    }
  }
  
  async addChildScreening(screening: Omit<ChildScreening, 'id'>): Promise<string> {
    try {
      const result = await this.request<{ success: boolean; id: string }>("screenings.php", {
        method: "POST",
        body: JSON.stringify(screening),
      });
      return result.id;
    } catch (error) {
      console.error("Failed to add child screening:", error);
      throw error;
    }
  }
  
  async deleteChildScreening(id: string): Promise<boolean> {
    try {
      await this.request("screenings.php", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      return true;
    } catch (error) {
      console.error("Failed to delete child screening:", error);
      return false;
    }
  }
  
  // Updated method to check server connectivity with better error handling
  async checkServerConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/db_config.php`, { 
        method: "HEAD",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      return response.ok;
    } catch (error) {
      console.error("Server connectivity check failed:", error);
      return false;
    }
  }
}

// Export as singleton
export default new ApiService();
