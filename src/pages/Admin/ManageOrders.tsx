import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const ManageOrders: React.FC = () => {
  return (
    <ProtectedRoute accessLevel="admin">
    </ProtectedRoute>
  );
};

export default ManageOrders;