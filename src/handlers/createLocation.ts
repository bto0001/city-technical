import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { CoordinatesRepository } from '../repositories/CoordinatesRepository';
import { envVars } from '../environmentVars';
import { LocationRequest } from '../models/LocationRequest';
import { LocationRepository } from '../repositories/LocationRepository';
import { LocationService } from '../LocationService';
import { log, middleware, metrics, MetricUnits, tracer } from '../config/middleware';

const axiosClient: AxiosInstance = axios.create({
  baseURL: envVars.OPENSTEETMAP_URL,
  httpsAgent: new https.Agent({ keepAlive: true }),
})

const ddbClient: DynamoDBClient = new DynamoDBClient({});

tracer.captureAWSv3Client(ddbClient);

const service: LocationService = new LocationService(
  new CoordinatesRepository(
    axiosClient
  ),
  new LocationRepository(
    envVars.LOCATION_TABLE_NAME,
    ddbClient
  )
);

const lambdaHandler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  _: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const location: LocationRequest = JSON.parse(event.body || '');

    const result = await service.createLocation(location);

    if (result) {
      metrics.addMetric('locationCreated', MetricUnits.Count, 1);
      return {
        statusCode: 201,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 500,
        body: 'not created',
      };
    }

  } catch (error: any) {
    metrics.addDimension('error', 'locationCreated');
    metrics.addMetric('errorLocationCreated', MetricUnits.Count, 1);
    log.error('error creating location', error as Error);

    return {
      statusCode: 500,
      body: 'not created',
    };
  }
};

export const handler = middleware(lambdaHandler);
