import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UserDashboardCard from "@/components/layout/UserDashboardCard";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Management Dashboard</h1>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
            <UserDashboardCard
              title="Manage Orders"
              description="Track, update, create, or delete orders"
              to="/admin/orders"
            />
            <UserDashboardCard
              title="Manage Accounts"
              description="Update, create, or delete accounts"
              to="/admin/users"
            />
            <UserDashboardCard
              title="Manage Products"
              description="Track, update, create, or delete products"
              to="/admin/products"
            />
            <UserDashboardCard
              title="My Account"
              description="View or update your personal admin account"
              to={`/user/${user?.id}/account`}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;