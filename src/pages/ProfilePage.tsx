
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">View your account information</p>
        </div>
        <Button onClick={() => navigate('/edit-profile')}>
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="text-gray-600">@{user.userName}</p>
                {user.userType && (
                  <Badge variant="outline" className="mt-2">
                    {user.userType}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Mobile:</span>
                    <span className="ml-2">{user.mobileNumber}</span>
                  </div>
                  {user.adhaarNumber && (
                    <div>
                      <span className="font-medium">Aadhaar:</span>
                      <span className="ml-2">{user.adhaarNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                  Account Status
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Account Status:</span>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approval Status:</span>
                    <Badge variant={user.approvalStatus ? 'default' : 'secondary'}>
                      {user.approvalStatus ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Email Verified</span>
              <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                {user.emailVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Phone Verified</span>
              <Badge variant={user.phoneVerified ? 'default' : 'secondary'}>
                {user.phoneVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>KYC Status</span>
              <Badge variant={user.kycStatus ? 'default' : 'secondary'}>
                {user.kycStatus ? 'Completed' : 'Pending'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Login Status</span>
              <Badge variant={user.isLoggedIn ? 'default' : 'secondary'}>
                {user.isLoggedIn ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
