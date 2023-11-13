const {formatUserToPublic} = require('./formatter');

describe('unit:auth.utils', () => {
  test('authorization should be success', async () => {
    const result = formatUserToPublic({uuid: 'test', email: 'test', nickname: 'test', password: 'test'});
    expect(result).toEqual({uuid: 'test', email: 'test', nickname: 'test'});
  });
});
