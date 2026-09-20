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
import AdminShippingSettings from '@/routes/admin/ShippingSettings';
import FormBuilderPage from '@/routes/admin/FormBuilder';
import Approvals from '@/routes/admin/Approvals';
import Reports from '@/routes/admin/Reports';
import AuditLogs from '@/routes/admin/AuditLogs';
import PaymentSettings from '@/routes/admin/PaymentSettings';
import AdminOrders from '@/routes/admin/AdminOrders';
import AdminOrderDetail from '@/routes/admin/AdminOrderDetail';
import PublisherLayout from '@/components/layout/PublisherLayout';
import PublisherDashboard from '@/routes/publisher/Dashboard';
import PublisherProducts from '@/routes/publisher/Products';
import PublisherOrders from '@/routes/publisher/Orders';
import PublisherOrderDetail from '@/routes/publisher/OrderDetail';
import ProductForm from '@/routes/publisher/ProductForm';
import PublisherProfile from '@/routes/publisher/Profile';
import PublisherReviews from '@/routes/publisher/Reviews';
import PublisherDiscussions from '@/routes/publisher/Discussions';
import PublisherReports from '@/routes/publisher/Reports';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import Home from '@/routes/storefront/Home';
import ProductList from '@/routes/storefront/ProductList';
import ProductDetail from '@/routes/storefront/ProductDetail';
import Cart from '@/routes/storefront/Cart';
import Wishlist from '@/routes/storefront/Wishlist';
import Checkout from '@/routes/storefront/Checkout';
import WriteReview from '@/routes/storefront/WriteReview';
import Orders from '@/routes/storefront/Orders';
import OrderDetail from '@/routes/storefront/OrderDetail';
import ToastContainer from '@/components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
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
            <Route path="shipping" element={<AdminShippingSettings />} />
            <Route path="form-builder" element={<FormBuilderPage />} />
            <Route path="form-builder/:id" element={<FormBuilderPage />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="payment" element={<PaymentSettings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
          </Route>
          <Route
            path="/publisher"
            element={
              <ProtectedRoute allowedRoles={['PRODUCT_PUBLISHER']}>
                <PublisherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PublisherDashboard />} />
            <Route path="products" element={<PublisherProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="orders" element={<PublisherOrders />} />
            <Route path="orders/:id" element={<PublisherOrderDetail />} />
            <Route path="profile" element={<PublisherProfile />} />
            <Route path="reviews" element={<PublisherReviews />} />
            <Route path="discussions" element={<PublisherDiscussions />} />
            <Route path="reports" element={<PublisherReports />} />
          </Route>
          <Route path="/" element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="write-review/:productId" element={<WriteReview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
