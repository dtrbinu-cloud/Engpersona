const { start } = require('./app');

start().catch((error) => {
  console.error('[STARTUP ERROR]', error);
  process.exitCode = 1;
});
