function formatUserToPublic(user) {
  return {
    uuid: user.uuid,
    email: user?.email,
    nickname: user.nickname,
  };
}

module.exports = {formatUserToPublic};
