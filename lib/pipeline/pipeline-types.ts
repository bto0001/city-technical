import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
  stateful: {
    locationTableName: string;
  };
  stateless: {
    lambdaMemorySize: number;
    logLevel: string;
    logEvent: boolean;
    openStreetmapsUrl: string;
    tracing: lambda.Tracing;
  }
}

export const enum Region {
  virginia = 'us-east-1',
  london = 'eu-west-2'
}

export const enum Stage {
  dev = 'dev',
  qa = 'qa',
  staging = 'staging',
  prod = 'prod'
}

export const enum Account {
  qa = '111111111111',
  staging = '222222222222',
  prod = '333333333333'
}
