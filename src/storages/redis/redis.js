const Redis = require('ioredis');
const env = require('../../utils/env');

const host = env("REDIS_HOST", 'localhost');
const port = env("REDIS_PORT", 6379);

function buildRedis() {
  const redisClient = new Redis({
    host,
    port,
  });

  redisClient.on('ready', () => {
    console.log(`> Redis connected > ${host}:${port}`);
  });

  redisClient.on('error', (err) => {
    console.log({msg: 'Redis error', err});
  });

  redisClient.on('end', (err) => {
    // emits after close when no more reconnections will be made,
    // or the connection is failed to establish.
    console.log({msg: 'Redis connection fail', err});
    throw new Error('redis.connection.fail');
  });

  redisClient.on('reconnecting', (err) => {
    console.log({msg: 'Redis reconnecting', err});
  });

  return redisClient;
}


module.exports = buildRedis;
