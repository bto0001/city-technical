import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const log = new Logger();

export const handler: APIGatewayProxyHandler = async (
  _: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    log.addContext(context);

    log.debug('inside healthCheck');
    return {
      statusCode: 200,
      body: 'success',
    };
  } catch (error: any) {
    log.error(error);
    throw error;
  }
};
