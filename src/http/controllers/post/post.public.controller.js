const accessByToken = require('../../access/grandByToken');

async function postPublicController(fastify) {
  fastify.get(
      '/post/list',
      {
        schema: {
          query: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              size: { type: 'integer' },
              tags: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        },
      },
      async (req, rep) => {
        let type;
        try {
          await accessByToken(req, rep);
        } catch (err) {
          type = 'public';
        }
        const results = await req.services.post.list(req.query.page, req.query.size, req.query.tags, type);
        rep.send(results);
      },
  );

  fastify.get(
      '/post/:uuid',
      {
        schema: {
          params: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                format: 'uuid'
              }
            },
            required: ['uuid']
          },
        },
      },
      async (req, rep) => {
        let type;
        try {
          await accessByToken(req, rep);
        } catch (err) {
          type = 'public';
        }
        const q = {uuid: req.params.uuid};
        if (type) {
          q.type = type;
        }
        const post = await req.services.post.get(q);
        if (!post || post.status === 'deleted') {
          const err = new Error('post.notFound');
          err.statusCode = 404;
          throw err;
        }

        rep.send(post);
      },
  );
}

module.exports = postPublicController;
