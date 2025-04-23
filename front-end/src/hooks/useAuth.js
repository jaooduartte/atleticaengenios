// src/hooks/useAuth.js
import { useEffect, useState } from 'react';

export default function useAuth() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

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
        };

        fetchUser();
    }, []);

    return user;
}