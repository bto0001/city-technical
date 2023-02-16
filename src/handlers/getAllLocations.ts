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
import { LocationRepository } from '../repositories/LocationRepository';
import { LocationService } from '../LocationService';

const log = new Logger();

// Axios isn't needed in this Lambda.
const axiosClient: AxiosInstance = axios.create({
  baseURL: envVars.OPENSTEETMAP_URL,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

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
    log.debug('retrieving all locations', JSON.stringify(event));

    return {
      statusCode: 200,
      body: JSON.stringify(await service.getAllLocations())
    };

  } catch (error: any) {
    log.error(error);
    throw error;
  }
};
