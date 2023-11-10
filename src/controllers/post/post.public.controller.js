async function postPublicController(fastify) {
    fastify.get(
        '/post/list',
        {
            // TODO: schema
        },
        async (req, rep) => {
             let type;
            if (!req.user.uuid) {
                type = "public"
            }
            const results = await req.services.post.list(req.query.page, req.query.size, req.query.tags, type);
            rep.send(results);
        },
    );

    fastify.get(
        '/post/:uuid',
        {
            // TODO: schema
        },
        async (req, rep) => {
             let type;
            if (!req.user.uuid) {
                type = "public"
            }
            const q = {uuid: req.params.uuid}
            if(type) {
                q.type = type
            }
            const post = await req.services.post.get(q);
            if(!post || post.status === "deleted") {
                const err = new Error('post.notFound');
                err.statusCode = 404;
                throw err;
            }

            rep.send(result);
        },
    );
}

module.exports = postPublicController;