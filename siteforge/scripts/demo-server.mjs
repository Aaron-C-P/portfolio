// Starts the Webber for local testing: in-memory Postgres (nothing written to disk), local file storage, an admin account.
process.env.DB_MEMORY = '1';
process.env.PORT = process.env.PORT || '3077';
process.env.APP_URL = `http://localhost:${process.env.PORT}`;
process.env.ADMIN_EMAILS = 'admin@demo.test';
process.env.STORAGE_DRIVER = 'local';
process.env.DATA_DIR = process.env.DATA_DIR || (await import('node:os')).tmpdir() + '/webber-demo';
const { app } = await import('../src/server.js');
app.listen(Number(process.env.PORT), () => console.log('Webber demo on', process.env.APP_URL, '(admin: admin@demo.test)'));
