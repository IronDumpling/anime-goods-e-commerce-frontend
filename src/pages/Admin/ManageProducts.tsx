import React from 'react';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const ManageProducts: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ProtectedRoute accessLevel="admin">
      <button
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          onClick={() => navigate(`/admin`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin Page
        </button>
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
    </ProtectedRoute>
  );
};

export default ManageProducts;