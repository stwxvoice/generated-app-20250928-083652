import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
};