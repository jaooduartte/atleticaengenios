import Link from 'next/link';
import Image from 'next/image';
import UserDropdown from './UserDropdown';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();

  useEffect(() => {
    const routes = [
      '/admin/inicio',
      '/admin/financeiro',
      '/admin/produtos',
      '/admin/eventos',
      '/admin/formularios',
      '/admin/usuarios',
    ];
    routes.forEach((r) => router.prefetch(r));
  }, [router]);

  return (
    <header className="bg-black text-white py-4 px-8 flex items-center justify-between relative">
      <div className="flex items-center">
        <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={100} height={100} />
      </div>
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-8 z-10">
        {[
          { href: "/admin/inicio", label: "Inicio" },
          { href: "/admin/financeiro", label: "Financeiro" },
          { href: "/admin/produtos", label: "Produtos" },
          { href: "/admin/eventos", label: "Eventos" },
          { href: "/admin/formularios", label: "Formulários" },
          { href: "/admin/usuarios", label: "Usuários" },
        ].map(({ href, label }) => (
          <Link href={href} key={label} className="group relative">
            <span className="transition-colors duration-300 group-hover:text-gray-200">{label}</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-10 ml-auto">
        <div>
          <Link href="/inicio">
            <button className="bg-red-700 dark:bg-red-950 hover:bg-red-600 dark:hover:bg-red-900 hover:scale-[1.03] transition text-white px-4 py-2 rounded-lg">
              Área Usuários
            </button>
          </Link>
        </div>
        <UserDropdown />
      </div>
    </header>
  );
}