const {default: mongoose} = require('mongoose');
const {genUnixTs} = require('../../utils/date');
const {v4: uuidv4} = require('uuid');

const {Schema} = mongoose;

const postSchema = new Schema({
  uuid: {type: String, required: true},
  ids: {
    uuidUser: {type: String, required: false},
  },
  dates: {
    created: {type: Number, required: true},
    updated: {type: Number, required: true},
  },
  title: {type: String, required: true},
  content: {type: String, required: true},
  status: {
    type: String,
    enum: ['open', 'hidden', 'deleted', 'blocked'],
    required: true,
  },
  type: {
    type: String,
    enum: ['private', 'public'],
    required: true,
  },
  tags: {
    type: [String],
    required: false,
  },
});

const Post = mongoose.model('Post', postSchema);

function PostService() {
  async function create(data, uuidUser) {
    const createdPost = await Post.create({
      uuid: uuidv4(),
      ids: uuidUser ? {uuidUser} : {},
      status: 'open',
      dates: {
        created: genUnixTs(),
        updated: genUnixTs(),
      },
      ...data,
    });
    return createdPost.toObject();
  }

  async function update(uuid, data) {
    const post = await get({uuid});
    if (!post || post.status === 'deleted') {
      const err = new Error('post.notFound');
      err.statusCode = 404;
      throw err;
    }
    post.dates.updated = genUnixTs();
    const updatedData = {...post, ...data};
    await Post.updateOne({uuid: updatedData.uuid}, updatedData);
  }

  async function remove(uuid) {
    const post = await get({uuid});
    if (!post || post.status === 'deleted') {
      const err = new Error('post.notFound');
      err.statusCode = 404;
      throw err;
    }
    const updatedData = {...post, status: 'deleted'};
    await Post.updateOne({uuid: updatedData.uuid}, updatedData);
  }

  async function get(keyVal) {
    const post = await Post.findOne(keyVal, {_id: 0, __v: 0});
    return post?.toObject();
  }

  async function list(page = 1, size = 10, tags, type) {
    const q = {
      status: {$ne: 'deleted'},
    };

    if (tags) {
      q.tags = {$all: tags};
    }
    if (type) {
      q.type = type;
    }

    const [results, count] = await _findAndCountManyByQuery(q, {
      limit: size,
      skip: (page - 1) * size,
    });

    return {results, settings: {page, size, count}};
  }

  // TODO: maybe should think about BaseService for methods like this
  async function _findAndCountManyByQuery(
      query,
      options,
  ) {
    const count = await Post.countDocuments(query);
    const results = await Post.find(
        query,
        {_id: 0, __v: 0},
        {lean: true, ...options},
    );

    return [results, count];
  }

  return {create, update, remove, list, get};
}

module.exports = PostService;
