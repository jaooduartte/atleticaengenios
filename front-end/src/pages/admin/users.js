import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { remove as removeAccents } from 'diacritics';
import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';
import Banner from '../../components/banner';
import CustomField from '../../components/custom-field';
import Modal from 'react-modal';
import CustomButton from '../../components/custom-buttom';
import { MagnifyingGlass, DotsThreeVertical, Trash } from '@phosphor-icons/react';
import CustomDropdown from '../../components/custom-dropdown';

function UsersPage() {
  const anoAtual = new Date().getFullYear();
  const [abaSelecionada, setAbaSelecionada] = useState('usuarios');
  const [gestoes, setGestoes] = useState(
    Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i)
  );
  const [gestaoSelecionada, setGestaoSelecionada] = useState(null);
  const [isGestaoModalOpen, setIsGestaoModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [isGestor, setIsGestor] = useState(false);
  const [usuariosSugestoes, setUsuariosSugestoes] = useState({});
  const [estruturaInicialCarregada, setEstruturaInicialCarregada] = useState(false);
  const verificaCargo = (cargo, userId) => cargo?.id === userId;
  const verificaListaCargo = (cargo, userId) =>
    Object.values(cargo).some(lista => lista.some(user => user.id === userId));
  const isUsuarioJaAdicionado = (userId) => {
    return (
      verificaCargo(estruturaGestao.Presidente, userId) ||
      verificaCargo(estruturaGestao['Vice-Presidente'], userId) ||
      (estruturaGestao.Conselheiros || []).some(user => user.id === userId) ||
      verificaListaCargo(estruturaGestao.Diretores, userId) ||
      verificaListaCargo(estruturaGestao.Trainees, userId)
    );
  };
  const buscarUsuarios = async (termo, cargo) => {
    if (termo.length < 2) {
      setUsuariosSugestoes(prev => ({ ...prev, [cargo]: [] }));
      return;
    }
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const todos = await res.json();
    const termoNormalizado = removeAccents(termo.toLowerCase());
    const filtrados = todos.filter(u =>
      u.name && removeAccents(u.name.toLowerCase()).includes(termoNormalizado)
    );
    setUsuariosSugestoes(prev => ({ ...prev, [cargo]: filtrados }));
  };

  const [modalCargoAberto, setModalCargoAberto] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const tiposDiretores = [
    'Tesoureiro',
    'Secretário',
    'Diretor de Esportes',
    'Diretor de Marketing',
    'Diretor de Produto',
    'Diretor de Eventos'
  ];
  const tiposTrainees = [
    'Trainee de Esportes',
    'Trainee de Marketing',
    'Trainee de Produto',
    'Trainee de Eventos'
  ];
  const [estruturaGestao, setEstruturaGestao] = useState({
    Presidente: null,
    'Vice-Presidente': null,
    Diretores: {},
    Trainees: {},
    Conselheiros: [],
  });
  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const dataOrdenada = data.sort((a, b) => {
          const nomeA = (a.name || '').toLowerCase();
          const nomeB = (b.name || '').toLowerCase();
          return nomeA.localeCompare(nomeB, 'pt', { sensitivity: 'base' });
        });
        setUsers(dataOrdenada);
        setFilteredUsers(dataOrdenada);
      } else {
        showBannerMessage('Erro ao carregar', 'error', 'Não foi possível carregar a lista de usuários.');
      }
    } catch (error) {
      console.error(error);
      showBannerMessage('Erro de conexão', 'error', 'Falha ao se comunicar com o servidor.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const usuario = data?.user || data;
        setUserSession(usuario);
        if (['Presidente', 'Vice-Presidente'].includes(usuario.role)) {
          setIsGestor(true);
        }
      });
  }, [fetchUsers]);
  useEffect(() => {
    if (abaSelecionada === 'gestoes' && !estruturaInicialCarregada && users.length > 0) {
      const anoMaisRecente = Math.max(...gestoes);
      if (gestaoSelecionada === anoMaisRecente) {
        const novaEstrutura = {
          Presidente: null,
          'Vice-Presidente': null,
          Diretores: {},
          Trainees: {},
          Conselheiros: [],
        };

        users.forEach(user => {
          const { role, auth_id, name, photo } = user;
          const membro = { id: auth_id, name, photo };

          if (role === 'Presidente') novaEstrutura.Presidente = membro;
          else if (role === 'Vice-Presidente') novaEstrutura['Vice-Presidente'] = membro;
          else if (role === 'Conselheiro') novaEstrutura.Conselheiros.push(membro);
          else if (role?.startsWith('Diretor') || role === 'Tesoureiro' || role === 'Secretário') {
            if (!novaEstrutura.Diretores[role]) novaEstrutura.Diretores[role] = [];
            novaEstrutura.Diretores[role].push(membro);
          } else if (role?.startsWith('Trainee')) {
            if (!novaEstrutura.Trainees[role]) novaEstrutura.Trainees[role] = [];
            novaEstrutura.Trainees[role].push(membro);
          }
        });

        setEstruturaGestao(novaEstrutura);
        setEstruturaInicialCarregada(true);
      }
    }
  }, [abaSelecionada, estruturaInicialCarregada, gestaoSelecionada, gestoes, users]);
  useEffect(() => {
    const isAnyModalOpen = isEditModalOpen || isGestaoModalOpen || modalCargoAberto;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditModalOpen, isGestaoModalOpen, modalCargoAberto]);
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

  if (!userSession) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-white">
        Carregando informações do usuário...
      </div>
    );
  }

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

  const abrirModalEdicao = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
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

        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-full font-medium text-sm transition ${abaSelecionada === 'usuarios' ? 'bg-red-800 text-white' : 'bg-gray-200 dark:bg-white/10 dark:text-white'}`}
            onClick={() => setAbaSelecionada('usuarios')}
          >
            Usuários
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium text-sm transition ${abaSelecionada === 'gestoes' ? 'bg-red-800 text-white' : 'bg-gray-200 dark:bg-white/10 dark:text-white'}`}
            onClick={() => setAbaSelecionada('gestoes')}
          >
            Diretoria
          </button>
        </div>

        <div className="relative">
          <div
            className={`transition-opacity duration-300 ease-in-out ${abaSelecionada === 'usuarios'
              ? 'opacity-100'
              : 'opacity-0 absolute inset-0 pointer-events-none'
              }`}
          >
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
            <div className="mt-8 space-y-4 max-w-9xl mx-auto">
              <div className="relative flex justify-between pr-6 pl-6 font-bold max-w-9xl mx-auto">
                <div className="w-[80px] text-center text-sm dark:text-white">Ativo</div>
                <div className="grid grid-cols-4 items-center gap-2 text-center flex-grow">
                  <div className="text-sm dark:text-white">Nome</div>
                  <div className="text-sm dark:text-white">Email</div>
                  <div className="text-sm dark:text-white">Cargo</div>
                  <div className="text-sm dark:text-white">Admin</div>
                </div>
                <div className="w-[80px] text-center text-sm dark:text-white">Ações</div>
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="relative flex items-center justify-between bg-white dark:bg-white/10 dark:border dark:border-white/10 rounded-xl shadow-md px-6 py-4"
                >
                  <div className="w-[80px] text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2 text-center flex-grow">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                    </div>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-sm">{user.role || 'Membro'}</div>
                    <div>
                      <label aria-label="Admin Toggle" className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.is_admin}
                          onChange={() => toggleAdmin(user.auth_id, user.is_admin)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${user.is_admin ? 'bg-green-600' : 'bg-gray-400'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.is_admin ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="w-[80px] flex justify-center items-center">
                    <div className="relative group w-fit h-fit">
                      <DotsThreeVertical size={24} className="text-gray-700 dark:text-white cursor-pointer" />
                      <div className="absolute right-0 top-6 w-40 bg-white dark:bg-[#0e1117] dark:border dark:border-white/10 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <button
                          onClick={() => abrirModalEdicao(user)}
                          className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm"
                        >
                          Informações
                        </button>
                        <button
                          onClick={() => toggleActive(user.auth_id, user.is_active)}
                          className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm"
                        >
                          {user.is_active ? 'Inativar usuário' : 'Ativar usuário'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`transition-opacity duration-300 ease-in-out ${abaSelecionada === 'gestoes'
              ? 'opacity-100'
              : 'opacity-0 absolute inset-0 pointer-events-none'
              }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6">
              {gestoes.map((ano) => (
                <button
                  key={ano}
                  type="button"
                  onClick={() => {
                    if (ano >= anoAtual) {
                      setGestaoSelecionada(ano);
                      setIsGestaoModalOpen(true);
                    }
                  }}
                  className={`relative rounded-xl p-6 flex items-center justify-center text-center transition-all duration-200 ease-in-out transform ${ano >= anoAtual
                    ? 'cursor-pointer bg-white dark:bg-white/10 shadow-md hover:scale-[1.03] hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/20'
                    : 'cursor-default bg-gray-200 dark:bg-white/5 opacity-50'
                    }`}
                  title={ano >= anoAtual ? 'Visualizar diretoria' : 'Dados históricos sem vínculo com usuários'}
                >
                  <h3 className="text-2xl font-bold text-red-800 dark:text-white">{ano}</h3>
                  {ano < anoAtual && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-300 pointer-events-none select-none">
                      Sem informações
                    </span>
                  )}
                  {ano > anoAtual && isGestor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGestoes(gestoes.filter(a => a !== ano));
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </button>
              ))}
              {isGestor && (
                <button
                  onClick={async () => {
                    const novoAno = Math.max(...gestoes) + 1;
                    setGestoes([...gestoes, novoAno]);

                    const token = localStorage.getItem('token');
                    const cargos = [];
                    if (estruturaGestao.Presidente)
                      cargos.push({ role: 'Presidente', user_id: estruturaGestao.Presidente.id });
                    if (estruturaGestao['Vice-Presidente'])
                      cargos.push({ role: 'Vice-Presidente', user_id: estruturaGestao['Vice-Presidente'].id });
                    (estruturaGestao.Conselheiros || []).forEach(c =>
                      cargos.push({ role: 'Conselheiro', user_id: c.id })
                    );
                    Object.entries(estruturaGestao.Diretores).forEach(([tipo, lista]) => {
                      (lista || []).forEach(d => {
                        if (d) cargos.push({ role: tipo, user_id: d.id });
                      });
                    });
                    Object.entries(estruturaGestao.Trainees).forEach(([tipo, lista]) => {
                      (lista || []).forEach(t => {
                        if (t) cargos.push({ role: tipo, user_id: t.id });
                      });
                    });

                    for (const c of cargos) {
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/gestao/${novoAno}/membro`, {
                        method: 'PUT',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(c)
                      });
                    }
                  }}
                  className="border-2 border-dashed border-red-800 dark:border-white/20 rounded-xl text-red-800 dark:text-white p-6 hover:bg-red-800/5"
                >
                  + Nova gestão
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
        className="relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] border-red-800 dark:border-red-500 transform transition-all duration-300 ease-in-out"
      >
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl mb-6 text-center font-bold text-red-800 dark:text-red-500">
          Editar Usuário
        </h2>

        {selectedUser && (
          <div className="space-y-4 text-sm dark:text-white">
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Nome:</strong> {selectedUser.name}</div>
            <div><strong>Curso:</strong> {selectedUser.course || '-'}</div>
            <div><strong>Telefone:</strong> {selectedUser.phone || '-'}</div>
            <div><strong>Data de adesão:</strong> {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</div>
            <div>
              <strong>Idade:</strong> {selectedUser.birthday ? calcularIdade(selectedUser.birthday) : '-'}
            </div>
          </div>
        )}

      </Modal>

      <Modal
        isOpen={isGestaoModalOpen}
        onRequestClose={() => setIsGestaoModalOpen(false)}
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
        className="relative bg-white dark:bg-[#0e1117] text-gray-900 dark:text-white p-4 rounded-xl shadow-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={() => setIsGestaoModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#B3090F] dark:hover:text-gray-200 text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2 text-red-800 dark:text-white text-center">Gestão {gestaoSelecionada}</h2>
        <div className="flex flex-col items-center gap-3 mt-3">
          <div className="flex flex-col items-center pb-2">
            <span className="font-bold text-red-800 dark:text-white mb-1">Presidente</span>
            {estruturaGestao['Presidente'] ? (
              <div className="flex flex-col items-center">
                <Image src={estruturaGestao['Presidente'].photo || '/placeholder.png'} alt='' width={40} height={40} className="w-16 h-16 rounded-full" />
                <p className="text-xs mt-1 text-gray-900 dark:text-white">{estruturaGestao['Presidente'].name}</p>
                <button
                  onClick={() => setEstruturaGestao(prev => ({ ...prev, Presidente: null }))}
                  className="text-red-700 dark:text-red-400 text-xs mt-1"
                >
                  Remover
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCargoSelecionado('Presidente');
                  setModalCargoAberto(true);
                }}
                className="rounded-full border-2 border-dashed dark:border-white/30 border-black/30 w-12 h-12 flex items-center justify-center dark:text-white text-black/30 text-2xl"
                title="Adicionar Presidente"
              >
                +
              </button>
            )}
          </div>
          <div className="w-1 h-5 bg-gray-300 dark:bg-white/20" />
          <div className="flex flex-row gap-6 justify-center pb-2">
            {/* Vice-Presidente */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-red-800 dark:text-white mb-1">Vice-Presidente</span>
              {estruturaGestao['Vice-Presidente'] ? (
                <div className="flex flex-col items-center">
                  <Image src={estruturaGestao['Vice-Presidente'].photo || '/placeholder.png'} alt="" width={40} height={40} className="w-14 h-14 rounded-full" />
                  <p className="text-xs mt-1 text-gray-900 dark:text-white">{estruturaGestao['Vice-Presidente'].name}</p>
                  <button
                    onClick={() => setEstruturaGestao(prev => ({ ...prev, ['Vice-Presidente']: null }))}
                    className="text-red-700 dark:text-red-400 text-xs mt-1"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCargoSelecionado('Vice-Presidente');
                    setModalCargoAberto(true);
                  }}
                  className="rounded-full border-2 border-dashed dark:border-white/30 border-black/30 w-10 h-10 flex items-center justify-center dark:text-white text-black/30 text-xl"
                  title="Adicionar Vice-Presidente"
                >
                  +
                </button>
              )}
            </div>
          </div>
          <div className="w-1 h-5 bg-gray-300 dark:bg-white/20" />
          <div className="flex flex-col items-center w-full pb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white">Diretores</span>
            </div>
            <div className="flex flex-wrap gap-3 w-full justify-center">
              {renderDiretores(estruturaGestao, setEstruturaGestao)}
              <button
                onClick={() => {
                  setCargoSelecionado({ tipo: 'Diretores', tipoDiretor: '' });
                  setModalCargoAberto(true);
                }}
                className="rounded-lg border-2 border-dashed dark:border-white/30 border-black/30 w-24 h-24 flex flex-col items-center justify-center dark:text-white text-black/30 text-2xl dark:bg-white/5 bg-gray-100 hover:bg-black/10 dark:hover:bg-white/10 transition"
                title="Adicionar Diretor"
              >
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center w-full pb-2 mt-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white">Trainees</span>
            </div>
            <div className="flex flex-wrap gap-3 w-full justify-center">
              {renderTrainees(estruturaGestao, setEstruturaGestao)}
              <button
                onClick={() => {
                  setCargoSelecionado({ tipo: 'Trainees', tipoTrainee: '' });
                  setModalCargoAberto(true);
                }}
                className="rounded-lg border-2 border-dashed dark:border-white/30 border-black/30 w-24 h-24 flex flex-col items-center justify-center dark:text-white text-black/30 text-2xl dark:bg-white/5 bg-gray-100 hover:bg-black/10 dark:hover:bg-white/10 transition"
                title="Adicionar Trainee"
              >
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center w-full pb-2 mt-4">
            <div className="flex items-center justify-center gap-2 mb-1">

              <span className="font-semibold text-gray-900 dark:text-white">Conselheiros</span>
            </div>
            <div className="flex flex-wrap gap-3 w-full justify-center">
              {renderConselheiros(estruturaGestao, gestaoSelecionada, setEstruturaGestao)}
              <button
                onClick={() => {
                  setCargoSelecionado('Conselheiro');
                  setModalCargoAberto(true);
                }}
                className="rounded-lg border-2 border-dashed dark:border-white/30 border-black/30 w-24 h-24 flex flex-col items-center justify-center dark:text-white text-black/30 text-2xl dark:bg-white/5 bg-gray-100 hover:bg-black/10 dark:hover:bg-white/10 transition"
                title="Adicionar Conselheiro"
              >
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <CustomButton
            onClick={async () => {
              const token = localStorage.getItem('token');
              const cargos = [];
              if (estruturaGestao.Presidente)
                cargos.push({ role: 'Presidente', user_id: estruturaGestao.Presidente.id });
              if (estruturaGestao['Vice-Presidente'])
                cargos.push({ role: 'Vice-Presidente', user_id: estruturaGestao['Vice-Presidente'].id });
              (estruturaGestao.Conselheiros || []).forEach(c =>
                cargos.push({ role: 'Conselheiro', user_id: c.id })
              );
              Object.entries(estruturaGestao.Diretores).forEach(([tipo, lista]) => {
                (lista || []).forEach((d) => {
                  if (d) cargos.push({ role: tipo, user_id: d.id });
                });
              });
              Object.entries(estruturaGestao.Trainees).forEach(([tipo, lista]) => {
                (lista || []).forEach((t) => {
                  if (t) cargos.push({ role: tipo, user_id: t.id });
                });
              });
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/gestao/${gestaoSelecionada}/membros`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              for (const c of cargos) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/gestao/${gestaoSelecionada}/membro`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(c)
                });
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${c.user_id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ role: c.role })
                });
              }
              setIsGestaoModalOpen(false);
              showBannerMessage('Estrutura da diretoria salva!', 'success');
              fetchUsers();
            }}
            className="bg-[#B3090F] hover:bg-red-600 text-white font-semibold"
          >
            Salvar gestão
          </CustomButton>
        </div>
      </Modal>

      <Modal
        isOpen={modalCargoAberto}
        onRequestClose={() => {
          setCargoSelecionado(null);
          setModalCargoAberto(false);
        }}
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-[60]"
        className="bg-white dark:bg-[#0e1117] p-4 rounded-lg shadow-lg max-w-lg w-full"
      >
        <h3 className="text-xl mb-2 text-center dark:text-white">
          Selecionar membro para: {getCargoLabel(cargoSelecionado)}
        </h3>
        {cargoSelecionado?.tipo === 'Diretores' && (
          <div className="mb-2">
            <CustomDropdown
              options={tiposDiretores.map(tipo => ({ value: tipo, label: tipo }))}
              value={cargoSelecionado.tipoDiretor || ''}
              onChange={opt =>
                setCargoSelecionado(cs => ({ ...cs, tipoDiretor: opt.value }))
              }
              placeholder="Selecione o tipo de Diretor"
            />
          </div>
        )}
        {cargoSelecionado?.tipo === 'Trainees' && (
          <div className="mb-2">
            <CustomDropdown
              options={tiposTrainees.map(tipo => ({ value: tipo, label: tipo }))}
              value={cargoSelecionado.tipoTrainee || ''}
              onChange={opt =>
                setCargoSelecionado(cs => ({ ...cs, tipoTrainee: opt.value }))
              }
              placeholder="Selecione o tipo de Trainee"
            />
          </div>
        )}
        <CustomField
          placeholder="Buscar por nome..."
          onChange={(e) => {
            if (typeof cargoSelecionado === 'string') {
              buscarUsuarios(e.target.value, cargoSelecionado);
            } else if (cargoSelecionado?.tipo === 'Diretores') {
              buscarUsuarios(e.target.value, cargoSelecionado.tipoDiretor || '');
            } else if (cargoSelecionado?.tipo === 'Trainees') {
              buscarUsuarios(e.target.value, cargoSelecionado.tipoTrainee || '');
            }
          }}
          name="busca"
        />
        {((cargoSelecionado?.tipo === 'Diretores' && !cargoSelecionado.tipoDiretor) ||
          (cargoSelecionado?.tipo === 'Trainees' && !cargoSelecionado.tipoTrainee)) && (
            <p className="text-sm text-red-700 dark:text-red-400 mt-2 text-center">Por favor, selecione o tipo antes de escolher um usuário.</p>
          )}
        {(cargoSelecionado?.tipo !== 'Diretores' || cargoSelecionado?.tipoDiretor) &&
          (cargoSelecionado?.tipo !== 'Trainees' || cargoSelecionado?.tipoTrainee) && (
            <div className="mt-3 max-h-60 overflow-y-auto">
              {(usuariosSugestoesKey => usuariosSugestoes[usuariosSugestoesKey] || [])(getUsuariosSugestoesKey(cargoSelecionado))
                .map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (isUsuarioJaAdicionado(user.auth_id)) {
                        showBannerMessage('Erro ao adicionar usuário', 'error', 'Usuário já foi adicionado em outro cargo');
                        return;
                      }
                      if (typeof cargoSelecionado === 'string') {
                        if (cargoSelecionado === 'Conselheiro') {
                          setEstruturaGestao(prev => ({
                            ...prev,
                            Conselheiros: [...(prev.Conselheiros || []), {
                              name: user.name,
                              photo: user.photo,
                              id: user.auth_id
                            }]
                          }));
                        } else {
                          setEstruturaGestao(prev => ({
                            ...prev,
                            [cargoSelecionado]: {
                              name: user.name,
                              photo: user.photo,
                              id: user.auth_id
                            }
                          }));
                        }
                      } else if (cargoSelecionado?.tipo === 'Diretores') {
                        const tipo = cargoSelecionado.tipoDiretor;
                        if (!tipo) {
                          showBannerMessage('Selecione o tipo de Diretor antes de adicionar.', 'error');
                          return;
                        }
                        setEstruturaGestao(prev => ({
                          ...prev,
                          Diretores: {
                            ...prev.Diretores,
                            [tipo]: [...(prev.Diretores[tipo] || []), { name: user.name, photo: user.photo, id: user.auth_id }]
                          }
                        }));
                      } else if (cargoSelecionado?.tipo === 'Trainees') {
                        const tipo = cargoSelecionado.tipoTrainee;
                        if (!tipo) {
                          showBannerMessage('Selecione o tipo de Trainee antes de adicionar.', 'error');
                          return;
                        }
                        setEstruturaGestao(prev => ({
                          ...prev,
                          Trainees: {
                            ...prev.Trainees,
                            [tipo]: [...(prev.Trainees[tipo] || []), { name: user.name, photo: user.photo, id: user.auth_id }]
                          }
                        }));
                      }
                      setModalCargoAberto(false);
                    }}
                    className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    <Image src={user.photo || '/placeholder.png'} alt={user.name || ''} width={40} height={40} className="w-10 h-10 rounded-full" />
                    <p className="text-xs mt-1 text-gray-800 dark:text-white">{user.name}</p>
                  </div>
                ))}
            </div>
          )}
      </Modal>
    </div>
  );
}

