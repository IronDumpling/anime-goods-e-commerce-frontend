import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import HttpError from './HttpError';

type AccessLevel = 'user' | 'admin';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  accessLevel: AccessLevel;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  accessLevel,
  fallbackPath
}) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // If not logged in, show 401 error
  if (!isLoggedIn) {
    return <HttpError code={401} />;
  }

  // If admin access is required but user is not an admin, show 403 error
  if (accessLevel === 'admin' && !isAdmin) {
    return <HttpError code={403} />;
  }

  // If we have a fallback path and the user doesn't have access, redirect to that path
  if (fallbackPath) {
    // This would be handled by your router configuration
    // For now, we'll just show a message
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Redirecting to {fallbackPath}...
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Current path: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{currentPath}</span>
          </p>
        </div>
      </div>
    );
  }

  // If children is empty, show placeholder content
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">
            {accessLevel === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
          </h1>
          <p className="text-gray-600 mb-4">
            This is a placeholder for the {accessLevel}-protected page. Implementation coming soon.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Current path: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{currentPath}</span>
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass and children is not empty, render the children directly
  return <>{children}</>;
};

export default ProtectedRoute;