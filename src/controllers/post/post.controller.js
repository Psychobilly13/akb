const accessByToken = require('../access/grandByToken');

async function postController(fastify) {
    fastify.addHook('preHandler', accessByToken);

    fastify.post(
        '/post',
        {
            // TODO: schema
        },
        async (req, _rep) => {
            await req.services.post.create(req.body, req.user.uuid);
        },
    );

    fastify.put(
        '/post/:uuid',
        {
            // TODO: schema
        },
        async (req, _rep) => {
            await req.services.post.update(req.params.uuid, req.body);
        },
    );

    fastify.delete(
        '/post/:uuid',
        {
            // TODO: schema
        },
        async (req, _rep) => {
            await req.services.post.remove(req.params.uuid);
        },)
}

module.exports = postController;
