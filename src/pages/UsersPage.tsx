import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, UserCheck, UserX, Clock, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UserDialog } from '../components/UserDialog';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/use-toast';
import { User } from '../types/auth';
import { PaginationControls } from '@/components/PaginationControls';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [allUsers, setAllUsers] = useState<User[]>([]); // all users data for cards
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false,
    variant: 'default' as 'default' | 'destructive'
  });
  const { isSuperAdmin, isAdmin } = useAuth();

  const fetchUsers = async (page = 0, search = '', filter = '') => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, pageSize, search, filter);
      
      // Handle the response format with data field
      const usersData = response.data || [];
      const transformedUsers = Array.isArray(usersData) ? usersData.map((user: any) => ({
        ...user,
        userType: user.userRole?.name || 'USER',
        profileImage: user.profileImageUrl
      })) : [];
      
      setUsers(transformedUsers);
      setTotalRecords(response.totalRecords || transformedUsers.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsersForStats = async () => {
    try {
      const response = await userService.getUsers(null, null, null, null); // Call without page & size
      const usersData = response.data || [];

      const transformedUsers = Array.isArray(usersData) ? usersData.map((user: any) => ({
        ...user,
        userType: user.userRole?.name || 'USER',
        profileImage: user.profileImageUrl
      })) : [];

      setAllUsers(transformedUsers);
    } catch (error) {
      console.error('Failed to fetch all users for stats:', error);
    }
  };


  useEffect(() => {
    fetchUsers(currentPage, searchTerm, filterStatus);
    fetchAllUsersForStats();
  }, [pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(0, searchTerm, filterStatus);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleApproveUser = async (userId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Approve User',
      message: 'Are you sure you want to approve this user? They will gain access to the system.',
      loading: false,
      variant: 'default',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await userService.approveUser(userId);
          toast({ title: 'Success', description: 'User approved successfully!' });
          fetchUsers(currentPage, searchTerm, filterStatus);
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
        } catch (error) {
          console.error('Failed to approve user:', error);
          toast({ title: 'Error', description: 'Failed to approve user', variant: 'destructive' });
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // const handleToggleUserStatus = async (user: User) => {
    
  //   try {
  //     setConfirmDialog(prev => ({ ...prev, loading: true }));
  //     await userService.updateUser({
  //       ...user,
  //       isActive: !user.isActive
  //     });
  //     toast({ 
  //       title: 'Success', 
  //       description: `User ${user.isActive ? 'disabled' : 'enabled'} successfully!` 
  //     });
  //     fetchUsers(currentPage, searchTerm, filterStatus);
  //   } catch (error) {
  //     console.error('Failed to update user status:', error);
  //     toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
  //   }
  // };

  const handleToggleUserStatus = async (user: User) => {
    setConfirmDialog({
        open: true,
        title: 'Delete User',
        message: `Are you sure you want to disable this user? This action cannot be undone.`,
        loading: false,
        variant: 'destructive',
        onConfirm: async () => {
            try {
                setConfirmDialog(prev => ({ ...prev, loading: true }));

                // Call delete API instead of update
                await userService.deleteUser(user.id);

                toast({
                    title: 'Success',
                    description: 'User disabled successfully!'
                });

                // Refresh user list
                fetchUsers(currentPage, searchTerm, filterStatus);

                // Close confirmation dialog
                setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));

            } catch (error) {
                console.error('Failed to disable user:', error);

                toast({
                    title: 'Error',
                    description: 'Failed to delete user',
                    variant: 'destructive'
                });

                setConfirmDialog(prev => ({ ...prev, loading: false }));
            }
        }
    });
};

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm, filterStatus);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size); // This will automatically trigger useEffect
    setCurrentPage(0); // Reset to first page if required
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    if (!user.approvalStatus) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const stats = {
    total: totalRecords,
    active: users.filter(u => u.isActive && u.approvalStatus).length,
    pending: users.filter(u => !u.approvalStatus).length,
    disabled: users.filter(u => !u.isActive).length,
  };

  const totalPages = Math.ceil(totalRecords / pageSize);
  

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage your users efficiently</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-600 mt-1">Manage and monitor user accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-slate-500 mt-1">Approved & active</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Approval</CardTitle>
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Disabled</CardTitle>
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
            <p className="text-xs text-slate-500 mt-1">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 h-11 border-slate-200">
                  <Filter className="h-4 w-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="approved">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">User</TableHead>
                  <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Verification</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profileImage || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">@{user.userName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-slate-900">{user.email}</div>
                        <div className="text-sm text-slate-500">{user.mobileNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(user)}
                        {user.userType && user.userType !== 'USER' && (
                          <Badge variant="outline" className="text-xs">
                            {user.userType}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-1">
                        <Badge 
                          variant={user.emailVerified ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          Email
                        </Badge>
                        <Badge 
                          variant={user.phoneVerified ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          Phone
                        </Badge>
                        <Badge 
                          variant={user.kycStatus ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          KYC
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {(isAdmin() || isSuperAdmin()) && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!user.approvalStatus && (
                                <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Approve User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(user)}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Disable User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Enable User
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {users.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-5xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
                <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        mode={dialogMode}
        onUserUpdated={() => fetchUsers(currentPage, searchTerm, filterStatus)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
};
