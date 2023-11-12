const {createHash, randomBytes} = require('node:crypto');
const {genUnixTs} = require('../../utils/date');
const env = require('../../utils/env');

function AuthService(userService, redisProvider) {
  const tokenLength = parseInt(env('TOKEN_LENGTH', 32));
  const tokenExpire = parseInt(env('TOKEN_EXPIRE', 15778800));

  /**
   * @param {{
   * email: string,
   * password: string,
   * }} data
   * @return {Promise<{
   *   uuid: string,
   *   dates: { created: number, updated: number },
   *   nickname: string,
   *   email: string,
   *   password: string,
   *   status: string,
   * }>}
   */
  async function authByPassword(data) {
    const email = data.email.toLowerCase().trim();
    const user = await userService.get({email});
    if (!user || user.status === 'deleted') {
      const err = new Error('user.notFound');
      err.statusCode = 404;
      throw err;
    }
    const hashPass = createHash('sha256').update(data.password).digest('hex');
    if (hashPass !== user.password) {
      const err = new Error('user.passwordNotRight');
      err.statusCode = 401;
      throw err;
    }
    return user;
  }

  // TODO: JSDocs for session logic
  /**
   * @param {number} length
   * @return {string}
   */
  function generateToken(length) {
    return randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
  }

  async function changeAuthTokenPairByRefreshToken(token) {
    const user = await getSessionUserByRefreshToken(token);
    if (!user) {
      const err = new Error('auth.invalidToken');
      err.statusCode = 401;
      throw err;
    }
    return createAuthSession(user);
  }

  async function createAuthSession(user) {
    const puttingUser = await putUserSession(user);

    const pair = {
      access: {
        token: generateToken(tokenLength),
        expire: genUnixTs() + tokenExpire,
      },
      refresh: {
        token: generateToken(tokenLength),
        expire: genUnixTs() + tokenExpire,
      },
    };

    await putAuthTokenPair(user.uuid, pair);

    return {user: puttingUser, tokens: pair};
  }

  async function putUserSession(user) {
    await redisProvider.hmset(`session:user:${user.uuid}`, {
      ...user,
    });
    return user;
  }

  async function putAuthTokenPair(
      uuidUser,
      pair,
  ) {
    const {access, refresh} = pair;
    redisProvider
        .hmset(`session:token:access:${access.token}`, {
          uuidUser,
          refreshToken: refresh.token,
          expire: access.expire,
        })
        .then();
    redisProvider
        .hmset(`session:token:refresh:${refresh.token}`, {
          uuidUser,
          accessToken: access.token,
          expire: access.expire,
        })
        .then();
    redisProvider.lpush(`session:user:${uuidUser}:tokens`, [
      `a:${access.token}`,
      `r:${refresh.token}`,
    ]);
  }

  async function getAuthUser(uuid) {
    const user = await redisProvider.hgetall(`session:user:${uuid}`);
    if (!(user && Object.keys(user).length)) {
      return undefined;
    }
    return user;
  }

  async function getAccessTokenData(token) {
    const foundToken = redisProvider.hgetall(
        `session:token:access:${token}`,
    );
    return foundToken;
  }

  async function getRefreshTokenData(token) {
    const foundToken = redisProvider.hgetall(
        `session:token:refresh:${token}`,
    );
    return foundToken;
  }

  async function getSessionUserByAccessToken(
      token,
  ) {
    const {uuidUser: uuid} = (await getAccessTokenData(token)) || {};
    if (!uuid) {
      return undefined;
    }
    const user = await getAuthUser(uuid);
    return user;
  }

  async function getSessionUserByRefreshToken(
      token,
  ) {
    const {uuidUser: uuid} = (await getRefreshTokenData(token)) || {};
    if (!uuid) {
      return undefined;
    }
    const user = await getAuthUser(uuid);
    return user;
  }

  return {authByPassword, createAuthSession, getSessionUserByAccessToken, changeAuthTokenPairByRefreshToken};
}

module.exports = AuthService;
