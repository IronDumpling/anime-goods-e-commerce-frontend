import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const ManageUsers: React.FC = () => {
  return (
    <ProtectedRoute accessLevel="admin">
    </ProtectedRoute>
  );
};

export default ManageUsers;