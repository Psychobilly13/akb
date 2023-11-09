const {formatUserToPublic} = require('../../services/auth/utils/formatter');
const { cookieSetAuthTokens, cookieDelAuthTokens } = require('./utils/cookie');
const accessByToken = require('./utils/grandByToken');

async function authController(fastify) {
  fastify.post(
      '/auth/register',
      {
        // TODO: schema
      },
      async (req, rep) => {
        const user = await req.services.user.create(req.body);

        const publicUser = formatUserToPublic(user);

        const authSession = await req.services.auth.createAuthSession(publicUser);
        rep.send(authSession.tokens);
      },
  );
  fastify.post(
      '/auth/login',
      {
        // TODO: schema
      },
      async (req, rep) => {
        const user = await req.services.auth.authByPassword(req.body);
        if (user) {
          const publicUser = formatUserToPublic(user);
          const authSession = await req.services.auth.createAuthSession(publicUser);

          cookieSetAuthTokens(req, rep, authSession.tokens);

          rep.send(authSession.tokens);
        }
      },
  );
  fastify.post(
      '/auth/logout',
      {
        // TODO: schema
      },
      async (req, rep) => {
        // TODO: this function here for test. should do preHandler with postController
        await accessByToken(req, rep)
        cookieDelAuthTokens(req, rep)
      },
  );
}

module.exports = authController;
