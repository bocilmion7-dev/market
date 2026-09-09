import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/routes/auth/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/routes/admin/Dashboard';
import AdminUsers from '@/routes/admin/Users';
import AdminCategories from '@/routes/admin/Categories';
import AdminBrands from '@/routes/admin/Brands';
import AdminSettings from '@/routes/admin/Settings';
import FormBuilderPage from '@/routes/admin/FormBuilder';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN_MAKER']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="form-builder" element={<FormBuilderPage />} />
            <Route path="form-builder/:id" element={<FormBuilderPage />} />
          </Route>
          <Route
            path="/publisher"
            element={
              <ProtectedRoute allowedRoles={['PRODUCT_PUBLISHER']}>
                <div className="p-4"><h1>Publisher Dashboard</h1></div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div className="p-4"><h1>Storefront</h1></div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;