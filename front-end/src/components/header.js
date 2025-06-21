import Link from 'next/link';
import Image from 'next/image';
import useAuth from '../hooks/useAuth';
import UserDropdown from './UserDropdown';

export default function Header() {
  const { user, isLoadingUser } = useAuth();

  if (isLoadingUser) return null;

  return (
  <header className="bg-[#B3090F] dark:bg-red-950 text-white py-4 px-8 flex items-center justify-between relative">
      <div className="flex items-center">
        <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={100} height={100}/>
      </div>
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-8 z-10">
        {[
          { href: "/inicio", label: "Início" },
          { href: "/produtos", label: "Produtos" },
          { href: "/eventos", label: "Eventos" },
          { href: "/formularios", label: "Formulários" },
          { href: "/sobre", label: "Sobre" },
        ].map(({ href, label }) => (
          <Link href={href} key={label} className="group relative">
            <span className="transition-colors duration-300 group-hover:text-gray-200">{label}</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </nav>
      <div className='flex items-center justify-between gap-10 '>
      {user?.is_admin && (
          <div>
            <Link href="/admin/inicio">
              <button className="bg-black hover:bg-[#0e1117] hover:scale-[1.03] transition text-white px-4 py-2 rounded-lg">
                Área Admin
              </button>
            </Link>
          </div>
        )}
        <UserDropdown />
      </div>
    </header>
  );
}