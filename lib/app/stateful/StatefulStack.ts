import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface StatefulStackProps extends cdk.StackProps {
  tableName: string;
}

export class StatefulStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    // create the dynamodb table
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
      contributorInsightsEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'Id',  // combination of 'city#state#country' to prevent duplicate entries
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
