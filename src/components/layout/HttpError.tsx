import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HttpErrorProps {
  code: 401 | 403 | 404 | 500;
  message?: string;
  showHomeButton?: boolean;
}

const HttpError: React.FC<HttpErrorProps> = ({
  code,
  message,
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const errorConfig = {
    401: {
      title: 'Unauthorized',
      description: 'You need to be logged in to access this page.',
      icon: '🔒',
      action: 'Login',
      actionPath: '/login'
    },
    403: {
      title: 'Forbidden',
      description: 'You don\'t have permission to access this page.',
      icon: '🚫',
      action: 'Go Back',
      actionPath: -1
    },
    404: {
      title: 'Page Not Found',
      description: 'The page you\'re looking for doesn\'t exist.',
      icon: '🔍',
      action: 'Go Home',
      actionPath: '/'
    },
    500: {
      title: 'Server Error',
      description: 'Something went wrong on our end. Please try again later.',
      icon: '⚠️',
      action: 'Refresh',
      actionPath: 0
    }
  };

  const config = errorConfig[code];

  const handleAction = () => {
    if (typeof config.actionPath === 'number') {
      if (config.actionPath === -1) {
        navigate(-1);
      } else if (config.actionPath === 0) {
        window.location.reload();
      }
    } else {
      navigate(config.actionPath, { state: { from: { pathname: location.pathname } } });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6 animate-bounce">
          {config.icon}
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          {code}<br/>{config.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {message || config.description}
        </p>
        <div className="space-y-4">
          <button
            onClick={handleAction}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            {config.action}
          </button>
          {showHomeButton && code !== 404 && (
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                Go to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HttpError;