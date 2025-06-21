import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import withAuth from './withAuth';

const withAdminProtection = (WrappedComponent) => {
  const AdminComponent = (props) => {
    const router = useRouter();
    const { user, isLoadingUser } = useAuth();

    useEffect(() => {
      if (!isLoadingUser && user && !user.is_admin) {
        router.replace('/home');
      }
    }, [user, isLoadingUser, router]);

    if (isLoadingUser || !user) return null;

    return <WrappedComponent {...props} />;
  };

  return withAuth(AdminComponent);
};

export default withAdminProtection;