function calcularIdade(birthday) {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age + ' anos';
}

async function handleRemoveDiretor(estruturaGestao, setEstruturaGestao, tipo, diretorId) {
  setEstruturaGestao(prev => ({
    ...prev,
    Diretores: {
      ...prev.Diretores,
      [tipo]: prev.Diretores[tipo].filter((d) => d.id !== diretorId)
    }
  }));
  const token = localStorage.getItem('token');
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${diretorId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: null })
  });
}

function renderDiretores(estruturaGestao, setEstruturaGestao) {
  return Object.entries(estruturaGestao.Diretores)
    .filter(([tipo, lista]) => (lista && lista.length > 0))
    .map(([tipo, lista]) => (
      <div
        key={tipo}
        className={`dark:bg-white/5 bg-gray-100 rounded-lg p-3 flex flex-col items-center min-w-[140px] w-24 h-24 ${lista.length === 1 ? 'justify-center' : ''}`}
      >
        <span className="font-bold text-red-800 dark:text-white text-xs mb-2">{tipo}</span>
        {lista.map((diretor) => (
          <div key={diretor.id} className="flex flex-col items-center">
            <Image src={diretor.photo || '/placeholder.png'} alt="" width={40} height={40} className="rounded-full w-7 h-7" />
            <p className="text-xs mt-1 text-gray-900 dark:text-white">{diretor.name}</p>
            <button
              onClick={() => handleRemoveDiretor(estruturaGestao, setEstruturaGestao, tipo, diretor.id)}
              className="text-red-700 dark:text-red-400 text-xs mt-1"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    ));
}

async function handleRemoveTrainee(tipo, traineeId, setEstruturaGestao) {
  setEstruturaGestao(prev => ({
    ...prev,
    Trainees: {
      ...prev.Trainees,
      [tipo]: prev.Trainees[tipo].filter((t) => t.id !== traineeId)
    }
  }));

  const token = localStorage.getItem('token');
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${traineeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: null })
  });
}

