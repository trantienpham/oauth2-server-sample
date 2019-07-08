import {isEmpty, isNil} from 'lodash';
import OAuthServer from 'oauth2-server';

const {Request, Response, UnauthorizedRequestError} = OAuthServer;
const requireClientAuthentication = {
  password: true,
  authorization_code: true,
  client_credentials: true
};

export default function createOAuthServer(model) {
  const oauth = new OAuthServer({model});

  return {
    token(req, res, next) {
      const request = new Request(req);
      const response = new Response(res);
    
      return oauth
        .token(request, response, {requireClientAuthentication})
        .then(() => {
          res.set(response.headers);
          res.json(response.body);
        }).catch(err => next(err));
    },
    // generate code for the authorization code grant type
    authorize(req, res, next) {
      const request = new Request(req);
      const response = new Response(res);
      // bypass rule of oauth2-server because this library always check whether parameter `access_token` exists or not.
      const {username, password} = request.method === 'POST' ? request.body : request.query;
      const options = {
        authenticateHandler: {
          handle() {
            return model.getUser(username, password);
          }
        }
      };
      return oauth
      .authorize(request, response, (!isNil(username) && !isEmpty(username) && !isNil(password) && !isEmpty(password)) ? options : undefined)
        .then(() => res.status(response.status).set(response.headers).end())
        .catch(err => next(err));
    },
    // verify access_token valid or not and evetually still return this token
    authenticate(req, res, next) {
      const request = new Request(req);
      const response = new Response(res);
    
      return oauth.authenticate(request, response)
        .then((token) => {
          Object.assign(req, { token });
          next();
        })
        .catch(err => next(err));
    },
    UnauthorizedRequestError
  };
}