
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';

export const DashboardLayout = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavigation />
      </div>

      <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 to push content below fixed header */}
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main content area with proper padding */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
