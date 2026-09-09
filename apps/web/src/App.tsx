import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/routes/auth/Login';
import ProtectedRoute from '@/components/ProtectedRoute';

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
                <div className="p-4"><h1>Admin Dashboard</h1></div>
              </ProtectedRoute>
            }
          />
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