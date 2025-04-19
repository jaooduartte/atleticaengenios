// src/lib/mocks.js

export const useMockSession = () => ({
  data: {
    user: {
      id: 1,
      name: "Admin Mock",
      email: "admin@example.com",
      isAdmin: true,
    },
  },
  status: "authenticated",
});

export const mockToast = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  loading: (msg) => console.log(`⏳ ${msg}`),
  dismiss: () => {},
};

const mockUsers = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@example.com",
    course: "Engenharia",
    gender: "Masculino",
    is_admin: true,
    profile_image: null,
  },
  {
    id: 2,
    name: "João Silva",
    email: "joao@example.com",
    course: "Ciência da Computação",
    gender: "Masculino",
    is_admin: false,
    profile_image: null,
  },
  {
    id: 3,
    name: "Maria Souza",
    email: "maria@example.com",
    course: "Medicina",
    gender: "Feminino",
    is_admin: false,
    profile_image: null,
  },
];

export const mockAPI = {
  fetchUsers: () =>
    new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500)),
  updateUser: (id, data) =>
    new Promise((resolve) =>
      setTimeout(() => {
        const updatedUser = { ...data, id };
        console.log("Usuário atualizado:", updatedUser);
        resolve(updatedUser);
      }, 300)
    ),
  deleteUser: (id) =>
    new Promise((resolve) =>
      setTimeout(() => {
        console.log("Usuário deletado:", id);
        resolve(id);
      }, 300)
    ),
};
