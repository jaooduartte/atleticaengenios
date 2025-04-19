// src/app/admin/users/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  DotsThreeVertical,
  User,
  Pencil,
  ShieldPlus,
  Trash,
} from "@phosphor-icons/react";
import Header from "@/components/header-admin";
import Footer from "@/components/footer-admin";
import EditUserModal from "@/components/modals/edit-users-modal";
import ConfirmActionModal from "@/components/modals/confirm-action-modal";
import { useMockSession, mockToast, mockAPI } from "@/mocks/mocks";

export default function UsersPage() {
  const { data: session } = useMockSession(); //TODO : useSession();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Carregar usuários
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockAPI.fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      mockToast.error("Não foi possível carregar a lista de usuários");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        !event.target.closest(`#options-menu-${dropdownOpen}`)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Filtrar usuários com base na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.course &&
            user.course.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Manipuladores de eventos
  const handleToggleDropdown = useCallback((userId) => {
    setDropdownOpen((prevOpen) => (prevOpen === userId ? null : userId));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleOpenEditModal = useCallback((user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    setDropdownOpen(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  }, []);

  const handleOpenConfirmModal = useCallback((user, type) => {
    setSelectedUser(user);
    setConfirmModalType(type);
    setConfirmModalOpen(true);
    setDropdownOpen(null);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setConfirmModalType("");
    }, 300);
  }, []);

  // Handlers para ações
  const handleUserUpdate = useCallback(
    async (updatedUser) => {
      try {
        mockToast.loading("Atualizando usuário...");
        const result = await mockAPI.updateUser(updatedUser.id, updatedUser);

        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === updatedUser.id ? result : user))
        );

        mockToast.success("Usuário atualizado com sucesso!");
        handleCloseEditModal();
      } catch (error) {
        mockToast.error("Não foi possível atualizar o usuário");
      }
    },
    [handleCloseEditModal]
  );

  const handleMakeAdmin = useCallback(async () => {
    if (!selectedUser) return;

    try {
      mockToast.loading("Promovendo usuário...");
      const updatedUser = { ...selectedUser, is_admin: true };
      const result = await mockAPI.updateUser(selectedUser.id, updatedUser);

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === selectedUser.id ? result : user))
      );

      mockToast.success("Usuário promovido a administrador!");
      handleCloseConfirmModal();
    } catch (error) {
      mockToast.error("Falha ao promover usuário");
    }
  }, [selectedUser, handleCloseConfirmModal]);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    if (session.user.id === selectedUser.id) {
      mockToast.error("Você não pode excluir sua própria conta");
      handleCloseConfirmModal();
      return;
    }

    try {
      mockToast.loading("Excluindo usuário...");
      await mockAPI.deleteUser(selectedUser.id);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );

      mockToast.success("Usuário excluído com sucesso!");
      handleCloseConfirmModal();
    } catch (error) {
      mockToast.error("Falha ao excluir usuário");
    }
  }, [selectedUser, session?.user?.id, handleCloseConfirmModal]);

  // Função para executar ação com base no tipo
  const handleConfirmAction = useCallback(() => {
    if (confirmModalType === "admin") {
      handleMakeAdmin();
    } else if (confirmModalType === "delete") {
      handleDeleteUser();
    }
  }, [confirmModalType, handleMakeAdmin, handleDeleteUser]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Usuários</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlass size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome, email ou curso..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Foto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {user.profile_image ? (
                              <img
                                src={user.profile_image}
                                alt={`${user.name}`}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <User
                                  size={20}
                                  className="text-gray-500 dark:text-gray-400"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {user.course || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.is_admin
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {user.is_admin ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <div
                            id={`options-menu-${user.id}`}
                            className="relative inline-block text-left"
                          >
                            <button
                              onClick={() => handleToggleDropdown(user.id)}
                              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                              aria-label="Opções"
                            >
                              <DotsThreeVertical size={24} />
                            </button>
                            {dropdownOpen === user.id && (
                              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                <div
                                  className="py-1"
                                  role="menu"
                                  aria-orientation="vertical"
                                  aria-labelledby="options-menu"
                                >
                                  <button
                                    onClick={() => handleOpenEditModal(user)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                    role="menuitem"
                                  >
                                    <Pencil size={16} className="mr-2" />
                                    Editar
                                  </button>
                                  {!user.is_admin && (
                                    <button
                                      onClick={() =>
                                        handleOpenConfirmModal(user, "admin")
                                      }
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                      role="menuitem"
                                    >
                                      <ShieldPlus size={16} className="mr-2" />
                                      Tornar Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleOpenConfirmModal(user, "delete")
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                    role="menuitem"
                                  >
                                    <Trash size={16} className="mr-2" />
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Modais separados em componentes */}
      {editModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleCloseEditModal}
          onSubmit={handleUserUpdate}
        />
      )}

      {confirmModalOpen && selectedUser && (
        <ConfirmActionModal
          type={confirmModalType}
          userName={selectedUser.name}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmAction}
        />
      )}
    </>
  );
}
