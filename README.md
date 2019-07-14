[![Build Status](https://travis-ci.org/trantienpham/oauth2-server-sample.svg?branch=master)](https://travis-ci.org/trantienpham/oauth2-server-sample)

# Run service with your own environment

## production
```
cd oauth-server
npm start
```

## dev
```
cd oauth-server
npm run dev
```

## test
```
cd oauth-server
npm test
```

# Modify setting of each environment

## production
```
cd oauth-server
nano .env
```

## dev
```
cd oauth-server
nano .env.development
```

## test
```
cd oauth-server
nano .env.test
```

# Other environments

1. Create file .env.{your environment} and then fill in your settings into this file.
2. Edit file package.json.
  - For example: I create the staging environment
    + Firstly, create file .env.staging and fill in my settings into this file
    + Secondly, add below setting into package.json
      ```
      "staging": NODE_ENV=staging node index.js
      ```
    + Lastly
      ```
      npm run staging
      ```