import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

const withAdminProtection = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const user = useAuth();

    useEffect(() => {
      if (user && !user.is_admin) {
        router.replace('/home');
      }
    }, [user, router]);
    
    if (!user) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAdminProtection;