import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';

export interface StatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  stageName: string;
  lambdaMemorySize: number;
  logLevel: string;
}

export class StatelessStack extends cdk.Stack {
  public readonly apiEndpointUrl: cdk.CfnOutput;  // share api url with others easily

  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    const { table, stageName } = props;

    const projectRoute: string = path.resolve(__dirname, '..', '..', '..');  // not the most elegant code

    // create rest api
    const locationsApi: apigw.RestApi = new apigw.RestApi(this, 'LocationsApi', {
      description: `City Technical Location API for ${stageName}`,
      endpointTypes: [apigw.EndpointType.REGIONAL],
      cloudWatchRole: true,
      deployOptions: {
        stageName: stageName,
        loggingLevel: apigw.MethodLoggingLevel.INFO
      }
    });

    // create api resources
    const healthCheckResource: apigw.Resource = locationsApi.root.addResource('health-check');

    const locationsResource: apigw.Resource = locationsApi.root.addResource('locations');
    const locationsWithIdResource: apigw.Resource = locationsResource.addResource('{id}');

    // create lambdas
    const healthCheckLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(this, 'HealthCheckLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/handlers/healthCheck.ts',
      projectRoot: projectRoute,
      memorySize: props.lambdaMemorySize,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb']
      },
      environment: {
        // Used by AWS Lambda Powertools
        LOG_LEVEL: props.logLevel,
        POWERTOOLS_SERVICE_NAME: 'HealthCheckLambda'
      }
    });

    const createLocationLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(this, 'CreateLocationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/handlers/createLocation.ts',
      projectRoot: projectRoute,
      memorySize: props.lambdaMemorySize,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb']
      },
      environment: {
        LOCATION_TABLE_NAME: table.tableName,
        POWERTOOLS_SERVICE_NAME: 'CreateLocationLambda',
        POWERTOOLS_LOGGER_LOG_EVENT: 'true',
        LOG_LEVEL: props.logLevel
      }
    });

    const getAllLocationsLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(this, 'GetAllLocationsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/handlers/getAllLocations.ts',
      projectRoot: projectRoute,
      memorySize: props.lambdaMemorySize,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb']
      },
      environment: {
        LOCATION_TABLE_NAME: table.tableName
      }
    });

    const getLocationLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(this, 'GetLocationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/handlers/getLocation.ts',
      projectRoot: projectRoute,
      memorySize: props.lambdaMemorySize,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb']
      },
      environment: {
        LOCATION_TABLE_NAME: table.tableName
      }
    });

    const updateLocationLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(this, 'UpdateLocationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/handlers/updateLocation.ts',
      projectRoot: projectRoute,
      memorySize: props.lambdaMemorySize,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb']
      },
      environment: {
        LOCATION_TABLE_NAME: table.tableName
      }
    });

    // connect lambdas with api gateway
    locationsResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createLocationLambda)
    );

    locationsResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(getAllLocationsLambda)
    );

    locationsWithIdResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(getLocationLambda)
    );

    locationsWithIdResource.addMethod(
      'PATCH',
      new apigw.LambdaIntegration(updateLocationLambda)
    );

    // grant lambda access to the Location DDB table
    table.grantReadData(getAllLocationsLambda),
    table.grantReadData(getLocationLambda);

    table.grantWriteData(createLocationLambda);
    table.grantWriteData(updateLocationLambda);

    // CF Outputs
    this.apiEndpointUrl = new cdk.CfnOutput(this, 'ApiEndpointOutput', {
      value: locationsApi.url,
      exportName: `api-endpoint-${props.stageName}`
    });
  };
}
