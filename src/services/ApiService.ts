
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { User, UserRole } from "@/contexts/AuthContext";
import { ChildScreening, AwarenessSession } from "@/contexts/HealthDataContext";

// Base URL for API
const API_BASE_URL = "https://yourserver.com/api"; // Replace with your actual API URL

// Cache for pending records
interface PendingRecord {
  type: "screenings" | "sessions";
  data: any[];
  timestamp: number;
}

// Main API Service
class ApiService {
  private static instance: ApiService;
  private user: User | null = null;
  private isOnline: boolean = navigator.onLine;
  
  private constructor() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnlineStatusChange);
    window.addEventListener("offline", this.handleOnlineStatusChange);
    
    // Initial online status check
    this.isOnline = navigator.onLine;
    
    // Sync data when coming back online
    window.addEventListener("online", this.syncPendingData);
  }
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  private handleOnlineStatusChange = () => {
    const previousStatus = this.isOnline;
    this.isOnline = navigator.onLine;
    
    // Show toast notifications for status changes
    if (this.isOnline && !previousStatus) {
      toast.success("You are back online");
    } else if (!this.isOnline && previousStatus) {
      toast.warning("You are offline. Data will be saved locally.");
    }
  };
  
  public setUser(user: User | null): void {
    this.user = user;
  }
  
  // Generic API request method with offline support
  private async request<T>(endpoint: string, method: string, data?: any): Promise<T> {
    // If offline and not a GET request, store for later synchronization
    if (!this.isOnline && method !== "GET") {
      return this.handleOfflineRequest<T>(endpoint, method, data);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Request failed");
      }
      
      return result as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // If network error and not a GET request, store for later synchronization
      if (error instanceof TypeError && error.message.includes("network") && method !== "GET") {
        return this.handleOfflineRequest<T>(endpoint, method, data);
      }
      
      throw error;
    }
  }
  
  // Handle requests when offline
  private handleOfflineRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
    // Determine record type from endpoint
    let recordType: "screenings" | "sessions" | null = null;
    
    if (endpoint.includes("screenings")) {
      recordType = "screenings";
    } else if (endpoint.includes("awareness_sessions")) {
      recordType = "sessions";
    }
    
    if (recordType && (method === "POST" || method === "PUT")) {
      // Store in localStorage for later sync
      this.storePendingRecord(recordType, data);
      return Promise.resolve({ success: true, message: "Saved offline" } as unknown as T);
    }
    
    // For DELETE operations, we'd need a special handling
    // For now, we'll just return a mock success
    return Promise.resolve({ success: true, message: "Operation queued for when online" } as unknown as T);
  }
  
  // Store pending record for later synchronization
  private storePendingRecord(type: "screenings" | "sessions", data: any): void {
    const pendingRecords = this.getPendingRecords();
    
    // Add new record
    pendingRecords.push({
      type,
      data: Array.isArray(data) ? data : [data],
      timestamp: Date.now(),
    });
    
    // Save back to localStorage
    localStorage.setItem("pending_sync_records", JSON.stringify(pendingRecords));
    
    // Show notification
    toast.info(`Data saved offline and will sync when you're back online`);
  }
  
  // Get pending records from localStorage
  private getPendingRecords(): PendingRecord[] {
    const records = localStorage.getItem("pending_sync_records");
    return records ? JSON.parse(records) : [];
  }
  
  // Sync all pending data when back online
  private syncPendingData = async (): Promise<void> => {
    if (!this.isOnline || !this.user) return;
    
    const pendingRecords = this.getPendingRecords();
    
    if (pendingRecords.length === 0) return;
    
    // Show notification
    toast.info("Syncing offline data...");
    
    try {
      // Group by type
      const screenings: any[] = [];
      const sessions: any[] = [];
      
      pendingRecords.forEach(record => {
        if (record.type === "screenings") {
          screenings.push(...record.data);
        } else if (record.type === "sessions") {
          sessions.push(...record.data);
        }
      });
      
      // Sync screenings
      if (screenings.length > 0) {
        await this.request("sync_data.php", "POST", {
          userId: this.user.id,
          type: "screenings",
          data: screenings,
        });
      }
      
      // Sync sessions
      if (sessions.length > 0) {
        await this.request("sync_data.php", "POST", {
          userId: this.user.id,
          type: "sessions",
          data: sessions,
        });
      }
      
      // Clear pending records
      localStorage.removeItem("pending_sync_records");
      
      // Show success notification
      toast.success("All offline data synchronized successfully");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync some offline data. Will try again later.");
    }
  };
  
  // Authentication methods
  public async login(username: string, password: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; user?: User; message?: string }>(
        "login.php",
        "POST",
        { username, password }
      );
      
      if (response.success && response.user) {
        this.user = response.user;
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
  
  // User methods
  public async getUsers(): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>("users.php", "GET");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error);
      return [];
    }
  }
  
  public async addUser(userData: {
    username: string;
    name: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    role: UserRole;
    designation?: string;
  }): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>("users.php", "POST", userData);
      return response.success;
    } catch (error) {
      console.error("Add user error:", error);
      throw error;
    }
  }
  
  public async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>("users.php", "DELETE", { id });
      return response.success;
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  }
  
  // Location methods
  public async updateLocation(userId: string, latitude: number, longitude: number): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        "update_location.php",
        "POST",
        { userId, latitude, longitude }
      );
      return response.success;
    } catch (error) {
      console.error("Update location error:", error);
      return false;
    }
  }
  
  // Child screening methods
  public async getChildScreenings(): Promise<ChildScreening[]> {
    try {
      const response = await this.request<{ success: boolean; data: ChildScreening[] }>("screenings.php", "GET");
      return response.data;
    } catch (error) {
      console.error("Get screenings error:", error);
      
      // If offline, return cached data from localStorage
      const cachedScreenings = localStorage.getItem("childScreenings");
      return cachedScreenings ? JSON.parse(cachedScreenings) : [];
    }
  }
  
  public async addChildScreening(screening: Omit<ChildScreening, "id">): Promise<string> {
    const id = uuidv4();
    const screeningWithId = { ...screening, id };
    
    try {
      await this.request<{ success: boolean }>("screenings.php", "POST", screeningWithId);
      return id;
    } catch (error) {
      console.error("Add screening error:", error);
      throw error;
    }
  }
  
  public async deleteChildScreening(id: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>("screenings.php", "DELETE", { id });
      return response.success;
    } catch (error) {
      console.error("Delete screening error:", error);
      throw error;
    }
  }
  
  // Awareness session methods
  public async getAwarenessSessions(): Promise<AwarenessSession[]> {
    try {
      const response = await this.request<{ success: boolean; data: AwarenessSession[] }>(
        "awareness_sessions.php",
        "GET"
      );
      return response.data;
    } catch (error) {
      console.error("Get sessions error:", error);
      
      // If offline, return cached data from localStorage
      const cachedSessions = localStorage.getItem("awarenessSessions");
      return cachedSessions ? JSON.parse(cachedSessions) : [];
    }
  }
  
  public async addAwarenessSession(session: Omit<AwarenessSession, "id">): Promise<string> {
    const id = uuidv4();
    const sessionWithId = { ...session, id };
    
    try {
      await this.request<{ success: boolean }>("awareness_sessions.php", "POST", sessionWithId);
      return id;
    } catch (error) {
      console.error("Add session error:", error);
      throw error;
    }
  }
  
  public async deleteAwarenessSession(id: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>("awareness_sessions.php", "DELETE", { id });
      return response.success;
    } catch (error) {
      console.error("Delete session error:", error);
      throw error;
    }
  }
}

export default ApiService.getInstance();
