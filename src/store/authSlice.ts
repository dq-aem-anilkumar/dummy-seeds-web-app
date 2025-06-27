import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, LoginRequest, RegisterRequest } from '../services/authService';

interface AuthState {
  user: {
    id: string;
    name: string;
    userName: string;
    userType: string;
    email: string;
    mobileNumber: string;
    profileImage: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    kycStatus: boolean;
    approvalStatus: boolean;
    isActive: boolean;
    isDeleted: boolean;
    isLoggedIn: boolean;
    adhaarNumber: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isAuthenticated: localStorage.getItem('token') ? true : false,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token and user info
      localStorage.setItem('token', response.accessToken);
      
      // Create user object from response
      const user = {
        id: response.headerUserId,
        name: response.name,
        userName: credentials.userName,
        userType: 'USER', // Default, will be updated when we get full user data
        email: '',
        mobileNumber: '',
        profileImage: null,
        emailVerified: false,
        phoneVerified: false,
        kycStatus: false,
        approvalStatus: true,
        isActive: true,
        isDeleted: false,
        isLoggedIn: true,
        adhaarNumber: ''
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: response.accessToken };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
