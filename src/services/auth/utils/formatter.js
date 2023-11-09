function formatUserToPublic(user) {
  return {
    uuid: user.uuid,
    nickname: user.nickname,
  };
}

module.exports = {formatUserToPublic};
