import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define data structures
interface ChildData {
  id: string;
  name: string;
  age: number;
  muac: number;
  vaccineDue: string;
  vaccination: string;
}

interface ScreeningData {
  id: string;
  date: string;
  villageName: string;
  ucName: string;
  sessionNumber: string;
  image: string | null;
  children: ChildData[];
}

// Context type
interface HealthDataContextValue {
  awarenessSessions: ScreeningData[];
  childScreenings: ScreeningData[];
  addAwarenessSession: (session: Omit<ScreeningData, 'id' | 'children'>) => void;
  addChildScreening: (session: Omit<ScreeningData, 'id' | 'children'>) => void;
  updateAwarenessSession: (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => void;
  updateChildScreening: (id: string, updatedSession: Omit<ScreeningData, 'id' | 'children'>) => void;
  deleteAwarenessSession: (id: string) => void;
  deleteChildScreening: (id: string) => void;
  addChildToSession: (sessionId: string, child: Omit<ChildData, 'id'>, isAwarenessSession: boolean, address?: string) => void;
  updateChildInSession: (sessionId: string, childId: string, updatedChild: ChildData, isAwarenessSession: boolean) => void;
  deleteChildFromSession: (sessionId: string, childId: string, isAwarenessSession: boolean) => void;
}

// Create the context with a default value
const HealthDataContext = createContext<HealthDataContextValue | undefined>(undefined);

// Provider Component
export const HealthDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [awarenessSessions, setAwarenessSessions] = useState<ScreeningData[]>(() => {
    const storedSessions = localStorage.getItem('awarenessSessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  });

  const [childScreenings, setChildScreenings] = useState<ScreeningData[]>(() => {
    const storedScreenings = localStorage.getItem('childScreenings');
    return storedScreenings ? JSON.parse(storedScreenings) : [];
  });

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('awarenessSessions', JSON.stringify(awarenessSessions));
  }, [awarenessSessions]);

  useEffect(() => {
    localStorage.setItem('childScreenings', JSON.stringify(childScreenings));
  }, [childScreenings]);

  // Add a new awareness session
  const addAwarenessSession = (session: Omit<ScreeningData, 'id' | 'children'>) => {
    const newSession: ScreeningData = {
      id: uuidv4(),
      ...session,
      children: [],
    };
    setAwarenessSessions([...awarenessSessions, newSession]);
  };

  // Add a new child screening session
  const addChildScreening = (session: Omit<ScreeningData, 'id' | 'children'>) => {
    const newSession: ScreeningData = {
      id: uuidv4(),
      ...session,
      children: [],
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

  const value: HealthDataContextValue = {
    awarenessSessions,
    childScreenings,
    addAwarenessSession,
    addChildScreening,
    updateAwarenessSession,
    updateChildScreening,
    deleteAwarenessSession,
    deleteChildScreening,
    addChildToSession,
    updateChildInSession,
    deleteChildFromSession,
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
