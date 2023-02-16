import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { EnvironmentConfig } from './pipeline-types';
import { StatefulStack } from '../app/stateful/StatefulStack';
import { StatelessStack } from '../app/stateless/StateLessStack';

export class PipelineStage extends cdk.Stage {
  public readonly apiEndpointUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(this, 'StatefulStack', {
      tableName: props.stateful.locationTableName
    });
    const statelessStack = new StatelessStack(this, 'StatelessStack', {
      table: statefulStack.table,
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      stageName: props.stageName
    });

    this.apiEndpointUrl = statelessStack.apiEndpointUrl;
  }
}
