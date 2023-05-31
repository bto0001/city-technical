import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { log, middleware } from '../config/middleware';

const lambdaHandler: APIGatewayProxyHandler = async (
  _: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: 'success',
    };
  } catch (error: any) {
    log.error(error);
    throw error;
  }
};

export const handler = middleware(lambdaHandler);
