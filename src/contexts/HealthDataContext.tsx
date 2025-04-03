
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/ApiService';

// Define data structures
export type VaccineStatus = "0-Dose" | "1st-Dose" | "2nd-Dose" | "3rd-Dose" | "MR-1" | "MR-2" | "Completed" | "complete" | "partial" | "none";

export interface ChildData {
  id: string;
  name: string;
  age: number;
  muac: number;
  vaccineDue: boolean;
  vaccination: VaccineStatus;
  status: "SAM" | "MAM" | "Normal";
  fatherName: string;
  address?: string;
  dob?: string;
  gender: "male" | "female" | "other"; 
  remarks?: string;
  belongsToSameUC?: boolean;
  conductedBy?: string;
  designation?: string;
}

export interface ScreenedChild extends ChildData {
  // No need to redefine properties since they are already in ChildData
  // and gender is now required in ChildData
}

export interface Attendee {
  id: string;
  name: string;
  fatherHusbandName: string;
  age: number;
  gender: "male" | "female" | "other";
  underFiveChildren: number;
  contactNumber?: string;
  remarks?: string;
  address?: string;
  dob?: string;
  belongsToSameUC?: boolean;
  vaccination?: VaccineStatus;
  vaccineDue?: boolean;
  conductedBy?: string;
  designation?: string;
}

export interface ScreeningData {
  id: string;
  date: string;
  villageName: string;
  ucName: string;
  sessionNumber?: number;
  screeningNumber?: number;
  children: ChildData[];
  location?: { latitude: number; longitude: number };
  images?: string[];
  userName?: string;
  userDesignation?: string;
  createdBy?: string;
}

export interface ChildScreening extends ScreeningData {
  children: ScreenedChild[];
  screeningNumber?: number;
}

export interface AwarenessSession extends ScreeningData {
  attendees: Attendee[];
  sessionNumber?: number;
  children: ChildData[]; // Already in ScreeningData, but keeping for clarity
}

// Context type
interface HealthDataContextValue {
  awarenessSessions: AwarenessSession[];
  childScreenings: ChildScreening[];
  activeUsers: { id: string; name: string; role: string; location?: { latitude: number; longitude: number } }[];
  addAwarenessSession: (session: Omit<AwarenessSession, 'id'>) => void;
  addChildScreening: (session: Omit<ChildScreening, 'id'>) => void;
  updateAwarenessSession: (id: string, updatedSession: Omit<AwarenessSession, 'id' | 'children' | 'attendees'>) => void;
  updateChildScreening: (id: string, updatedSession: Omit<ChildScreening, 'id' | 'children'>) => void;
  deleteAwarenessSession: (id: string) => void;
  deleteChildScreening: (id: string) => void;
  addChildToSession: (sessionId: string, child: Omit<ChildData, 'id'>, isAwarenessSession: boolean, address?: string) => void;
  updateChildInSession: (sessionId: string, childId: string, updatedChild: ChildData, isAwarenessSession: boolean) => void;
  deleteChildFromSession: (sessionId: string, childId: string, isAwarenessSession: boolean) => void;
  getChildScreeningsByDateRange: (startDate: string, endDate: string) => ChildScreening[];
  getChildScreeningsByStatus: (status: "SAM" | "MAM" | "Normal") => ChildScreening[];
  checkDuplicateChild: (name: string, fatherName: string, villageName: string, date: string) => boolean;
  getAwarenessSessionsByDateRange: (startDate: string, endDate: string) => AwarenessSession[];
  checkDuplicateAttendee: (name: string, fatherName: string, villageName: string, date: string) => boolean;
}

// Create the context with a default value
const HealthDataContext = createContext<HealthDataContextValue | undefined>(undefined);

