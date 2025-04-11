import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { CaretDown, CaretLeft, Moon, SunDim, Gear, UserGear, SignOut } from 'phosphor-react';
import { useTheme } from 'next-themes';
import useAuth from '../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef(null);
  const user = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen(prev => {
      const newState = !prev;
      if (!newState) setThemeDropdownOpen(false);
      return newState;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-900 text-white py-4 px-8 flex justify-between items-center">
      <div className="flex items-center">
        <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={100} height={100} />
      </div>
      <nav className="flex space-x-8">
        <Link href="/admin">Inicio</Link>
        <Link href="/financial">Financeiro</Link>
        <Link href="/products">Produtos</Link>
        <Link href="/events">Eventos</Link>
        <Link href="/forms">Formulários</Link>
        <Link href="/users">Usuários</Link>
      </nav>

      <div className="flex items-center justify-between gap-10">
        <div>
          <Link href="/home">
            <button className="bg-[#B3090F] hover:bg-red-600 hover:scale-[1.03] transition text-white px-4 py-2 rounded-lg">
              Área Usuários
            </button>
          </Link>
        </div>
        <div className="relative flex items-center">
          <div onClick={toggleDropdown} className="cursor-pointer flex flex-col items-center">
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

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-8 w-48 bg-white text-black rounded-lg shadow-lg z-50"
                style={{ top: '50px' }}
              >
                <Link href="/my-account">
                  <div className="block px-4 py-2 flex items-center gap-2 hover:bg-gray-100 rounded-lg">
                    <UserGear size={16} />
                    Minha conta
                  </div>
                </Link>
                <div className="relative group" onClick={() => setThemeDropdownOpen(prev => !prev)}>
                  <div className="block px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg">
                    <CaretLeft size={16} />
                    <span>Tema</span>
                  </div>
                  <AnimatePresence>
                    {isThemeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-full top-0 mr-1 w-64 bg-white text-black rounded-lg shadow-lg z-10"
                      >
                        <div
                          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-lg ${theme === 'dark' ? 'text-[#B3090F] font-bold' : ''}`}
                          onClick={() => setTheme('dark')}
                        >
                          <Image src="/theme/dark.png" alt="Tema escuro" width={50} height={38}className="mr-2 rounded border" />
                          Tema escuro
                        </div>
                        <div
                          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-lg ${theme === 'light' ? 'text-[#B3090F] font-bold' : ''}`}
                          onClick={() => setTheme('light')}
                        >
                          <Image src="/theme/light.png" alt="Tema claro" width={50} height={38}className="mr-2 rounded border" />
                          Tema claro
                        </div>
                        <div
                          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-lg ${theme === 'system' ? 'text-[#B3090F] font-bold' : ''}`}
                          onClick={() => setTheme('system')}
                        >
                          <Image src="/theme/system.png" alt="Corresponder ao sistema" width={50} height={38} className="mr-2 rounded border" />
                          Corresponder ao sistema
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link href="/login">
                  <div
                    className="block px-4 py-2 flex items-center gap-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                    }}
                  >
                    <SignOut size={16} />
                    Sair
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}