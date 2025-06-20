import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        let decoded;
        try {
          decoded = jwtDecode(token);
        } catch (decodeErr) {
          console.error('Token inválido:', decodeErr);
          localStorage.removeItem('token');
          return;
        }

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            id: Number(data.user?.id),
            name: data.user?.name || 'Usuário',
            image: data.user?.photo || '/placeholder.png',
            is_admin: data.user?.is_admin ?? false
          });
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
      }
    };

    fetchUser();
  }, []);

  return user;
}