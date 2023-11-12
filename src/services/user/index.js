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
  /**
 * @param {{
 *   nickname: string,
  *   email: string,
  *   password: string
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

  /**
   * @param {string} uuid
   * @param {{nickname: string}} data
   */
  async function update(uuid, data) {
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

  /**
   * @param {string} uuid
   */
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

  /**
 * @param {Record<string, string>} keyVal
 * @return {Promise<{
 *   uuid: string,
 *   dates: { created: number, updated: number },
 *   nickname: string,
 *   email: string,
 *   password: string,
 *   status: string,
 * }>}
 */
  async function get(keyVal) {
    const user = await User.findOne(keyVal, {_id: 0, __v: 0});
    return user?.toObject();
  }

  /**
 * @param {number} page
 * @param {number} size
 * @return {Promise<{
 *   results: [{
  *     uuid: string,
  *     dates: { created: number, updated: number },
  *     nickname: string,
  *     email: string,
  *     password: string,
  *     status: string
  *   }],
  *   settings: {
  *     page: number,
  *     size: number,
  *     count: number
  *   }
  * }>}
  */
  async function list(page = 1, size = 10) {
    const q = {
      status: {$ne: 'deleted'},
    };

    const [results, count] = await _findAndCountManyByQuery(q, {
      limit: size,
      skip: (page - 1) * size,
    });

    return {results, settings: {page, size, count}};
  }

  // TODO: maybe should think about BaseService for methods like this
  /**
 * @param {Record<string, any>} query
 * @param {Record<string, any>} options
 * @return {Promise<{
 *   results: [{
 *     uuid: string,
 *     dates: { created: number, updated: number },
 *     nickname: string,
 *     email: string,
 *     password: string,
 *     status: string
 *   }],
 *   count: number
 * }>}
 */
  async function _findAndCountManyByQuery(
      query,
      options,
  ) {
    const count = await User.countDocuments(query);
    const results = await User.find(
        query,
        {_id: 0, __v: 0},
        {lean: true, ...options},
    );

    return [results, count];
  }

  return {create, update, remove, get, list};
}

module.exports = UserService;
