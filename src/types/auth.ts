
export interface User {
  id: string;
  userName: string;
  name: string;  
  mobileNumber: string;
  email: string;
  profileImage?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: boolean;
  approvalStatus: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isLoggedIn: boolean;
  adhaarNumber?: string;
  userType?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
