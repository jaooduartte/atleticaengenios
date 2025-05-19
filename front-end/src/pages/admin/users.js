

import { useEffect, useState } from 'react';
import { remove as removeAccents } from 'diacritics';
import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';
import Banner from '../../components/banner';
import CustomField from '../../components/custom-field';
import { MagnifyingGlass, DotsThreeVertical } from '@phosphor-icons/react';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');

  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  // Função reutilizável para buscar usuários
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        showBannerMessage('Erro ao carregar', 'error', 'Não foi possível carregar a lista de usuários.');
      }
    } catch (error) {
      console.error(error);
      showBannerMessage('Erro de conexão', 'error', 'Falha ao se comunicar com o servidor.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => {
      const normalizedSearch = removeAccents(searchTerm.toLowerCase());
      const normalizedName = removeAccents(user.name?.toLowerCase() || '');
      const normalizedEmail = removeAccents(user.email?.toLowerCase() || '');
      const normalizedCourse = removeAccents(user.course?.toLowerCase() || '');

      return (
        normalizedName.includes(normalizedSearch) ||
        normalizedEmail.includes(normalizedSearch) ||
        normalizedCourse.includes(normalizedSearch)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const toggleAdmin = async (userId, currentValue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_admin: !currentValue })
      });
      if (response.ok) {
        showBannerMessage('Admin atualizado', 'success', 'Permissão de administrador foi modificada com sucesso.');
      } else {
        showBannerMessage('Erro ao atualizar', 'error', 'Não foi possível modificar o status de administrador.');
      }
    } catch (err) {
      console.error(err);
      showBannerMessage('Erro de conexão', 'error', 'Falha ao se comunicar com o servidor.');
    }
    fetchUsers();
  };

  // Função para alternar o status de ativo/inativo do usuário
  const toggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (response.ok) {
        showBannerMessage(
          !currentStatus ? 'Usuário ativado' : 'Usuário inativado',
          'success',
          `O usuário foi ${!currentStatus ? 'ativado' : 'inativado'} com sucesso.`
        );
      } else {
        showBannerMessage('Erro ao atualizar', 'error', 'Não foi possível alterar o status do usuário.');
      }
    } catch (err) {
      console.error(err);
      showBannerMessage('Erro de conexão', 'error', 'Falha ao se comunicar com o servidor.');
    }
    fetchUsers();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-[#0e1117] dark:text-white transition-colors duration-500 ease-in-out">
      <Header />

      {showBanner && (
        <Banner
          message={bannerMessage}
          description={bannerDescription}
          type={bannerType}
          className="absolute top-0 left-0 right-0 z-[100] p-4 bg-red-500 text-white text-center shadow-md"
        />
      )}

      <div className="container mx-auto px-6 py-10 flex-grow">
        <h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">Gestão de Usuários</h1>

        <div className="mb-6 max-w-md mx-auto">
          <CustomField
            icon={MagnifyingGlass}
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email ou curso..."
            clearable={searchTerm ? 'true' : ''}
            onClear={() => setSearchTerm('')}
          />
        </div>

        <div className="overflow-x-auto rounded-xl shadow-sm border dark:border-white/10">
          <table className="min-w-full bg-white dark:bg-white/10">
            <thead className="text-left bg-gray-200 dark:bg-white/10">
              <tr>
                <th className="px-6 py-4">Ativo</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t dark:border-white/10">
                  {/* Ativo */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.course || '-'}</td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        onChange={() => toggleAdmin(user.auth_id, user.is_admin)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${user.is_admin ? 'bg-green-600' : 'bg-gray-400'}`}>
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.is_admin ? 'translate-x-6' : 'translate-x-0'}`}
                        ></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-6 py-4">{user.role || 'Membro'}</td>
                  {/* Ações */}
                  <td className="px-6 py-4 text-center relative group">
                    <DotsThreeVertical size={22} className="mx-auto cursor-pointer" />
                    <div className="absolute right-0 top-6 w-40 bg-white dark:bg-[#0e1117] dark:border dark:border-white/10 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <button className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm">
                        Editar usuário
                      </button>
                      <button
                        onClick={() => toggleActive(user.auth_id, user.is_active)}
                        className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm"
                      >
                        {user.is_active ? 'Inativar usuário' : 'Ativar usuário'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import withAdminProtection from '../../utils/withAdminProtection';
export default withAdminProtection(UsersPage);