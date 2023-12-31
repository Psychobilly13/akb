const accessByToken = require('../../access/grandByToken');

async function userController(fastify) {
  fastify.addHook('preHandler', accessByToken);
  fastify.put(
      '/user/:uuid',
      {
        schema: {
          params: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                format: 'uuid',
              },
            },
            required: ['uuid'],
          },
          body: {
            type: 'object',
            required: ['nickname'],
            properties: {
              nickname: {type: 'string', minLength: 4},
            },
            additionalProperties: false,
          },
        },
      },
      async (req, _rep) => {
        await req.services.user.update(req.params.uuid, req.body);
      },
  );

  fastify.get(
      '/user/list',
      {
        schema: {
          query: {
            type: 'object',
            properties: {
              page: {type: 'integer'},
              size: {type: 'integer'},
            },
          },
        },
      },
      async (req, rep) => {
        const results = await req.services.user.list(req.query.page, req.query.size);
        rep.send(results);
      },
  );

  fastify.get(
      '/user/:uuid',
      {
        schema: {
          params: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                format: 'uuid',
              },
            },
            required: ['uuid'],
          },
        },
      },
      async (req, rep) => {
        const user = await req.services.user.get({uuid: req.params.uuid});
        if (!user || user.status === 'deleted') {
          const err = new Error('user.notFound');
          err.statusCode = 404;
          throw err;
        }
        rep.send(user);
      },
  );

  fastify.delete(
      '/user/:uuid',
      {
        schema: {
          params: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                format: 'uuid',
              },
            },
            required: ['uuid'],
          },
        },
      },
      async (req, _rep) => {
        await req.services.user.remove(req.params.uuid);
      },
  );
}

module.exports = userController;
