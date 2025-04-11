import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { CaretDown } from 'phosphor-react';
import useAuth from '../hooks/useAuth';

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useAuth();

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#B3090F] text-white py-4 px-8 flex justify-between items-center">
      <div className="flex items-center">
        <Image
          src="/Logo-Engenios.png"
          alt="Logo Engênios"
          width={100}
          height={100}
        />
      </div>
      <nav className="flex space-x-8">
        <Link href="/">Início</Link>
        <Link href="/produtos">Produtos</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/formularios">Formulários</Link>
        <Link href="/sobre">Sobre</Link>
      </nav>
      <div className='flex items-center justify-between gap-10 '>
        <div>
          <Link href="/admin">
            <button className="bg-gray-900 hover:bg-gray-800 hover:scale-[1.03] transition text-white px-4 py-2 rounded-lg">
              Área Admin
            </button>
          </Link>
        </div>
        <div className="relative flex items-center">
          <div
            onClick={toggleDropdown} // Alterna entre abrir e fechar o menu
            className="cursor-pointer flex flex-col items-center"
          >
            <div className='mb-2'>
              <Image
                src={user?.image || '/placeholder.png'}
                alt={user?.name || 'Usuário'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            {user && (
              <div className="flex gap-2">
                <p className="text-center">{user?.name || 'Usuário'}</p>
                <CaretDown size={16} className="mt-1" />
              </div>
            )}
          </div>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-8 w-48 bg-white text-black rounded-lg shadow-lg"
              style={{ top: '50px' }}
            >
              <Link href="/my-account">
                <div className="block px-4 py-2">Minha conta</div>
              </Link>
              <Link href="/login">
                <div
                  className="block px-4 py-2"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  }}
                >
                  Sair
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}