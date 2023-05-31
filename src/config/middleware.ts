import { Handler } from 'aws-lambda';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { logMetrics, Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import middy, { MiddyfiedHandler } from '@middy/core';

export const tracer = new Tracer();
export const log = new Logger();
export const metrics = new Metrics();

export const middleware = (handler: Handler): MiddyfiedHandler => middy(handler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(log, { clearState: true }))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));

export { MetricUnits };
