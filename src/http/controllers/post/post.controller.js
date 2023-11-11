const accessByToken = require('../../access/grandByToken');

async function postController(fastify) {
  fastify.addHook('preHandler', accessByToken);

  fastify.post(
      '/post',
      {
        schema: {
           body: {
             type: 'object',
             required: ['title', 'content', 'status', 'type'],
             properties: {
              title: { type: 'string', minLength: 1},
              content: { type: 'string'},
              status:  { type: 'string'},
              type:  { type: 'string'},
              tags: {
                type: 'array',
                items: { type: 'string' }
              }
             },
             additionalProperties: false,
           }
         },
       },
      async (req, _rep) => {
        await req.services.post.create(req.body, req.user.uuid);
      },
  );

  fastify.put(
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
           body: {
             type: 'object',
             properties: {
              title: { type: 'string', minLength: 1},
              content: { type: 'string'},
              status:  { type: 'string'},
              type:  { type: 'string'},
              tags: {
                type: 'array',
                items: { type: 'string' }
              }
             },
             additionalProperties: false,
           }
         },
       },
      async (req, _rep) => {
        await req.services.post.update(req.params.uuid, req.body);
      },
  );

  fastify.delete(
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
          }
         },
       },
      async (req, _rep) => {
        await req.services.post.remove(req.params.uuid);
      });
}

module.exports = postController;
