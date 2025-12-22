// Patch para compatibilidade com Node.js
if (typeof process.getBuiltinModule === 'undefined') {
  process.getBuiltinModule = function(name) {
    try {
      return require('node:' + name);
    } catch (e) {
      try {
        return require(name);
      } catch (e2) {
        return null;
      }
    }
  };
}

// Importar o server original
require('./server');