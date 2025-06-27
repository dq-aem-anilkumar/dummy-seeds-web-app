
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { updateUserData } from '../store/authSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';

export const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    userName: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error, user } = useAuth();

  const getDefaultRoute = (userRole?: string) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return '/dashboard';
      case 'ADMIN':
        return '/users';
      case 'USER':
        return '/products';
      default:
        return '/products';
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user details to get the correct role
      const fetchUserDetails = async () => {
        try {
          const userDetails = await userService.getUserById(user.id);
          const userRole = userDetails.data?.userRole?.name || 'USER';
          
          // Update user data with role
          dispatch(updateUserData({ 
            ...user, 
            userType: userRole,
            email: userDetails.data?.email || user.email,
            mobileNumber: userDetails.data?.mobileNumber || user.mobileNumber,
            profileImage: userDetails.data?.profileImageUrl || user.profileImage,
            emailVerified: userDetails.data?.emailVerified || false,
            phoneVerified: userDetails.data?.phoneVerified || false,
            kycStatus: userDetails.data?.kycStatus || false,
            adhaarNumber: userDetails.data?.adhaarNumber || ''
          }));
          
          navigate(getDefaultRoute(userRole), { replace: true });
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          navigate(getDefaultRoute('USER'), { replace: true });
        }
      };
      
      fetchUserDetails();
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Login Failed', description: error, variant: 'destructive' });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.userName || !credentials.password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    try {
      await dispatch(loginUser(credentials) as any);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-600 text-lg">
            Sign in to your marketplace account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-semibold text-slate-700">
                Username
              </Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                value={credentials.userName}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
