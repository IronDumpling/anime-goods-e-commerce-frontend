import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import HttpError from './HttpError';

type AccessLevel = 'self' | 'user' | 'admin' | 'self-and-admin';

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
  const { isLoggedIn, isAdmin, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const { userId } = useParams();

  // If not logged in, show 401 error
  if (!isLoggedIn) {
    return <HttpError code={401} />;
  }

  // If admin access is required but user is not an admin, show 403 error
  if (accessLevel === 'admin' && !isAdmin) {
    return <HttpError code={403} />;
  }

  // If the access is the user itself
  if (accessLevel === 'self') {
    if (!userId || String(user?.id) !== userId) {
      return <HttpError code={403} />;
    }
  }

  // If the access is only the user itself and admin
  if (accessLevel === 'self-and-admin') {
    if (!isAdmin && (!userId || String(user?.id) !== userId)) {
      return <HttpError code={403} />;
    }
  }

  // If we have a fallback path and the user doesn't have access, redirect to that path
  if (fallbackPath) {
    // This would be handled by your router configuration
    // For now, we'll just show a message
    return (
      <div className="p-4">
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. Redirecting to {fallbackPath}...
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Current path: <span className="font-mono bg-muted px-2 py-1 rounded">{currentPath}</span>
          </p>
        </div>
      </div>
    );
  }

  // If children is empty, show placeholder content
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <div className="p-4">
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">
            {accessLevel === 'admin' ? 'Admin Protected Page' : 'User Protected Page'}
          </h1>
          <p className="text-muted-foreground mb-4">
            This is a placeholder for the {accessLevel}-protected page. Implementation coming soon.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Current path: <span className="font-mono bg-muted px-2 py-1 rounded">{currentPath}</span>
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass and children is not empty, render the children directly
  return <>{children}</>;
};

export default ProtectedRoute;