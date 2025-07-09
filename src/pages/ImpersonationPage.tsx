import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

import { toast } from '../components/ui/use-toast';
import { Loader2, UserCheck, Send } from 'lucide-react';
import { useImpersonation } from '@/contexts/src/contexts/ImpersonationContext';
import { impersonationService } from '@/services/src/services/impersonationService';

export const ImpersonationPage = () => {
  const [userId, setUserIdentifier] = useState('');
  const [contactMode, setContactMode] = useState<'email' | 'mobile'>('email');
  const [otp, setOtpCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const { startImpersonation } = useImpersonation();

  const handleRequestOTP = async () => {
    if (!userId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter username, email or mobile',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await impersonationService.requestOTP({
        userId: userId.trim(),
        contactMode: contactMode.toUpperCase() as 'EMAIL' | 'MOBILE',
      });

      setStep('verify');
      toast({
        title: 'OTP Sent',
        description: `OTP has been sent via ${contactMode.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Failed to request OTP:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the OTP',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await impersonationService.verifyOTP({
        userId: userId.trim(),
        otp: otp.trim(),
      });

      const impersonationToken = response.data;

      if (impersonationToken) {
        const userName = userId.trim();
        startImpersonation({ name: userName }, impersonationToken);

        // Reset form
        setUserIdentifier('');
        setOtpCode('');
        setStep('request');

        toast({
          title: 'Success',
          description: `Now impersonating ${userName}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Token missing in response',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('request');
    setOtpCode('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">User Impersonation</h1>
          <p className="text-slate-600 mt-1">Temporarily log in as another user</p>
        </div>

        <Card className="bg-white shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              {step === 'request' ? 'Request Access' : 'Verify OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'request'
                ? 'Enter user details to send OTP'
                : 'Enter the OTP sent to the user'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'request' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="userIdentifier">Search by Username, Email or Mobile</Label>
                  <Input
                    id="userIdentifier"
                    type="text"
                    placeholder="Enter username, email or mobile"
                    value={userId}
                    onChange={(e) => setUserIdentifier(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otpChannel">Send OTP Via</Label>
                  <Select
                    value={contactMode}
                    onValueChange={(value: 'email' | 'mobile') => setContactMode(value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{contactMode.toUpperCase()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">EMAIL</SelectItem>
                      <SelectItem value="mobile">MOBILE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRequestOTP}
                  disabled={loading || !userId.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request OTP
                    </>
                  )}
                </Button>
              </>
            )}

            {step === 'verify' && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    OTP sent to <strong>{userId}</strong> via {contactMode.toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otpCode">Enter OTP</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Enter the 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
