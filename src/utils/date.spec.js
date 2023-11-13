const {genUnixTs} = require('./date');

describe('unit:utils', () => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
  test('unixdate should equal to given date with seconds', async () => {
    const fakeDate = 1577836800;
    expect(genUnixTs()).toEqual(fakeDate);
  });
});

