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
  qa = '11111111111',
  staging = '22222222222',
  prod = '33333333333'
}
