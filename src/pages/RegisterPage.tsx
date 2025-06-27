
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    adhaarNumber: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.userName || !formData.name || !formData.mobileNumber || !formData.email || !formData.password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return false;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const registrationData = {
        userName: formData.userName,
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        adhaarNumber: formData.adhaarNumber || undefined,
      };

      await dispatch(registerUser(registrationData) as any);
      toast({ title: 'Success', description: 'Registration successful! Please login with your credentials.' });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-600 text-lg">
            Join our marketplace community
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-semibold text-slate-700">
                Username *
              </Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Full Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-semibold text-slate-700">
                Mobile Number *
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter mobile number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Confirm password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adhaarNumber" className="text-sm font-semibold text-slate-700">
                Aadhaar Number <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="adhaarNumber"
                name="adhaarNumber"
                type="text"
                value={formData.adhaarNumber}
                onChange={handleChange}
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter Aadhaar number"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
