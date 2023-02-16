import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { PipelineStage } from './pipeline-stage';
import { environments } from './pipeline-config';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline: pipelines.CodePipeline = new pipelines.CodePipeline(this, 'PipelineStack', {
      pipelineName: 'city-technical-api-pipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('bto0001/city-technical', 'main', {
          authentication: cdk.SecretValue.secretsManager(
            'city-technical-location-api/pipeline/github-access-token'
          )
        }
        ),
        primaryOutputDirectory: './cdk.out',
        installCommands: ['npm i -g npm@latest'],
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

    // qa deploy
    // const qaStage: PipelineStage = new PipelineStage(this, 'QA', {
    //   ...environments.qa,
    // });
    // pipeline.addStage(qaStage, {
    //   post: [
    //     new pipelines.ShellStep('HealthCheck', {
    //       envFromCfnOutputs: {
    //         HEALTH_CHECK_ENDPOINT: qaStage.healthCheckUrl,
    //       },
    //       commands: ['curl -Ssf $HEALTH_CHECK_ENDPOINT'],
    //     }),
    //   ],
    // });

    // // staging deploy
    // const stagingStage: PipelineStage = new PipelineStage(this, 'Staging', {
    //   ...environments.staging,
    // });
    // pipeline.addStage(stagingStage, {
    //   post: [
    //     new pipelines.ShellStep('HealthCheck', {
    //       envFromCfnOutputs: {
    //         HEALTH_CHECK_ENDPOINT: stagingStage.healthCheckUrl,
    //       },
    //       commands: ['curl -Ssf $HEALTH_CHECK_ENDPOINT'],
    //     }),
    //   ],
    // });

    // // prod deploy
    // const prodStage: PipelineStage = new PipelineStage(this, 'Prod', {
    //   ...environments.prod,
    // });
    // pipeline.addStage(prodStage, {
    //   pre: [
    //     new pipelines.ManualApprovalStep('PromoteToProd'), // manual approval step
    //   ],
    //   post: [
    //     new pipelines.ShellStep('HealthCheck', {
    //       envFromCfnOutputs: {
    //         HEALTH_CHECK_ENDPOINT: prodStage.healthCheckUrl,
    //       },
    //       commands: ['curl -Ssf $HEALTH_CHECK_ENDPOINT'],
    //     }),
    //   ],
    // });
  }
}
