// Lightweight launcher to run Nest backend with ts-node in CJS context
require('ts-node').register({ transpileOnly: true, project: __dirname + '/../tsconfig.backend.json' });
require('tsconfig-paths').register();
require('../src/backend/main.ts');
