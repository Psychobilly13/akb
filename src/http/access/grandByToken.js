const accessByToken = async (
    req,
    _rep,
) => {
  const authToken = req.cookies.authorization_token ?? req.headers.authorization;

  if (!authToken) {
    const err = new Error('auth.invalidToken');
    err.statusCode = 401;
    throw err;
  }

  return assignUser(req, authToken);
};

async function assignUser(
    req,
    authToken,
) {
  const [type, access] = authToken.split(' ');
  if (type !== 'Bearer' || !access) {
    const err = new Error('auth.invalidToken');
    err.statusCode = 401;
    throw err;
  }

  const user = await req.services.auth.getSessionUserByAccessToken(access);
  if (!user) {
    const err = new Error('auth.invalidToken');
    err.statusCode = 401;
    throw err;
  }

  req.user = user;
}

module.exports = accessByToken;
