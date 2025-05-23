const fs = require('fs');
const path = require('path');

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

  const createFiles = (folder, structure) => {
    for (const [key, value] of Object.entries(structure)) {
      const fullPath = path.join(folder, key);
      if (typeof value === 'object') {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath);
        }
        createFiles(fullPath, value);
      } else if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, value, 'utf8');
      }
    }
  };

  createFiles('./', structure);
  console.log('Estrutura criada com sucesso!');
};

createDirectoryStructure();