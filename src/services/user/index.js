const {createHash} = require('node:crypto');
const {default: mongoose} = require('mongoose');
const {v4: uuidv4} = require('uuid');
const {genUnixTs} = require('../../utils/date');

const {Schema} = mongoose;

const userSchema = new Schema({
  uuid: {type: String, required: true},
  dates: {
    created: {type: Number, required: true},
    updated: {type: Number, required: true},
  },
  nickname: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  status: {
    type: String,
    enum: ['active', 'blocked', 'deleted'],
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

function UserService() {
  async function create(data) {
    data.email = data.email.toLowerCase().trim();
    const user = await get({email: data.email});
    if (user) {
      const err = new Error('user.alreadyExist');
      err.statusCode = 422;
      throw err;
    }
    data.password = createHash('sha256').update(data.password).digest('hex');

    const createdUser = await User.create({
      uuid: uuidv4(),
      status: 'active',
      dates: {
        created: genUnixTs(),
        updated: genUnixTs(),
      },
      ...data,
    });
    return createdUser.toObject();
  }

  async function update(uuid, data) {
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }
    const user = await get({uuid});
    if (!user || user.status === 'deleted') {
      const err = new Error('user.notFound');
      err.statusCode = 404;
      throw err;
    }
    user.dates.updated = genUnixTs();
    const updatedData = {...user, ...data};
    await User.updateOne({uuid: updatedData.uuid}, updatedData);
  }

  async function remove(uuid) {
    const user = await get({uuid});
    if (!user || user.status === 'deleted') {
      const err = new Error('user.notFound');
      err.statusCode = 404;
      throw err;
    }
    const updatedData = {...user, status: 'deleted'};
    await User.updateOne({uuid: user.uuid}, updatedData);
  }

  async function get(keyVal) {
    const user = await User.findOne(keyVal, {_id: 0, __v: 0});
    return user?.toObject();
  }

  function list() {
    // TODO: list getting
    console.log('list');
  }

  return {create, update, remove, get, list};
}

module.exports = UserService;
