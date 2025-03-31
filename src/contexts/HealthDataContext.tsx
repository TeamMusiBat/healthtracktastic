
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "./AuthContext";

// Define interfaces for our data
export interface AwarenessSession {
  id: string;
  date: string;
  villageName: string;
  ucName: string;
  userName: string;
  userDesignation: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  attendees: Attendee[];
  createdBy: string;
  createdAt: Date;
}

export interface Attendee {
  id: string;
  name: string;
  fatherHusbandName: string;
  age: number;
  dob?: string;
  gender: "male" | "female" | "other";
  underFiveChildren: number;
  contactNumber?: string;
  remarks?: string;
  images?: string[];
}

export type VaccineStatus = "0-Dose" | "1st-Dose" | "2nd-Dose" | "3rd-Dose" | "MR-1" | "MR-2";

export interface ChildScreening {
  id: string;
  date: string;
  villageName: string;
  ucName: string;
  userName: string;
  userDesignation: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  children: ScreenedChild[];
  createdBy: string;
  createdAt: Date;
}

export interface ScreenedChild {
  id: string;
  name: string;
  fatherName: string;
  age: number; // in months
  dob?: string;
  muac: number; // in cm
  gender: "male" | "female" | "other";
  vaccination: VaccineStatus;
  vaccineDue: boolean;
  images?: string[];
  remarks?: string;
  status: "SAM" | "MAM" | "Normal";
}

export interface HealthDataContextType {
  awarnessSessions: AwarenessSession[];
  childScreenings: ChildScreening[];
  activeUsers: User[];
  addAwarenessSession: (session: Omit<AwarenessSession, 'id' | 'createdAt'>) => void;
  addChildScreening: (screening: Omit<ChildScreening, 'id' | 'createdAt'>) => void;
  deleteAwarenessSession: (id: string) => void;
  deleteChildScreening: (id: string) => void;
  getAwarenessSessionsByDateRange: (startDate: string, endDate: string) => AwarenessSession[];
  getChildScreeningsByDateRange: (startDate: string, endDate: string) => ChildScreening[];
  getChildScreeningsByStatus: (status: "SAM" | "MAM" | "Normal") => ChildScreening[];
  checkDuplicateAttendee: (name: string, fatherName: string, villageName: string, date: string) => boolean;
  checkDuplicateChild: (name: string, fatherName: string, villageName: string, date: string) => boolean;
}

// Create the context
const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error("useHealthData must be used within a HealthDataProvider");
  }
  return context;
};

// Sample mock data
const MOCK_AWARENESS_SESSIONS: AwarenessSession[] = [
  {
    id: "a1",
    date: new Date().toISOString().slice(0, 10),
    villageName: "Gulshan Town",
    ucName: "UC-5",
    userName: "Asif Jamali",
    userDesignation: "FMT",
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
    },
    attendees: [
      {
        id: "att1",
        name: "Ahmed Ali",
        fatherHusbandName: "Farooq Ahmed",
        age: 35,
        gender: "male",
        underFiveChildren: 2,
        contactNumber: "03001234567",
        remarks: "Interested in nutrition awareness",
      },
    ],
    createdBy: "asifjamali83",
    createdAt: new Date(),
  },
];

const MOCK_CHILD_SCREENINGS: ChildScreening[] = [
  {
    id: "cs1",
    date: new Date().toISOString().slice(0, 10),
    villageName: "Gulshan Town",
    ucName: "UC-5",
    userName: "Asif Jamali",
    userDesignation: "FMT",
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
    },
    children: [
      {
        id: "ch1",
        name: "Ahmed Ali",
        fatherName: "Farooq Ahmed",
        age: 24, // months
        muac: 10.5, // cm
        gender: "male",
        vaccination: "2nd-Dose",
        vaccineDue: true,
        remarks: "Needs immediate nutrition support",
        status: "SAM",
      },
      {
        id: "ch2",
        name: "Sara Khan",
        fatherName: "Imran Khan",
        age: 36, // months
        muac: 11.8, // cm
        gender: "female",
        vaccination: "3rd-Dose",
        vaccineDue: false,
        remarks: "Improving but needs monitoring",
        status: "MAM",
      },
      {
        id: "ch3",
        name: "Fatima Zahra",
        fatherName: "Mohammad Hassan",
        age: 48, // months
        muac: 13.2, // cm
        gender: "female",
        vaccination: "MR-2",
        vaccineDue: false,
        remarks: "Healthy child, all vaccinations complete",
        status: "Normal",
      },
    ],
    createdBy: "asifjamali83",
    createdAt: new Date(),
  },
];

