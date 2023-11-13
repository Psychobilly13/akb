const redisProvider = require('../../storages/redis/redis');
const {mongoConnect} = require('../../storages/mongo/mongo');
const authController = require('./auth');
const userController = require('./user');
const userService = require('../../services/user');
const authService = require('../../services/auth');
const postService = require('../../services/post');
const fastifyCookie = require('@fastify/cookie');
const fastifySchemaValidator = require('@fastify/response-validation');
const env = require('../../utils/env');
const postController = require('./post/post.controller');
const postPublicController = require('./post/post.public.controller');


async function bootstrap() {
  const host = env('API_HOST', 'localhost');
  const port = env('API_PORT', 8080);
  const fastify = require('fastify')({
    logger: true,
  });

  // dbs
  const redis = redisProvider();
  mongoConnect();

  // services
  fastify.addHook('onRequest', (req, _rep, done) => {
    req.user = {};
    req.services = {};
    done();
  });
  fastify.addHook('preHandler', (req, _res, next) => {
    const user = userService();
    const auth = authService(user, redis);
    const post = postService();
    req.services = {auth, user, post};
    next();
  });

  fastify
      .register(authController)
      .register(postController)
      .register(postPublicController)
      .register(userController)
      .register(fastifyCookie)
      .register(fastifySchemaValidator);
  try {
    await fastify.listen({host, port});
    console.debug(`> Server running > ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify;
}

module.exports = bootstrap;
