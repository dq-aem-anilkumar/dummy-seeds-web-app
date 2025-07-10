import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { ImpersonationBanner } from '../src/components/ImpersonationBanner';
import { useImpersonation } from '@/contexts/src/contexts/ImpersonationContext';

export const DashboardLayout = () => {
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // Base header height is ~4rem, banner adds ~2.5rem
  // When impersonating: pt-[6.5rem] ensures enough room for TopNav + Banner.
  // When not impersonating: only pt-[4rem] is applied to account for TopNav.
  const topPadding = isImpersonating && impersonatedUser ? 'pt-[6.5rem]' : 'pt-[4rem]';

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Fixed Header Area */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white shadow">
          <TopNavigation />
        </div>
        <ImpersonationBanner />
      </div>

      {/* Adjust padding dynamically */}
      <div className={`flex flex-1 overflow-hidden ${topPadding}`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
