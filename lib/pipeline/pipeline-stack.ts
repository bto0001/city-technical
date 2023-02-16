import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { PipelineStage } from './pipeline-stage';
import { environments } from './pipeline-config';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline: pipelines.CodePipeline = new pipelines.CodePipeline( this, 'PipelineStack', {
      pipelineName: 'city-technical-api-pipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub(
          'bto0001/city-technical',
          'main'
        ),
        primaryOutputDirectory: './cdk.out',
        commands: [
          'npm ci',
          'npx cdk synth',
          // 'npm run test'
        ]
      })
    });

    new PipelineStage(this, `Develop-${environments.dev.stageName}`, {
      ...environments.dev
    });
  }
}
