import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`🚀 E-Certificate Verifier Backend Server listening on http://localhost:${config.port}`);
  console.log(`🔒 Environment: ${config.nodeEnv}`);
});

export default server;
