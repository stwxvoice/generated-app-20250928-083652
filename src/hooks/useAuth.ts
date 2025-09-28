import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { api, AuthCredentials } from '@/lib/api';
import { toast } from 'sonner';
export const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAppStore((state) => state.auth);
  const loginAction = useAppStore((state) => state.login);
  const logoutAction = useAppStore((state) => state.logout);
  const fetchFileTree = useAppStore((state) => state.fetchFileTree);
  const login = useCallback(async (credentials: AuthCredentials) => {
    try {
      const { user } = await api.login(credentials);
      loginAction(user.username);
      await fetchFileTree();
      navigate('/app', { replace: true });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [loginAction, navigate, fetchFileTree]);
  const register = useCallback(async (credentials: AuthCredentials) => {
    try {
      const { user } = await api.register(credentials);
      loginAction(user.username);
      await fetchFileTree();
      navigate('/app', { replace: true });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [loginAction, navigate, fetchFileTree]);
  const logout = useCallback(() => {
    logoutAction();
    navigate('/login', { replace: true });
  }, [logoutAction, navigate]);
  return {
    isAuthenticated,
    user: { username },
    login,
    register,
    logout,
  };
};