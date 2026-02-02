import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 CRM Backend Server Started`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log('===========================================');
  console.log(`\n📍 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health\n`);
});
