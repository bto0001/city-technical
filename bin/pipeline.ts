#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { PipelineStack } from '../lib/pipeline/pipeline-stack';
import { environments } from '../lib/pipeline/pipeline-config';

const app = new cdk.App();
new PipelineStack(app, 'CityTechnical', {
 env: environments.dev.env
});

app.synth();
