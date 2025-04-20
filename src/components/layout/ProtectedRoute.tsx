import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import HttpError from './HttpError';

type AccessLevel = 'self' | 'user' | 'admin' | 'self-and-admin';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  accessLevel: AccessLevel;
  fallbackPath?: string;
  resolveUserId?: (requestId: string) => Promise<string | undefined>;
  paramKey?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  accessLevel,
  fallbackPath,
  resolveUserId,
  paramKey = 'userId',
}) => {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  const isAdmin = user?.isAdmin;
  const location = useLocation();
  const currentPath = location.pathname;
  const params = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>();

  const reqId = params[paramKey];

  useEffect(() => {
    let fetchUserId = async () => {
      if (reqId) {
        let resId: string | undefined;
        if (resolveUserId) {
          resId = await resolveUserId(reqId);
        } else {
          resId = reqId;
        }
        setResolvedUserId(resId);
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    fetchUserId();
  }, [resolveUserId, reqId]);

  if (isLoading) {
    return <></>;
  }

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
    if (!resolvedUserId || String(user?.id) !== resolvedUserId) {
      return <HttpError code={403} />;
    }
  }

  // If the access is only the user itself and admin
  if (accessLevel === 'self-and-admin') {
    if (!isAdmin && (!resolvedUserId || String(user?.id) !== resolvedUserId)) {
      console.log(`isAdmin: ${isAdmin}, userId: ${resolvedUserId}, user.id ${user.id}`);
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