import * as dotenv from 'dotenv';

import {
  Account,
  EnvironmentConfig,
  Region,
  Stage
} from './pipeline-types';

dotenv.config();

const locationTableName: string = 'Location';
const devStageName: string = process.env.CUSTOM_STAGE || Stage.dev;

export const environments: Record<Stage, EnvironmentConfig> = {
  [Stage.dev]: {
    env: {
      account: process.env.ACCOUNT || (process.env.CDK_DEFAULT_ACCOUNT as string),
      region: process.env.REGION || (process.env.CDK_DEFAULT_REGION as string)
    },
    stageName: devStageName,
    stateful: {
      locationTableName: `${devStageName}-${locationTableName}`,
    },
    stateless: {
      lambdaMemorySize: parseInt(process.env.LAMBDA_MEMORY_SIZE || '128'),
      logLevel: process.env.LOG_LEVEL || 'DEBUG',
      logEvent: true
    }
  },
  [Stage.qa]: {
    env: {
      account: Account.qa,
      region: Region.virginia
    },
    stageName: Stage.qa,
    stateful: {
      locationTableName: locationTableName,
    },
    stateless: {
      lambdaMemorySize: 256,
      logLevel: 'DEBUG',
      logEvent: true
    }
  },
  [Stage.staging]: {
    env: {
      account: Account.staging,
      region: Region.london
    },
    stageName: Stage.staging,
    stateful: {
      locationTableName: locationTableName,
    },
    stateless: {
      lambdaMemorySize: 512,
      logLevel: 'INFO',
      logEvent: false
    }
  },
  [Stage.prod]: {
    env: {
      account: Account.prod,
      region: Region.london
    },
    stageName: Stage.prod,
    stateful: {
      locationTableName: locationTableName,
    },
    stateless: {
      lambdaMemorySize: 1024,
      logLevel: 'WARN',
      logEvent: false
    }
  }
}
