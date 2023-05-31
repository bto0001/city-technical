import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { EnvironmentConfig } from './pipeline-types';
import { StatefulStack } from '../app/stateful/stateful-stack';
import { StatelessStack } from '../app/stateless/stateless-stack';

export class PipelineStage extends cdk.Stage {
  public readonly apiEndpointUrl: cdk.CfnOutput;
  public readonly healthCheckUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(this, 'StatefulStack', {
      tableName: props.stateful.locationTableName
    });
    const statelessStack = new StatelessStack(this, 'StatelessStack', {
      table: statefulStack.table,
      openStreetMapsUrl: props.stateless.openStreetmapsUrl,
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      stageName: props.stageName,
      logLevel: props.stateless.logLevel,
      logEvent: props.stateless.logEvent,
      tracing: props.stateless.tracing
    });

    this.apiEndpointUrl = statelessStack.apiEndpointUrl;
    this.healthCheckUrl = statelessStack.healthCheckUrl;
  }
}
