import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { CaretDown } from 'phosphor-react';
import useAuth from '../hooks/useAuth';

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Cria uma referência para o dropdown
  const user = useAuth();

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState); // Alternar estado

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Fecha o dropdown
      }
    };

    // Adiciona o event listener para o clique fora
    document.addEventListener('mousedown', handleClickOutside);

    // Limpeza do event listener quando o componente for desmontado
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#B3090F] text-white py-4 px-8 flex justify-between items-center">
      {/* Logo à esquerda */}
      <div className="flex items-center">
        <Image
          src="/Logo-Engenios.png"
          alt="Logo Engênios"
          width={100}
          height={100}
        />
      </div>

      {/* Links centralizados */}
      <nav className="flex space-x-8">
        <Link href="/">Início</Link>
        <Link href="/produtos">Produtos</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/formularios">Formulários</Link>
        <Link href="/sobre">Sobre</Link>
      </nav>
      <div className='flex items-center justify-between gap-10 '>
        {/* Botão de "Área Admin" */}
        <div>
          <Link href="/admin"> {/* Redireciona para a página admin.js */}
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">
              Área Admin
            </button>
          </Link>
        </div>

        {/* Foto do perfil e dropdown */}
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

          {/* Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef} // Ref para capturar o clique fora
              className="absolute right-0 mt-8 w-48 bg-white text-black rounded-lg shadow-lg"
              style={{ top: '50px' }}
            >
              <Link href="/meu-cadastro">
                <div className="block px-4 py-2">Meu cadastro</div>
              </Link>
              <Link href="/login">
                <div className="block px-4 py-2">Sair</div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}