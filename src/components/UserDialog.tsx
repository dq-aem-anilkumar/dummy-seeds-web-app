
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage || ''} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {mode === 'view' ? 'User Details' : 'Edit User'}
                {getStatusBadge()}
              </div>
              <DialogDescription>@{user?.userName}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Username</Label>
              <Input
                id="userName"
                {...register('userName', { required: 'Username is required' })}
                disabled={mode === 'view'}
              />
              {errors.userName && (
                <p className="text-sm text-destructive">{errors.userName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                disabled={mode === 'view'}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              disabled={mode === 'view'}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              {...register('mobileNumber', { required: 'Mobile number is required' })}
              disabled={mode === 'view'}
            />
            {errors.mobileNumber && (
              <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adhaarNumber">Aadhaar Number</Label>
            <Input
              id="adhaarNumber"
              {...register('adhaarNumber')}
              disabled={mode === 'view'}
            />
          </div>

          {user && mode === 'view' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Verified</p>
                <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Phone Verified</p>
                <Badge variant={user.phoneVerified ? 'default' : 'secondary'}>
                  {user.phoneVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">KYC Status</p>
                <Badge variant={user.kycStatus ? 'default' : 'secondary'}>
                  {user.kycStatus ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Login Status</p>
                <Badge variant={user.isLoggedIn ? 'default' : 'secondary'}>
                  {user.isLoggedIn ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {mode === 'edit' && (
              <Button type="submit" loading={loading}>
                Update User
              </Button>
            )}
            {mode === 'view' && user && !user.approvalStatus && (
              <Button onClick={handleApprove} loading={loading}>
                Approve User
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
