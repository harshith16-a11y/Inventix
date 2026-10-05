import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages (Independent full-screen flows)
import Login from './pages/Login';
import Register from './pages/Register';

// User Portal Pages
import UserDashboard from './pages/user/UserDashboard';
import ScheduleCalendar from './pages/user/ScheduleCalendar';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import CreateShipment from './pages/CreateShipment';
import MyShipments from './pages/MyShipments';
import ShipmentDetails from './pages/ShipmentDetails';
import LowStock from './pages/LowStock';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Admin Enterprise Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminShipments from './pages/admin/AdminShipments';
import AdminNormalQueue from './pages/admin/AdminNormalQueue';
import AdminPriorityQueue from './pages/admin/AdminPriorityQueue';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminDSAVisualizer from './pages/admin/AdminDSAVisualizer';
import AdminActivity from './pages/admin/AdminActivity';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// 2D & 3D Interactive Warehouse Visualizer
import WarehouseVisualizer from './pages/WarehouseVisualizer';

export default function App() {
  return (
    <Routes>
      {/* ========================================================
          1. AUTHENTICATION FLOWS (Dual User / Admin Switchers)
          ======================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ========================================================
          2. USER PORTAL INTERFACE (UserLayout - Light / Modern)
          ======================================================== */}
      <Route
        path="/"
        element={
          <UserLayout>
            <UserDashboard />
          </UserLayout>
        }
      />
      <Route
        path="/calendar"
        element={
          <UserLayout>
            <ScheduleCalendar />
          </UserLayout>
        }
      />
      <Route
        path="/products"
        element={
          <UserLayout>
            <Products />
          </UserLayout>
        }
      />
      <Route
        path="/products/:productId"
        element={
          <UserLayout>
            <ProductDetails />
          </UserLayout>
        }
      />
      <Route
        path="/low-stock"
        element={
          <UserLayout>
            <LowStock />
          </UserLayout>
        }
      />
      <Route
        path="/warehouse-twin"
        element={
          <UserLayout>
            <WarehouseVisualizer />
          </UserLayout>
        }
      />

      {/* User Authenticated Actions */}
      <Route
        path="/shipments/create"
        element={
          <ProtectedRoute>
            <UserLayout>
              <CreateShipment />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-shipments"
        element={
          <ProtectedRoute>
            <UserLayout>
              <MyShipments />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-shipments/:id"
        element={
          <ProtectedRoute>
            <UserLayout>
              <ShipmentDetails />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Notifications />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Profile />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      {/* ========================================================
          3. ADMIN CONSOLE INTERFACE (AdminLayout - Dark / Data-Rich)
          ======================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminInventory />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shipments"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminShipments />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/queue/normal"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminNormalQueue />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/queue/priority"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminPriorityQueue />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/low-stock"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <LowStock />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/performance"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminPerformance />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dsa-visualizer"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDSAVisualizer />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminActivity />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/warehouse-twin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <WarehouseVisualizer />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Visualizer Shortcuts */}
      <Route
        path="/dsa/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDSAVisualizer />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
