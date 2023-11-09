const redisProvider = require('../storages/redis/redis');
const mongoProvider = require('../storages/mongo/mongo');
const authController = require('./auth');
const userService = require('../services/user');
const authService = require('../services/auth');
const fastifyCookie = require('@fastify/cookie');
const env = require('../utils/env');

async function bootstrap() {
  const host = env("API_HOST", "localhost")
  const port = env("API_PORT", 8080)
  const fastify = require('fastify')({
    logger: true,
  });

  // services
  const redis = redisProvider();
  const user = userService();
  const auth = authService(user, redis);

  fastify.addHook('preHandler', (req, _res, next) => {
    req.services = {auth, redis, user};
    next();
  });

  fastify
      .register(mongoProvider)
      .register(authController)
      .register(fastifyCookie);
  // TODO:
  //   .register(postController);
  try {
    await fastify.listen({host,port});
    // const address = fastify.server.address();
    // const port = typeof address === 'string' ? address : address?.port;
    console.debug(`> Server running > ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify;
}

module.exports = bootstrap;
