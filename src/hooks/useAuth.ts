
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  
  const hasRole = (roles: string[]) => {
    if (!auth.user) return false;
    return roles.includes(auth.user.userType || 'USER');
  };

  const isSuperAdmin = () => hasRole(['SUPER_ADMIN']);
  const isAdmin = () => hasRole(['ADMIN', 'SUPER_ADMIN']);
  const isUser = () => hasRole(['USER']);

  return {
    ...auth,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isUser,
  };
};