// Mock active users
const MOCK_ACTIVE_USERS: User[] = [
  {
    id: "1",
    username: "asifjamali83",
    name: "Super Admin",
    role: "developer",
    isOnline: true,
    lastActive: new Date(),
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
    },
  },
  {
    id: "3",
    username: "fmt",
    name: "FMT User",
    role: "fmt",
    isOnline: true,
    lastActive: new Date(),
    location: {
      latitude: 24.9200,
      longitude: 67.0311,
    },
  },
];

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [awarnessSessions, setAwarnessSessions] = useState<AwarenessSession[]>([]);
  const [childScreenings, setChildScreenings] = useState<ChildScreening[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem("track4health_awareness_sessions");
    const storedScreenings = localStorage.getItem("track4health_child_screenings");
    const storedUsers = localStorage.getItem("track4health_active_users");

    if (storedSessions) {
      try {
        setAwarnessSessions(JSON.parse(storedSessions));
      } catch (e) {
        console.error("Failed to parse stored awareness sessions:", e);
        setAwarnessSessions(MOCK_AWARENESS_SESSIONS);
      }
    } else {
      setAwarnessSessions(MOCK_AWARENESS_SESSIONS);
    }

    if (storedScreenings) {
      try {
        setChildScreenings(JSON.parse(storedScreenings));
      } catch (e) {
        console.error("Failed to parse stored child screenings:", e);
        setChildScreenings(MOCK_CHILD_SCREENINGS);
      }
    } else {
      setChildScreenings(MOCK_CHILD_SCREENINGS);
    }

    if (storedUsers) {
      try {
        setActiveUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error("Failed to parse stored active users:", e);
        setActiveUsers(MOCK_ACTIVE_USERS);
      }
    } else {
      setActiveUsers(MOCK_ACTIVE_USERS);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("track4health_awareness_sessions", JSON.stringify(awarnessSessions));
  }, [awarnessSessions]);

  useEffect(() => {
    localStorage.setItem("track4health_child_screenings", JSON.stringify(childScreenings));
  }, [childScreenings]);

  useEffect(() => {
    localStorage.setItem("track4health_active_users", JSON.stringify(activeUsers));
  }, [activeUsers]);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Add a new awareness session
  const addAwarenessSession = (session: Omit<AwarenessSession, 'id' | 'createdAt'>) => {
    const newSession: AwarenessSession = {
      ...session,
      id: generateId(),
      createdAt: new Date(),
    };

    setAwarnessSessions((prev) => [...prev, newSession]);
  };

  // Add a new child screening
  const addChildScreening = (screening: Omit<ChildScreening, 'id' | 'createdAt'>) => {
    const newScreening: ChildScreening = {
      ...screening,
      id: generateId(),
      createdAt: new Date(),
    };

    setChildScreenings((prev) => [...prev, newScreening]);
  };

  // Delete an awareness session
  const deleteAwarenessSession = (id: string) => {
    setAwarnessSessions((prev) => prev.filter((session) => session.id !== id));
  };

  // Delete a child screening
  const deleteChildScreening = (id: string) => {
    setChildScreenings((prev) => prev.filter((screening) => screening.id !== id));
  };

  // Get awareness sessions by date range
  const getAwarenessSessionsByDateRange = (startDate: string, endDate: string) => {
    return awarnessSessions.filter((session) => {
      return session.date >= startDate && session.date <= endDate;
    });
  };

  // Get child screenings by date range
  const getChildScreeningsByDateRange = (startDate: string, endDate: string) => {
    return childScreenings.filter((screening) => {
      return screening.date >= startDate && screening.date <= endDate;
    });
  };

  // Get child screenings by status
  const getChildScreeningsByStatus = (status: "SAM" | "MAM" | "Normal") => {
    return childScreenings.filter((screening) => {
      return screening.children.some((child) => child.status === status);
    });
  };

  // Check for duplicate attendee
  const checkDuplicateAttendee = (name: string, fatherName: string, villageName: string, date: string) => {
    return awarnessSessions.some((session) => {
      if (session.date !== date || session.villageName !== villageName) {
        return false;
      }
      return session.attendees.some(
        (attendee) => 
          attendee.name.toLowerCase() === name.toLowerCase() && 
          attendee.fatherHusbandName.toLowerCase() === fatherName.toLowerCase()
      );
    });
  };

  // Check for duplicate child
  const checkDuplicateChild = (name: string, fatherName: string, villageName: string, date: string) => {
    return childScreenings.some((screening) => {
      if (screening.date !== date || screening.villageName !== villageName) {
        return false;
      }
      return screening.children.some(
        (child) => 
          child.name.toLowerCase() === name.toLowerCase() && 
          child.fatherName.toLowerCase() === fatherName.toLowerCase()
      );
    });
  };

  return (
    <HealthDataContext.Provider
      value={{
        awarnessSessions,
        childScreenings,
        activeUsers,
        addAwarenessSession,
        addChildScreening,
        deleteAwarenessSession,
        deleteChildScreening,
        getAwarenessSessionsByDateRange,
        getChildScreeningsByDateRange,
        getChildScreeningsByStatus,
        checkDuplicateAttendee,
        checkDuplicateChild,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};
