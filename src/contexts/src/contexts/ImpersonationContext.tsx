import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from '@/components/ui/use-toast';
import { impersonationService } from '@/services/src/services/impersonationService';
import { setUser } from '@/store/authSlice';
import axios from 'axios';

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: any;
  originalToken: string | null;
  startImpersonation: (userData: any, newToken: string) => void;
  exitImpersonation: () => void;
  extendSession: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [originalToken, setOriginalToken] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const impersonationData = localStorage.getItem('impersonation_data');
    if (impersonationData) {
      const { user, originalToken: storedToken } = JSON.parse(impersonationData);
      setIsImpersonating(true);
      setImpersonatedUser(user);
      setOriginalToken(storedToken);
      dispatch(setUser(user));
      startSessionTimer();
    }
  }, [dispatch]);

  const startSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timer = setTimeout(() => {
      showExtensionDialog();
    }, 50 * 60 * 1000); // 50 minutes

    setSessionTimer(timer);
  };

  const showExtensionDialog = () => {
    const shouldExtend = window.confirm(
      'Your impersonation session will expire soon. Do you want to extend it?'
    );

    if (shouldExtend) {
      extendSession();
    } else {
      exitImpersonation();
    }
  };

  const startImpersonation = (userData: any, newToken: string) => {
    const currentToken = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');

    setOriginalToken(currentToken);
    setIsImpersonating(true);
    setImpersonatedUser(userData);

    // Store impersonation data
    localStorage.setItem(
      'impersonation_data',
      JSON.stringify({
        user: userData,
        originalToken: currentToken,
        originalUser: currentUser,
      })
    );

    // Switch token and user
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    dispatch(setUser(userData));

    startSessionTimer();

    toast({
      title: 'Impersonation Started',
      description: `You are now impersonating ${userData.name}`,
    });
  };

  const exitImpersonation = async () => {
    try {
      const response = await impersonationService.exitImpersonation();

      if (response.data) {
        // Restore token
        localStorage.setItem('token', response.data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data}`;

        // Restore full original user
        const impersonationData = localStorage.getItem('impersonation_data');
        if (impersonationData) {
          const { originalUser } = JSON.parse(impersonationData);
          if (originalUser) {
            dispatch(setUser(JSON.parse(originalUser)));
            localStorage.setItem('user', originalUser);
          }
        }
      }

      // Cleanup
      setIsImpersonating(false);
      setImpersonatedUser(null);
      setOriginalToken(null);
      localStorage.removeItem('impersonation_data');

      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }

      toast({
        title: 'Impersonation Ended',
        description: 'You have returned to your original account',
      });

      // Force app reload to refresh all state (sidebar, permissions, etc.)
      localStorage.removeItem('persist:root'); // optional if using redux-persist
      window.location.href = '/'; // or route to /dashboard, etc.

    } catch (error) {
      console.error('Failed to exit impersonation:', error);
      toast({
        title: 'Error',
        description: 'Failed to exit impersonation',
        variant: 'destructive',
      });
    }
  };

  const extendSession = async () => {
    try {
      await impersonationService.extendSession();
      startSessionTimer();

      toast({
        title: 'Session Extended',
        description: 'Your impersonation session has been extended',
      });
    } catch (error) {
      console.error('Failed to extend session:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend session',
        variant: 'destructive',
      });
    }
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating,
        impersonatedUser,
        originalToken,
        startImpersonation,
        exitImpersonation,
        extendSession,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};
