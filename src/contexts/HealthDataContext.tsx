
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define data structures
export type VaccineStatus = "0-Dose" | "1st-Dose" | "2nd-Dose" | "3rd-Dose" | "MR-1" | "MR-2";

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
  gender?: "male" | "female" | "other";
  remarks?: string;
  belongsToSameUC?: boolean;
}

export interface ScreenedChild extends ChildData {
  id: string;
  name: string;
  fatherName: string;
  age: number;
  muac: number;
  gender: "male" | "female" | "other";
  vaccination: VaccineStatus;
  vaccineDue: boolean;
  status: "SAM" | "MAM" | "Normal";
  dob?: string;
  address?: string;
  remarks?: string;
  belongsToSameUC?: boolean;
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
}

// Context type
interface HealthDataContextValue {
  awarenessSessions: AwarenessSession[];
  awarnessSessions: AwarenessSession[]; // Keep for backward compatibility
  childScreenings: ChildScreening[];
  activeUsers: { id: string; name: string; role: string; location?: { latitude: number; longitude: number } }[];
  addAwarenessSession: (session: Omit<AwarenessSession, 'id'>) => void;
  addChildScreening: (session: Omit<ChildScreening, 'id'>) => void;
  updateAwarenessSession: (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => void;
  updateChildScreening: (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => void;
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
  const [awarenessSessions, setAwarenessSessions] = useState<AwarenessSession[]>(() => {
    const storedSessions = localStorage.getItem('awarenessSessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  });

  const [childScreenings, setChildScreenings] = useState<ChildScreening[]>(() => {
    const storedScreenings = localStorage.getItem('childScreenings');
    return storedScreenings ? JSON.parse(storedScreenings) : [];
  });

  // Mock active users
  const activeUsers = [
    { id: '1', name: 'Asif Jamali', role: 'Developer', location: { latitude: 24.8607, longitude: 67.0011 } },
    { id: '2', name: 'Field Worker 1', role: 'Field Monitor', location: { latitude: 24.8507, longitude: 67.0111 } },
  ];

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('awarenessSessions', JSON.stringify(awarenessSessions));
  }, [awarenessSessions]);

  useEffect(() => {
    localStorage.setItem('childScreenings', JSON.stringify(childScreenings));
  }, [childScreenings]);

  // Add a new awareness session
  const addAwarenessSession = (session: Omit<AwarenessSession, 'id'>) => {
    const newSession: AwarenessSession = {
      id: uuidv4(),
      ...session,
      attendees: session.attendees || [],
    };
    setAwarenessSessions([...awarenessSessions, newSession]);
  };

  // Add a new child screening session
  const addChildScreening = (session: Omit<ChildScreening, 'id'>) => {
    const newSession: ChildScreening = {
      id: uuidv4(),
      ...session,
      children: session.children || [],
    };
    setChildScreenings([...childScreenings, newSession]);
  };

  // Update an existing awareness session
  const updateAwarenessSession = (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => {
    setAwarenessSessions(
      awarenessSessions.map((session) =>
        session.id === id ? { ...session, ...updatedSession } : session
      )
    );
  };

  // Update an existing child screening session
  const updateChildScreening = (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => {
    setChildScreenings(
      childScreenings.map((session) =>
        session.id === id ? { ...session, ...updatedSession } : session
      )
    );
  };

  // Delete an awareness session
  const deleteAwarenessSession = (id: string) => {
    setAwarenessSessions(awarenessSessions.filter((session) => session.id !== id));
  };

  // Delete a child screening session
  const deleteChildScreening = (id: string) => {
    setChildScreenings(childScreenings.filter((session) => session.id !== id));
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
          session.id === sessionId ? { ...session, children: [...session.children, newChild] } : session
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
                child.id === childId ? updatedChild : child
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

  const value: HealthDataContextValue = {
    awarenessSessions,
    awarnessSessions: awarenessSessions, // Add this for backward compatibility
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