function renderTrainees(estruturaGestao, setEstruturaGestao) {
  return Object.entries(estruturaGestao.Trainees)
    .filter(([tipo, lista]) => (lista && lista.length > 0))
    .map(([tipo, lista]) => (
      <div
        key={tipo}
        className={`dark:bg-white/5 bg-gray-100 rounded-lg p-3 flex flex-col items-center min-w-[140px] w-24 h-24 ${lista.length === 1 ? 'justify-center' : ''}`}
      >
        <span className="font-bold text-red-800 dark:text-white text-xs mb-2">{tipo}</span>
        {lista.map((trainee) => (
          <div key={trainee.id} className="flex flex-col items-center">
            <Image src={trainee.photo || '/placeholder.png'} alt="" width={40} height={40} className="rounded-full w-7 h-7" />
            <p className="text-xs mt-1 text-gray-900 dark:text-white">{trainee.name}</p>
            <button
              onClick={() => handleRemoveTrainee(tipo, trainee.id, setEstruturaGestao)}
              className="text-red-700 dark:text-red-400 text-xs mt-1"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    ));
}

async function handleRemoveConselheiro(conselheiroId, gestaoSelecionada, setEstruturaGestao) {
  const token = localStorage.getItem('token');
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/gestao/${gestaoSelecionada}/membro/Conselheiro?user_id=${conselheiroId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${conselheiroId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: null })
  });

  setEstruturaGestao(prev => ({
    ...prev,
    Conselheiros: (prev.Conselheiros || []).filter((c) => c.id !== conselheiroId)
  }));
}

function renderConselheiros(estruturaGestao, gestaoSelecionada, setEstruturaGestao) {
  return (estruturaGestao.Conselheiros || []).map((conselheiro) => (
    <div key={conselheiro.id} className="dark:bg-white/5 bg-gray-100 rounded-lg p-3 flex flex-col items-center min-w-[140px] w-24 h-24">
      <Image src={conselheiro.photo || '/placeholder.png'} alt='' width={40} height={40} className="w-10 h-10 rounded-full" />
      <p className="text-xs mt-1 text-gray-900 dark:text-white">{conselheiro.name}</p>
      <button
        onClick={() => handleRemoveConselheiro(conselheiro.id, gestaoSelecionada, setEstruturaGestao)}
        className="text-red-700 dark:text-red-400 text-xs mt-1"
      >
        Remover
      </button>
    </div>
  ));
}

function getCargoLabel(cargoSelecionado) {
  let label = '';
  if (typeof cargoSelecionado === 'string') {
    label = cargoSelecionado;
  } else if (cargoSelecionado?.tipo === 'Diretores') {
    label = 'Diretor';
  } else if (cargoSelecionado?.tipo === 'Trainees') {
    label = 'Trainee';
  }
  return label;
}

function getUsuariosSugestoesKey(cargoSelecionado) {
  if (typeof cargoSelecionado === 'string') {
    return cargoSelecionado;
  } else if (cargoSelecionado?.tipo === 'Diretores') {
    return cargoSelecionado.tipoDiretor || '';
  } else if (cargoSelecionado?.tipo === 'Trainees') {
    return cargoSelecionado.tipoTrainee || '';
  }
  return '';
}

import withAdminProtection from '../../utils/withAdminProtection';
export default withAdminProtection(UsersPage);