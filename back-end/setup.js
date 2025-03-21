const fs = require('fs');
const path = require('path');

// Função para criar pasta e arquivos
const createDirectoryStructure = () => {
  const structure = {
    "src": {
      "routes": {
        "auth.routes.js": "",
      },
      "controllers": {
        "auth.controller.js": "",
      },
      "services": {
        "user.service.js": "",
      },
      "utils": {
        "hash.js": "",
      },
      "db.js": "",
      "app.js": "",
    },
    ".env": "",
    "server.js": "",
    "package.json": "",
  };

  // Função recursiva para criar arquivos e pastas
  const createFiles = (folder, structure) => {
    for (const [key, value] of Object.entries(structure)) {
      const fullPath = path.join(folder, key);
      if (typeof value === 'object') {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath);
        }
        createFiles(fullPath, value);
      } else {
        if (!fs.existsSync(fullPath)) {
          fs.writeFileSync(fullPath, value, 'utf8');
        }
      }
    }
  };

  createFiles('./', structure);  // Corrigido o caminho da pasta 'back-end'
  console.log('Estrutura criada com sucesso!');
};

// Criar a estrutura do projeto
createDirectoryStructure();