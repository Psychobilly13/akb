const {default: mongoose} = require('mongoose');
const env = require('../../utils/env');

function mongoConnect(
) {
  const url = env('MONGODB_URL', 'mongodb://127.0.0.1:27017/akb');
  mongoose.set('strictQuery', false);
  mongoose.connection.on('reconnected', () => {
    console.log('> MongoDB reconected');
  });

  mongoose.connection.on('disconnected', () => {
    console.log(`> MongoDB disconnected`);
  });

  mongoose.connection.on('open', () => {
    console.log(`> MongoDB connected > ${process.env.MONGO_URL || url}`);
  });

  try {
    mongoose.connect(process.env.MONGO_URL || url);
  } catch (err) {
    console.error('> failed connecting to MongoDB:', err);
  }
}

function mongoDisconnect() {
  return mongoose.disconnect();
}

module.exports = {mongoConnect, mongoDisconnect};
