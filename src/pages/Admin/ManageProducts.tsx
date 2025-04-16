import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const ManageProducts: React.FC = () => {
  return (
    <ProtectedRoute accessLevel="admin">
    </ProtectedRoute>
  );
};

export default ManageProducts;