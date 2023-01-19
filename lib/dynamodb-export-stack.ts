import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as awslambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class DynamodbExportStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Private S3 bucket to export table into
     */
    const bucket = new s3.Bucket(this, `DynamoDbExportBucket`, {
      publicReadAccess: false,
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    });

    /**
     * DynamoDB table to be exported
     *
     * Note: The table must have point in time recovery turned on to enable export.
     */
    const ddtable = new dynamodb.Table(this, `DynamoDbTable`, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'item_id', type: dynamodb.AttributeType.STRING },
      pointInTimeRecovery: true,
    });

    /**
     * Lambda function which handles DynamoDB export operation.
     */
    const lambda = new nodejslambda.NodejsFunction(this, `DynamodbExporterLambda`, {
      entry: 'src/index.ts',
      handler: 'handler',
      functionName: 'dynamodb-to-s3-export',
      description: `Exports data from "${ddtable.tableName}" table to "${bucket.bucketName}" bucket`,
      runtime: awslambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      environment: {
        DYNAMODB_TABLE_ARN: ddtable.tableArn,
        S3_BUCKET_NAME: bucket.bucketName
      },
    });

    /** Allow lambda to put files in S3 bucket */
    lambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:PutObject'],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    /** Allow lambda to export DynamoDB table */
    lambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:ExportTableToPointInTime'],
        resources: [ddtable.tableArn],
      })
    );

    /**
     * CloudWatch rule to trigger export every day at 02:00 UTC
     */
    new events.Rule(this, 'ExportScheduleRule', {
      ruleName: 'dynamodb-export-schedule',
      description: 'Starts DynamoDB to S3 export every day at 02:00 UTC',
      schedule: events.Schedule.cron({
        hour: '02',
        minute: '00',
        month: '*',
        year: '*',
        day: '*',
      }),
      enabled: true,
      targets: [new targets.LambdaFunction(lambda)],
    });
  }
}
