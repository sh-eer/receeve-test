import { DynamoDBClient, ExportTableToPointInTimeCommand } from '@aws-sdk/client-dynamodb';
import config from './getConfig';

/**
 * Lambda function which exports DynamoDB table content to an S3 bucket.
 * Triggered by scheduled EventBridge rule.
 *
 * The following environment variables are required:
 *
 * DYNAMODB_TABLE_ARN - Amazon Resource Name associated with the table to export.
 * S3_BUCKET_NAME - The name of the Amazon S3 bucket to export the snapshot to.
 *  */
export const handler = async () => {
  try {
    const client = new DynamoDBClient({});
    const { dynamodbTableArn, bucketName } = config();

    const today = new Date();
    const exportDateStr = today.toISOString().substring(0, 10); // i.e. 2023-01-01
    const exportTimeStr = today.toISOString().substring(11, 19); // i.e. 05:41:43
    const s3Prefix = `${exportDateStr}/${exportTimeStr}`;

    console.log({
      message: 'DynamoDB export is starting...',
      s3BucketName: bucketName,
      dynamoDbTableArn: dynamodbTableArn,
    });

    /**
     * Exports a snapshot of the table's state at the current date and time.
     *
     * Note: The table must have point in time recovery enabled.
     *
     * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#exportTableToPointInTime-property
     */
    const command = new ExportTableToPointInTimeCommand({
      TableArn: dynamodbTableArn,
      S3Bucket: bucketName,
      S3Prefix: s3Prefix,
      ExportTime: today,
      ExportFormat: 'DYNAMODB_JSON',
    });

    const results = await client.send(command);

    console.log({
      message: `Export has started successfully. Current export status: ${results.ExportDescription?.ExportStatus}. To check the export status run: aws dynamodb describe-export --export-arn ${results.ExportDescription?.ExportArn}`,
      S3BucketName: process.env.S3_BUCKET_NAME,
      exportResultsUri: `s3://${bucketName}/${s3Prefix}/`,
      dynamoDbTableArn: process.env.DYNAMODB_TABLE_ARN,
      metadata: results.$metadata,
      exportDescription: results.ExportDescription,
    });
  } catch (err) {
    console.error({
      message: `Export has failed`,
      S3BucketName: process.env.S3_BUCKET_NAME,
      dynamoDbTableArn: process.env.DYNAMODB_TABLE_ARN,
      error: err,
    });
    throw err;
  }
};
