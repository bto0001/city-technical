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
import { LocationRepository } from '../repositories/LocationRepository';
import { LocationService } from '../LocationService';
import { LocationRequest } from '../models/LocationRequest';
import { log, middleware, tracer } from '../config/middleware';

const axiosClient: AxiosInstance = axios.create({
  baseURL: envVars.OPENSTEETMAP_URL,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

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
    const locationId = event.pathParameters?.id;

    const location: Partial<LocationRequest> = JSON.parse(event.body || '');

    if (!locationId) {
      return {
        statusCode: 400,
        body: 'missing location id path parameter',
      };
    }

    const result = await service.updateLocation(locationId, location);

    if (result) {
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      }
    }

    return {
      statusCode: 500,
      body: 'unable to update location'
    }

  } catch (error: any) {
    log.error('error updating a location', error as Error);
    return {
      statusCode: 500,
      body: 'unable to update location',
    };
  }
};

export const handler = middleware(lambdaHandler);
