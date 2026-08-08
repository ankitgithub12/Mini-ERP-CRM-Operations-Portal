const app = require('./app');
const { port, nodeEnv } = require('./config/env');

app.listen(port, () => {
  console.log(`\n🚀 Server running in ${nodeEnv} mode on port ${port}`);
  console.log(`📡 API: http://localhost:${port}/api`);
  console.log(`❤️  Health: http://localhost:${port}/api/health\n`);
});
