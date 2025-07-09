
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/contexts/src/contexts/ImpersonationContext';
import { LogOut, User } from 'lucide-react';

export const ImpersonationBanner = () => {
  const { isImpersonating, impersonatedUser, exitImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="bg-orange-100 border-b border-orange-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-orange-800">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">
            You are impersonating <strong>{impersonatedUser.name}</strong>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exitImpersonation}
          className="bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
};