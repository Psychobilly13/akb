const {MongoMemoryServer} = require('mongodb-memory-server');
const bootstrap = require('../../http/controllers/server');
const {mongoDisconnect} = require('../../storages/mongo/mongo');

jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

let mongoMock;
let app;

beforeAll(async () => {
  mongoMock = await MongoMemoryServer.create();
  const url = mongoMock.getUri();
  process.env.MONGO_URL = url + 'akb';
  if (process.env.MONGO_URL) {
    app = await bootstrap();
  }
});

let accessToken;
let uuidUser;
let uuidPost;

describe('e2e:auth', () => {
  test('authorization should be success', async () => {
    const registerData = {
      'nickname': 'yog-sothoth',
      'email': 'lovecraft@hp.com',
      'password': 'fhtagn',
    };
    const registration = await app.inject({
      method: 'POST',
      url: 'auth/register',
      payload: registerData,
    });

    const regPayload = registration.json();

    expect(regPayload).toEqual({
      access: {
        token: expect.any(String),
        expire: expect.any(Number),
      },
      refresh: {
        token: expect.any(String),
        expire: expect.any(Number),
      },
    });

    accessToken = regPayload.access.token;
    const auth = await app.inject({
      method: 'POST',
      url: 'auth/login',
      payload: {
        'email': 'lovecraft@hp.com',
        'password': 'fhtagn',
      },
    });

    res = auth.json();

    expect(res).toEqual({
      access: {
        token: expect.any(String),
        expire: expect.any(Number),
      },
      refresh: {
        token: expect.any(String),
        expire: expect.any(Number),
      },
    });
  });
});

describe('e2e:post', () => {
  test('creating post should be success', async () => {
    const creatingData = {
      'title': 'My favorite book',
      'content': 'My favorite author is Hovard Lovecraft.\nI love his story which has name "Azathoth"',
      'status': 'open',
      'type': 'public',
      'tags': ['books', 'horror'],
    };
    await app.inject({
      method: 'POST',
      url: `post`,
      payload: creatingData,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const gettingList = await app.inject({
      method: 'GET',
      url: `post/list`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const postList = gettingList.json();

    expect(postList).toEqual({
      results: [{
        uuid: expect.any(String),
        ids: {uuidUser: expect.any(String)},
        dates: {created: expect.any(Number), updated: expect.any(Number)},
        title: 'My favorite book',
        content: 'My favorite author is Hovard Lovecraft.\n' +
            'I love his story which has name "Azathoth"',
        status: 'open',
        type: 'public',
        tags: ['books', 'horror'],
      }],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });

    uuidPost = postList.results[0].uuid;
  });

  test('updating post should be success', async () => {
    const updatingData = {
      'title': 'My first favorite book',
      'type': 'private',
      'content': 'My favorite author is Hovard Lovecraft.\nI love his story which has name "Call of Cthulhu"',
    };
    await app.inject({
      method: 'PUT',
      url: `post/${uuidPost}`,
      payload: updatingData,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const gettingOne = await app.inject({
      method: 'GET',
      url: `post/${uuidPost}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const post = gettingOne.json();

    expect(post).toEqual({
      uuid: expect.any(String),
      ids: {uuidUser: expect.any(String)},
      dates: {created: expect.any(Number), updated: expect.any(Number)},
      title: 'My first favorite book',
      content: 'My favorite author is Hovard Lovecraft.\n' +
            'I love his story which has name "Call of Cthulhu"',
      status: 'open',
      type: 'private',
      tags: ['books', 'horror'],
    });
  });

  test('unauth user should get empty list because all posts are private', async () => {
    const gettingEmptyList = await app.inject({
      method: 'GET',
      url: `post/list`,
    });

    const postEmptyList = gettingEmptyList.json();

    expect(postEmptyList).toEqual({
      results: [],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });
  });

  test('getting list post by filters should be success', async () => {
    const gettingList = await app.inject({
      method: 'GET',
      url: `post/list?tags=books&tags=horror`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const postList = gettingList.json();

    expect(postList).toEqual({
      results: [{
        uuid: expect.any(String),
        ids: {uuidUser: expect.any(String)},
        dates: {created: expect.any(Number), updated: expect.any(Number)},
        title: 'My first favorite book',
        content: 'My favorite author is Hovard Lovecraft.\n' +
            'I love his story which has name "Call of Cthulhu"',
        status: 'open',
        type: 'private',
        tags: ['books', 'horror'],
      }],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });

    const gettingEmptyList = await app.inject({
      method: 'GET',
      url: `post/list?tags=books&tags=history`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const postEmptyList = gettingEmptyList.json();

    expect(postEmptyList).toEqual({
      results: [],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });
  });

  test('deleting post should be success', async () => {
    await app.inject({
      method: 'DELETE',
      url: `post/${uuidPost}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const gettingEmptyList = await app.inject({
      method: 'GET',
      url: `post/list`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const postEmptyList = gettingEmptyList.json();

    expect(postEmptyList).toEqual({
      results: [],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });
  });

  test('unauth user should not delete post', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `post/${uuidPost}`,
    });

    const err = res.json();

    expect(err).toEqual( {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'auth.invalidToken',
    });
  });

  test('unauth user req of create should be fail', async () => {
    const creatingData = {
      'title': 'My favorite book',
      'content': 'My favorite author is Hovard Lovecraft.\nI love his story which has name "Azathoth"',
      'status': 'open',
      'type': 'public',
      'tags': ['books', 'horror'],
    };
    const res = await app.inject({
      method: 'POST',
      url: `post`,
      payload: creatingData,
    });

    const err = res.json();

    expect(err).toEqual( {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'auth.invalidToken',
    });
  });
});


describe('e2e:user', () => {
  test('updating user should be success', async () => {
    const getting = await app.inject({
      method: 'GET',
      url: `user/list`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const userList = getting.json();
    expect(userList).toEqual({
      results: [{
        dates: {created: expect.any(Number), updated: expect.any(Number)},
        uuid: expect.any(String),
        nickname: 'yog-sothoth',
        email: expect.any(String),
        password: expect.any(String),
        status: expect.any(String),
      }],
      settings: {
        count: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      },
    });
    uuidUser = userList.results[0].uuid;

    await app.inject({
      method: 'PUT',
      url: `user/${uuidUser}`,
      payload: {
        'nickname': 'cthulhu',
      },
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const gettingOne = await app.inject({
      method: 'GET',
      url: `user/${uuidUser}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(gettingOne.json()).toEqual({
      dates: {created: expect.any(Number), updated: expect.any(Number)},
      uuid: expect.any(String),
      nickname: 'cthulhu',
      email: expect.any(String),
      password: expect.any(String),
      status: expect.any(String),
    });
  });

  test('unauth user should not delete user', async () => {
    deletingUser = await app.inject({
      method: 'DELETE',
      url: `user/${uuidUser}`,
    });

    const code = deletingUser.statusCode;
    expect(code).toEqual(401);
  });

  test('auth user should delete user', async () => {
    deletingUser = await app.inject({
      method: 'DELETE',
      url: `user/${uuidUser}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const gettingOne = await app.inject({
      method: 'GET',
      url: `user/${uuidUser}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(gettingOne.json()).toEqual({statusCode: 404, error: 'Not Found', message: 'user.notFound'});
  });
});

afterAll(async () => {
  await mongoMock.stop();
  await mongoDisconnect();
  await app.close();
});
