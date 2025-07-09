
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from '@/components/ui/use-toast';
import { impersonationService } from '@/services/src/services/impersonationService';
import { setUser } from '@/store/authSlice';

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
    // Check if we're already impersonating on app load
    const impersonationData = localStorage.getItem('impersonation_data');
    if (impersonationData) {
      const { user, originalToken: storedOriginalToken } = JSON.parse(impersonationData);
      setIsImpersonating(true);
      setImpersonatedUser(user);
      setOriginalToken(storedOriginalToken);
      dispatch(setUser(user));
      startSessionTimer();
    }
  }, [dispatch]);

  const startSessionTimer = () => {
    // Clear existing timer
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    // Set timer for 10 seconds before token expiry (assuming 1 hour token)
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
    
    setOriginalToken(currentToken);
    setIsImpersonating(true);
    setImpersonatedUser(userData);
    
    // Store impersonation data
    localStorage.setItem('impersonation_data', JSON.stringify({
      user: userData,
      originalToken: currentToken
    }));
    
    // Update token and user in store
    localStorage.setItem('token', newToken);
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
      
      if (response.accessToken && originalToken) {
        // Restore original token
        localStorage.setItem('token', response.accessToken);
        
        // Get original user data from token or restore from backup
        const originalUser = localStorage.getItem('original_user');
        if (originalUser) {
          dispatch(setUser(JSON.parse(originalUser)));
        }
      }
      
      // Clear impersonation state
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
      startSessionTimer(); // Restart the timer
      
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