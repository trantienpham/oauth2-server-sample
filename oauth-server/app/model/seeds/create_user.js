// The main purpose of using this file to create some default users.
export default function createUsers(model) {
  const adminUser = {
    username: 'admin',
    password: 'p@ssword'
  };

  const normalUser = {
    username: 'user',
    password: 'p@ssword'
  };

  return Promise.all([
    model.getUser(adminUser.username, adminUser.password),
    model.getUser(normalUser.username, normalUser.password)
  ])
  .then(([u1, u2])=> Promise.all([
    u1 ? Promise.resolve(u1) : model.createUser(adminUser),
    u2 ? Promise.resolve(u2) : model.createUser(normalUser)
  ]));
};