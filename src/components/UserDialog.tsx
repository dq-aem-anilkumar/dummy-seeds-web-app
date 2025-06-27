
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from '../types/auth';
import { userService } from '../services/userService';
import { toast } from './ui/use-toast';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  mode: 'view' | 'edit';
  onUserUpdated?: () => void;
}

interface UserFormData {
  userName: string;
  name: string;
  email: string;
  mobileNumber: string;
  adhaarNumber: string;
}

export const UserDialog = ({ open, onOpenChange, user, mode, onUserUpdated }: UserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  useEffect(() => {
    if (user && open) {
      reset({
        userName: user.userName,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        adhaarNumber: user.adhaarNumber || '',
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: UserFormData) => {
    if (!user || mode === 'view') return;
    
    try {
      setLoading(true);
      await userService.updateUser({ ...user, ...data });
      toast({ title: 'Success', description: 'User updated successfully' });
      onUserUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await userService.approveUser(user.id);
      toast({ title: 'Success', description: 'User approved successfully' });
      onUserUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!user) return null;
    if (!user.isActive) return <Badge variant="destructive">Disabled</Badge>;
    if (!user.approvalStatus) return <Badge variant="secondary">Pending</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-xl">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.profileImage || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-slate-800">
                  {mode === 'view' ? 'User Details' : 'Edit User'}
                </span>
                {getStatusBadge()}
              </div>
              <DialogDescription className="text-slate-500 font-medium">
                @{user?.userName}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-semibold text-slate-700">
                Username
              </Label>
              <Input
                id="userName"
                {...register('userName', { required: 'Username is required' })}
                disabled={mode === 'view'}
                className="h-11 border-slate-200"
              />
              {errors.userName && (
                <p className="text-sm text-red-500">{errors.userName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Full Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                disabled={mode === 'view'}
                className="h-11 border-slate-200"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              disabled={mode === 'view'}
              className="h-11 border-slate-200"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-semibold text-slate-700">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                {...register('mobileNumber', { required: 'Mobile number is required' })}
                disabled={mode === 'view'}
                className="h-11 border-slate-200"
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adhaarNumber" className="text-sm font-semibold text-slate-700">
                Aadhaar Number
              </Label>
              <Input
                id="adhaarNumber"
                {...register('adhaarNumber')}
                disabled={mode === 'view'}
                className="h-11 border-slate-200"
              />
            </div>
          </div>

          {user && mode === 'view' && (
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-600">Email Verified</p>
                  <Badge variant={user.emailVerified ? 'default' : 'secondary'} className="text-xs">
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-600">Phone Verified</p>
                  <Badge variant={user.phoneVerified ? 'default' : 'secondary'} className="text-xs">
                    {user.phoneVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-600">KYC Status</p>
                  <Badge variant={user.kycStatus ? 'default' : 'secondary'} className="text-xs">
                    {user.kycStatus ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-600">Login Status</p>
                  <Badge variant={user.isLoggedIn ? 'default' : 'secondary'} className="text-xs">
                    {user.isLoggedIn ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Cancel
            </Button>
            {mode === 'edit' && (
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            )}
            {mode === 'view' && user && !user.approvalStatus && (
              <Button 
                onClick={handleApprove} 
                disabled={loading}
                className="px-6 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Approving...' : 'Approve User'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
