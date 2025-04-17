import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute accessLevel="admin">
    </ProtectedRoute>
  );
};

export default AdminDashboard;