
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { User } from '../types/auth';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { isSuperAdmin, isAdmin } = useAuth();

  const fetchUsers = async (page = 1, search = '', filter = '') => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, 20, search, filter);
      setUsers(response.data || []);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm, filterStatus);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await userService.approveUser(userId);
      toast({ title: 'Success', description: 'User approved successfully!' });
      fetchUsers(currentPage, searchTerm, filterStatus);
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast({ title: 'Error', description: 'Failed to approve user', variant: 'destructive' });
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await userService.updateUser({
        ...user,
        isActive: !user.isActive
      });
      toast({ 
        title: 'Success', 
        description: `User ${user.isActive ? 'disabled' : 'enabled'} successfully!` 
      });
      fetchUsers(currentPage, searchTerm, filterStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    if (!user.approvalStatus) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    return <Badge variant="default">Approved</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage all system users</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Users</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">@{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.mobileNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(user)}
                  {user.userType && (
                    <Badge variant="outline">{user.userType}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email Verified:</span>
                    <span className={user.emailVerified ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Phone Verified:</span>
                    <span className={user.phoneVerified ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      {user.phoneVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">KYC Status:</span>
                    <span className={user.kycStatus ? 'text-green-600 ml-1' : 'text-yellow-600 ml-1'}>
                      {user.kycStatus ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Login Status:</span>
                    <span className={user.isLoggedIn ? 'text-green-600 ml-1' : 'text-gray-600 ml-1'}>
                      {user.isLoggedIn ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {(isAdmin() || isSuperAdmin()) && !user.approvalStatus && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(user.id)}
                    >
                      Approve
                    </Button>
                  )}
                  {(isAdmin() || isSuperAdmin()) && (
                    <Button
                      size="sm"
                      variant={user.isActive ? 'destructive' : 'default'}
                      onClick={() => handleToggleUserStatus(user)}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};
