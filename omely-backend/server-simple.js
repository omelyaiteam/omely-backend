console.log('🚀 Starting server initialization...');

try {
  const express = await import("express");
  console.log('✅ Express imported successfully');

  const cors = await import("cors");
  console.log('✅ CORS imported successfully');

  const app = express.default();
  app.use(cors.default());
  app.use(express.default.json());

  app.get('/health', (req, res) => {
    console.log('📡 Health endpoint called');
    res.json({ status: 'OK', message: 'Server is running!' });
  });

  app.post('/test', (req, res) => {
    console.log('📝 Test endpoint called');
    res.json({ status: 'success', received: req.body });
  });

  const PORT = 3000;
  const HOST = '127.0.0.1';

  console.log(`🔄 Attempting to start server on ${HOST}:${PORT}...`);

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Simple server listening on ${HOST}:${PORT}`);
    console.log(`📡 Health: http://${HOST}:${PORT}/health`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });

  server.on('listening', () => {
    console.log('✅ Server is listening successfully');
  });

  // Gestionnaire d'erreurs global
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Error during server initialization:', error);
  process.exit(1);
}
