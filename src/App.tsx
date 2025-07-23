// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";

// Layout & Routes
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/Layout/DashboardLayout";

// Contexts
import { CartProvider } from "./contexts/CartContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ImpersonationProvider } from "./contexts/src/contexts/ImpersonationContext";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AboutPage } from "./pages/AboutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { UsersPage } from "./pages/UsersPage";
import { CreateAdminPage } from "./pages/CreateAdminPage";
import { MyProductsPage } from "./pages/MyProductsPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { MasterDataPage } from "./pages/MasterDataPage";
import { ImpersonationPage } from "./pages/ImpersonationPage";
import NotFound from "./pages/NotFound";
import { ProductDetailPage } from "./pages/ProductDetailsPage";
import { NotificationDialog } from "./components/NotificationDialog";
import { LiveChat } from "./components/Chat";
import { LiveChat } from "./components/Chat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ChatProvider>
          <NotificationDialog />
          <ImpersonationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Super Admin Only */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="create-admin"
                      element={
                        <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                          <CreateAdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="master-data"
                      element={
                        <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                          <MasterDataPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin + Super Admin */}
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="impersonation"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <ImpersonationPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* All Authenticated Users */}
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="edit-profile" element={<EditProfilePage />} />
                    <Route path="product-details/:id" element={<ProductDetailPage />} />

                    {/* User Role Specific */}
                    <Route
                      path="my-products"
                      element={
                        <ProtectedRoute requiredRoles={["USER"]}>
                          <MyProductsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="my-orders"
                      element={
                        <ProtectedRoute requiredRoles={["USER"]}>
                          <MyOrdersPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Default Landing */}
                    <Route index element={<Navigate to="/products" replace />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <LiveChat />
              <LiveChat />
            </TooltipProvider>
          </ImpersonationProvider>
        </ChatProvider>
      </CartProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;