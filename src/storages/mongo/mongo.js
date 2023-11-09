const {default: mongoose} = require('mongoose');
const fastifyPlugin = require('fastify-plugin');
const env = require('../../utils/env');

function mongoConnect(
    fastify,
    _opts,
    done,
) {
  const url = env("MONGODB_URL", 'mongodb://127.0.0.1:27017/akb')
  mongoose.set('strictQuery', false);
  mongoose.connection.on('reconnected', () => {
    console.error('> MongoDB reconected');
  });

  mongoose.connection.on('disconnected', () => {
    console.error(`> MongoDB disconnected`);
  });

  mongoose.connection.on('open', () => {
    console.log(`> MongoDB connected > ${url}`);
  });

  try {
    
    const connection = mongoose.connect(url);
    fastify.decorate('mongoose', connection);
    done();
  } catch (err) {
    console.error('> failed connecting to MongoDB:', err);
  }
}

module.exports = fastifyPlugin(function(fastify, opts, done) {
  mongoConnect(fastify, opts, done);
  done();
});
