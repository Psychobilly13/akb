const {formatUserToPublic} = require('../../../services/auth/utils/formatter');
const {cookieSetAuthTokens, cookieDelAuthTokens} = require('./utils/cookie');

async function authController(fastify) {
  fastify.post(
      '/auth/register',
      {
        schema: {
          body: {
            type: 'object',
            required: ['nickname', 'email', 'password'],
            properties: {
              nickname: {type: 'string', minLength: 4},
              email: {type: 'string', minLength: 6},
              password: {type: 'string', minLength: 6},
            },
            additionalProperties: false,
          },
        },
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
        schema: {
          body: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {type: 'string', minLength: 6},
              password: {type: 'string', minLength: 6},
            },
            additionalProperties: false,
          },
        },
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
      '/auth/refresh',
      {},
      async (req, rep) => {
        const token = req.cookies.refresh_token ?? req.headers.authorization;
        const user = await req.services.auth.changeAuthTokenPairByRefreshToken(token);
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
      {},
      async (req, rep) => {
        cookieDelAuthTokens(req, rep);
      },
  );
}

module.exports = authController;