// Provider Component
export const HealthDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [awarenessSessions, setAwarenessSessions] = useState<AwarenessSession[]>(() => {
    const storedSessions = localStorage.getItem('awarenessSessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  });

  const [childScreenings, setChildScreenings] = useState<ChildScreening[]>(() => {
    const storedScreenings = localStorage.getItem('childScreenings');
    return storedScreenings ? JSON.parse(storedScreenings) : [];
  });

  const [activeUsers, setActiveUsers] = useState([
    { id: '1', name: 'Asif Jamali', role: 'Developer', location: { latitude: 24.8607, longitude: 67.0011 } },
    { id: '2', name: 'Field Worker 1', role: 'Field Monitor', location: { latitude: 24.8507, longitude: 67.0111 } },
  ]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online. Syncing data...");
      fetchData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Data will be saved locally.");
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch data from API on initial load and when user changes
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch data from API if online
      if (isOnline) {
        const [fetchedScreenings, fetchedSessions] = await Promise.all([
          ApiService.getChildScreenings(),
          ApiService.getAwarenessSessions()
        ]);
        
        setChildScreenings(fetchedScreenings);
        setAwarenessSessions(fetchedSessions);
        
        // Update localStorage with fetched data
        localStorage.setItem('childScreenings', JSON.stringify(fetchedScreenings));
        localStorage.setItem('awarenessSessions', JSON.stringify(fetchedSessions));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data from server. Using cached data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('awarenessSessions', JSON.stringify(awarenessSessions));
  }, [awarenessSessions]);

  useEffect(() => {
    localStorage.setItem('childScreenings', JSON.stringify(childScreenings));
  }, [childScreenings]);

  // Add a new awareness session
  const addAwarenessSession = async (session: Omit<AwarenessSession, 'id'>) => {
    // Add user info to session
    const sessionWithUser = {
      ...session,
      userName: user?.username,
      userDesignation: user?.designation,
      createdBy: user?.username
    };
    
    try {
      if (isOnline) {
        // Add to server
        const id = await ApiService.addAwarenessSession(sessionWithUser);
        
        // Add to local state with returned ID
        const newSession: AwarenessSession = {
          id,
          ...sessionWithUser,
          attendees: sessionWithUser.attendees || [],
          children: sessionWithUser.children || [],
        };
        
        setAwarenessSessions([...awarenessSessions, newSession]);
        toast.success("Session saved successfully");
      } else {
        // If offline, generate UUID and save locally
        const id = uuidv4();
        const newSession: AwarenessSession = {
          id,
          ...sessionWithUser,
          attendees: sessionWithUser.attendees || [],
          children: sessionWithUser.children || [],
        };
        
        setAwarenessSessions([...awarenessSessions, newSession]);
        toast.success("Session saved locally. Will sync when online.");
      }
    } catch (error) {
      console.error("Error adding awareness session:", error);
      toast.error("Failed to save session. Please try again.");
      
      // Fallback to local save
      const id = uuidv4();
      const newSession: AwarenessSession = {
        id,
        ...sessionWithUser,
        attendees: sessionWithUser.attendees || [],
        children: sessionWithUser.children || [],
      };
      
      setAwarenessSessions([...awarenessSessions, newSession]);
      toast.warning("Saved locally due to error. Will try to sync later.");
    }
  };

  // Add a new child screening session
  const addChildScreening = async (session: Omit<ChildScreening, 'id'>) => {
    // Add user info to session
    const sessionWithUser = {
      ...session,
      userName: user?.username,
      userDesignation: user?.designation,
      createdBy: user?.username
    };
    
    try {
      if (isOnline) {
        // Add to server
        const id = await ApiService.addChildScreening(sessionWithUser);
        
        // Add to local state with returned ID
        const newSession: ChildScreening = {
          id,
          ...sessionWithUser,
          children: sessionWithUser.children || [],
        };
        
        setChildScreenings([...childScreenings, newSession]);
        toast.success("Screening saved successfully");
      } else {
        // If offline, generate UUID and save locally
        const id = uuidv4();
        const newSession: ChildScreening = {
          id,
          ...sessionWithUser,
          children: sessionWithUser.children || [],
        };
        
        setChildScreenings([...childScreenings, newSession]);
        toast.success("Screening saved locally. Will sync when online.");
      }
    } catch (error) {
      console.error("Error adding child screening:", error);
      toast.error("Failed to save screening. Please try again.");
      
      // Fallback to local save
      const id = uuidv4();
      const newSession: ChildScreening = {
        id,
        ...sessionWithUser,
        children: sessionWithUser.children || [],
      };
      
      setChildScreenings([...childScreenings, newSession]);
      toast.warning("Saved locally due to error. Will try to sync later.");
    }
  };

  // Update an existing awareness session
  const updateAwarenessSession = (id: string, updatedSession: Omit<AwarenessSession, 'id' | 'children' | 'attendees'>) => {
    setAwarenessSessions(
      awarenessSessions.map((session) =>
        session.id === id ? { ...session, ...updatedSession } : session
      )
    );
  };

  // Update an existing child screening session
  const updateChildScreening = (id: string, updatedSession: Omit<ChildScreening, 'id' | 'children'>) => {
    setChildScreenings(
      childScreenings.map((session) =>
        session.id === id ? { ...session, ...updatedSession } : session
      )
    );
  };

  // Delete an awareness session
  const deleteAwarenessSession = async (id: string) => {
    try {
      if (isOnline) {
        await ApiService.deleteAwarenessSession(id);
        setAwarenessSessions(awarenessSessions.filter((session) => session.id !== id));
        toast.success("Session deleted successfully");
      } else {
        // If offline, mark for deletion later and remove from local state
        // This would need a more complex sync mechanism
        setAwarenessSessions(awarenessSessions.filter((session) => session.id !== id));
        toast.warning("Session deleted locally. Server will be updated when online.");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session. Please try again.");
    }
  };

  // Delete a child screening session
  const deleteChildScreening = async (id: string) => {
    try {
      if (isOnline) {
        await ApiService.deleteChildScreening(id);
        setChildScreenings(childScreenings.filter((session) => session.id !== id));
        toast.success("Screening deleted successfully");
      } else {
        // If offline, mark for deletion later and remove from local state
        // This would need a more complex sync mechanism
        setChildScreenings(childScreenings.filter((session) => session.id !== id));
        toast.warning("Screening deleted locally. Server will be updated when online.");
      }
    } catch (error) {
      console.error("Error deleting screening:", error);
      toast.error("Failed to delete screening. Please try again.");
    }
  };

  // Add a child to a session
  const addChildToSession = (sessionId: string, child: Omit<ChildData, 'id'>, isAwarenessSession: boolean, address?: string) => {
    const newChild: ChildData = {
      id: uuidv4(),
      ...child,
      address: address || '',
    };

    if (isAwarenessSession) {
      setAwarenessSessions(
        awarenessSessions.map((session) =>
          session.id === sessionId ? { ...session, children: [...session.children, newChild] } : session
        )
      );
    } else {
      setChildScreenings(
        childScreenings.map((session) =>
          session.id === sessionId ? { ...session, children: [...session.children, newChild as ScreenedChild] } : session
        )
      );
    }
  };

  // Update a child in a session
  const updateChildInSession = (sessionId: string, childId: string, updatedChild: ChildData, isAwarenessSession: boolean) => {
    if (isAwarenessSession) {
      setAwarenessSessions(
        awarenessSessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              children: session.children.map((child) =>
                child.id === childId ? updatedChild : child
              ),
            };
          }
          return session;
        })
      );
    } else {
      setChildScreenings(
        childScreenings.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              children: session.children.map((child) =>
                child.id === childId ? updatedChild as ScreenedChild : child
              ),
            };
          }
          return session;
        })
      );
    }
  };

  // Delete a child from a session
  const deleteChildFromSession = (sessionId: string, childId: string, isAwarenessSession: boolean) => {
    if (isAwarenessSession) {
      setAwarenessSessions(
        awarenessSessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              children: session.children.filter((child) => child.id !== childId),
            };
          }
          return session;
        })
      );
    } else {
      setChildScreenings(
        childScreenings.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              children: session.children.filter((child) => child.id !== childId),
            };
          }
          return session;
        })
      );
    }
  };

  // Get child screenings by date range
  const getChildScreeningsByDateRange = (startDate: string, endDate: string) => {
    return childScreenings.filter(
      (screening) => screening.date >= startDate && screening.date <= endDate
    );
  };

  // Get child screenings by status
  const getChildScreeningsByStatus = (status: "SAM" | "MAM" | "Normal") => {
    return childScreenings.map(screening => {
      return {
        ...screening,
        children: screening.children.filter(child => child.status === status)
      };
    }).filter(screening => screening.children.length > 0);
  };

  // Check for duplicate child
  const checkDuplicateChild = (name: string, fatherName: string, villageName: string, date: string) => {
    const screening = childScreenings.find(s => s.date === date && s.villageName === villageName);
    if (!screening) return false;
    
    return screening.children.some(
      c => c.name.toLowerCase() === name.toLowerCase() && 
           c.fatherName.toLowerCase() === fatherName.toLowerCase()
    );
  };

  // Get awareness sessions by date range
  const getAwarenessSessionsByDateRange = (startDate: string, endDate: string) => {
    return awarenessSessions.filter(
      (session) => session.date >= startDate && session.date <= endDate
    );
  };

  // Check for duplicate attendee
  const checkDuplicateAttendee = (name: string, fatherName: string, villageName: string, date: string) => {
    const session = awarenessSessions.find(s => s.date === date && s.villageName === villageName);
    if (!session) return false;
    
    return session.attendees.some(
      a => a.name.toLowerCase() === name.toLowerCase() && 
           a.fatherHusbandName.toLowerCase() === fatherName.toLowerCase()
    );
  };

  // Create value object for provider
  const value: HealthDataContextValue = {
    awarenessSessions,
    childScreenings,
    activeUsers,
    addAwarenessSession,
    addChildScreening,
    updateAwarenessSession,
    updateChildScreening,
    deleteAwarenessSession,
    deleteChildScreening,
    addChildToSession,
    updateChildInSession,
    deleteChildFromSession,
    getChildScreeningsByDateRange,
    getChildScreeningsByStatus,
    checkDuplicateChild,
    getAwarenessSessionsByDateRange,
    checkDuplicateAttendee,
  };

  // If loading, show loading indicator
  if (isLoading && user) {
    return <div className="flex items-center justify-center h-screen">Loading health data...</div>;
  }

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

// Custom hook to use the context
export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
