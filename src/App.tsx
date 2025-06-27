
import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from './store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AboutPage } from './pages/AboutPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { UsersPage } from './pages/UsersPage';
import { CreateAdminPage } from './pages/CreateAdminPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { MasterDataPage } from './pages/MasterDataPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Super Admin Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/create-admin" element={
                <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                  <CreateAdminPage />
                </ProtectedRoute>
              } />
              <Route path="/master-data" element={
                <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                  <MasterDataPage />
                </ProtectedRoute>
              } />
              
              {/* Admin + Super Admin Routes */}
              <Route path="/users" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              
              {/* All Authenticated Users */}
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              } />
              
              {/* User-specific Routes */}
              <Route path="/my-products" element={
                <ProtectedRoute requiredRoles={['USER']}>
                  <MyProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/my-orders" element={
                <ProtectedRoute requiredRoles={['USER']}>
                  <MyOrdersPage />
                </ProtectedRoute>
              } />
              
              {/* Default redirect based on role */}
              <Route path="/" element={<Navigate to="/products" replace />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
