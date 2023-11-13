const env = require('./env');

describe('unit:utils', () => {
  test('function should set data if it don\'t exist', async () => {
    try {
      env('UNEXISTING_FIELD');
    } catch (err) {
      expect(err.message).toEqual('env.UNEXISTING_FIELD.notFound');
    }
    expect(env('UNEXISTING_FIELD', 'test')).toEqual('test');
  });
});
