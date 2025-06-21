import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

const withAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { user, isLoadingUser } = useAuth();

    useEffect(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.replace('/login');
        return;
      }

      if (!isLoadingUser && !user) {
        router.replace('/login');
      }
    }, [user, isLoadingUser, router]);

    if (isLoadingUser || !user) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
