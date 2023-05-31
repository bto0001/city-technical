import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { CoordinatesRepository } from '../repositories/CoordinatesRepository';
import { envVars } from '../environmentVars';
import { LocationRepository } from '../repositories/LocationRepository';
import { LocationService } from '../LocationService';
import { log, middleware, tracer } from '../config/middleware';

// Axios isn't needed in this Lambda.
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
  _: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await service.getAllLocations())
    };

  } catch (error: any) {
    log.error('error retrieving all locations', error as Error);

    return {
      statusCode: 500,
      body: 'server error',
    };
  }
};

export const handler = middleware(lambdaHandler);
