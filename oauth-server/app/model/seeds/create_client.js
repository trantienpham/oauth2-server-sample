// The main purpose of using this file to create some default clients.
export default function createClients(model, admin, user) {
  const client1 = {
    clientId: '3647dfd8-b77e-4df8-a62a-a51433b3355b', 
    clientSecret: '446d98d2437951e3b85e53478b1a72b45a406cfe', 
    redirectUris:['http://localhost:7474/callback'], 
    grants: ['authorization_code','password', 'client_credentials'],
    userId: admin.id
  };

  const client2 = {
    clientId: '5b017f8e-7317-49d3-a128-618757f10bda', 
    clientSecret: '446d98d2437951e3b85e53478b1a72b45a406cfe', 
    redirectUris:['http://localhost:7474/callback'], 
    grants: ['authorization_code','password'],
    userId: user.id
  };

  return Promise.all([
    model.getClient(client1.clientId, client1.clientSecret),
    model.getClient(client2.clientId, client2.clientSecret)
  ])
  .then(([c1, c2])=> Promise.all([
    c1 ? Promise.resolve(c1) : model.createClient(client1),
    c2 ? Promise.resolve(c2) : model.createClient(client2)
  ]));
};