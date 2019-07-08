/* eslint-disable no-console */
/* eslint-disable no-process-env */

import dotenv from 'dotenv';
import pm2 from 'pm2';

const result = dotenv.config();

if (result.error) {
  console.error('Application require dotenv config to start');
  process.exit(2);
}

const pm2Name = process.env.PM2_NAME;
const pm2Instances = process.env.PM2_INSTANCES;
const pm2ExecMode = process.env.PM2_EXEC_MODE;
const pm2UpdateEnv = process.env.PM2_UPDATE_ENV == "true" ? true: false;
const env = process.env.NODE_ENV || 'PRODUCTION';

pm2.connect(error => {
  if (error) {
    console.error(`[PM2] error: ${error}`);
    process.exit(2);
  }

  pm2.describe(pm2Name, (error, data) => {
    if (error) {
      console.error('[PM2] Describe processName error: ' + error);
      process.exit(2);
    } else {
      if (Array.isArray(data) && data.length) {
        // array exists and is not empty
        console.log(`[PM2] Reload application ${pm2Name}`);

        pm2.reload(pm2Name, { updateEnv: pm2UpdateEnv }, error => {
          if (error) {
            console.error('[PM2] Reload error: ' + error);
          }

          pm2.disconnect();
        });
      } else {
        pm2.start(
          {
            name: pm2Name,
            script: 'index.js',
            exec_mode: pm2ExecMode,
            instances: pm2Instances,
            env: {
              NODE_ENV: env,
              NODE_PATH: '.',
            },
          },
          error => {
            if (error) {
              return console.error(
                '[PM2] Error while launching applications',
                error.stack || error
              );
            }

            console.log('[PM2] and application has been succesfully started');
            pm2.disconnect();
          }
        );
      }
    }
  });
});
