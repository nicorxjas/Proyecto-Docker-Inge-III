const { spawn } = require('child_process');
const path = require('path');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

(async () => {
  try {
    await run('node', [path.join(__dirname, 'waitForDb.js')]);
    if (process.env.SKIP_ETL !== 'true') {
      await run('node', [path.join('etl', 'fetchAndLoad.js')], { cwd: path.join(__dirname, '..') });
    }
    await run('node', [path.join('server', 'index.js')], { cwd: path.join(__dirname, '..') });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
})();
