
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Edit, Mail, Phone, Calendar, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from '../components/ui/use-toast';
import { User as UserType } from '../types/auth';

export const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(authUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      fetchLatestUserProfile(authUser.id);
    }
  }, [authUser]);

  const fetchLatestUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      
      // Extract from response key and handle userType properly
      const userData = response.data.response || response.data;
      const updatedUser: UserType = {
        ...userData,
        userType: (userData.userRole?.name || userData.userType || 'USER') as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
        profileImage: userData.profileImageUrl || userData.profileImage
      };
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch latest profile data', 
        variant: 'destructive' 
      });
      // Fallback to auth user data
      if (authUser) {
        setUser(authUser);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          <p className="text-gray-600 mt-2">Unable to load user profile data</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (!user.approvalStatus) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadge = () => {
    const colors = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-blue-100 text-blue-800',
      'USER': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge variant="outline" className={colors[user.userType] || colors.USER}>
        {user.userType}
      </Badge>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your profile information</p>
        </div>
        <Button onClick={() => navigate('/edit-profile')}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-gray-600">@{user.userName}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {getStatusBadge()}
                {getRoleBadge()}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {user.emailVerified ? (
                    <Badge variant="default" className="text-xs">Email Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Email Pending</Badge>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {user.phoneVerified ? (
                    <Badge variant="default" className="text-xs">Phone Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Phone Pending</Badge>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  {user.kycStatus ? (
                    <Badge variant="default" className="text-xs">KYC Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">KYC Pending</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <p className="text-gray-900 mt-1">@{user.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <p className="text-gray-900 mt-1">{user.mobileNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Status</label>
                  <div className="mt-1">
                    {getStatusBadge()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User Role</label>
                  <div className="mt-1">
                    {getRoleBadge()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  {user.emailVerified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-sm text-gray-600">{user.mobileNumber}</p>
                    </div>
                  </div>
                  {user.phoneVerified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">KYC Verification</p>
                      <p className="text-sm text-gray-600">Identity verification</p>
                    </div>
                  </div>
                  {user.kycStatus ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
