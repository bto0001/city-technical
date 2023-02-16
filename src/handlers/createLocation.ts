import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';

import { CoordinatesRepository } from '../repositories/CoordinatesRepository';
import { envVars } from '../environmentVars';
import { LocationRequest } from '../models/LocationRequest';
import { LocationRepository } from '../repositories/LocationRepository';
import { LocationService } from '../LocationService';

const log = new Logger();

const axiosClient: AxiosInstance = axios.create({
  baseURL: envVars.OPENSTEETMAP_URL,
  httpsAgent: new https.Agent({ keepAlive: true }),
})

const ddbClient: DynamoDBClient = new DynamoDBClient({});

const service: LocationService = new LocationService(
  new CoordinatesRepository(
    axiosClient
  ),
  new LocationRepository(
    envVars.LOCATION_TABLE_NAME,
    ddbClient
  )
);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    log.addContext(context);
    log.debug('creating a location', JSON.stringify(event));

    const location: LocationRequest = JSON.parse(event.body || '');

    const result = await service.createLocation(location);

    if (result) {
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
    log.error(error);
    throw error;
  }
};
