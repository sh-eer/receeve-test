# Export DynamoDB table to S3 bucket

This project enables automated exports of DynamoDB tables content to S3 bucket. Exports are triggered by CloudWatch rule every day at 02:00 UTC.

Components:

1. Lambda function executing data export
2. DynamoDB table containing data to be exported
3. S3 bucket containing exported table data
4. CloudWatch rule which starts export

## Quickstart

1. Run `npm install` to install project's dependencies.
2. Run `cdk synth` to generate CloudFormation template without deploying it
3. Run `cdk diff` to compare previously deployed stack with current state
4. Once you satisfied with changes, run `cdk deploy` to deploy the stack to your default AWS account and region

## How to use Export Lambda

Export lambda is triggered regularly by CloudWatch event or can be started manually from the AWS Console. The Lambda will start DynamoDB to S3 export process. Please note that the process will take some time and the successfull lambda execution does not mean export is already completed.

If Lambda is executed successfully, you will see the following log event:

```json
{
  "mesage": "Export has started successfully. Current export status: IN_PROGRESS. To check the export status run: aws dynamodb describe-export --export-arn arn:aws:dynamodb:us-east-1:111111111111:table/DynamodbTable/export/01674026761587-0931cdbf",
  "S3BucketName": "dynamodb-export-data",
  "exportResultsUri": "s3://dynamodb-export-data/2023-01-18/07:26:00/",
  "dynamoDbTableArn": "arn:aws:dynamodb:us-east-1:111111111111:table/DynamodbTable",
  "metadata": {
    "httpStatusCode": 200,
    "requestId": "PHU7CIIFNKCR3P2QN7LM9RMBPRVV4KQNSO5AEMVJF66Q9ASUAAJG",
    "extendedRequestId": "undefined",
    "cfId": "undefined",
    "attempts": 1,
    "totalRetryDelay": 0
  },
  "exportDescription": {
    "BilledSizeBytes": "undefined",
    "ClientToken": "3c7f1244-4549-4731-9fe5-ec1d361169f3",
    "EndTime": "undefined",
    "ExportArn": "arn:aws:dynamodb:us-east-1:111111111111:table/DynamodbTable/export/01674026761587-0931cdbf",
    "ExportFormat": "DYNAMODB_JSON",
    "ExportManifest": "undefined",
    "ExportStatus": "IN_PROGRESS",
    "ExportTime": "2023-01-18T07:26:01.000Z",
    "FailureCode": "undefined",
    "FailureMessage": "undefined",
    "ItemCount": "undefined",
    "S3Bucket": "dynamodb-export-data",
    "S3BucketOwner": "undefined",
    "S3Prefix": "2023-01-18/07:26:00",
    "S3SseAlgorithm": "AES256",
    "S3SseKmsKeyId": "undefined",
    "StartTime": "2023-01-18T07:26:01.587Z",
    "TableArn": "arn:aws:dynamodb:us-east-1:579742570368:table/DynamodbTable",
    "TableId": "3b9138fb-c0d3-4243-bbd5-b7999da51630"
  }
}
```

To check the export status run: `aws dynamodb describe-export --export-arn ${ExportArn}` where ExportArn can be found in `exportDescription.ExportArn`. If export is completed you will see `ExportStatus": "COMPLETED"` in the output.

## CI/CD

CI/CD process is handled by GitHub actions. The stack will be automatically deployed on every push to the `master` branch.
Please make sure that you have `PROD_AWS_ACCESS_KEY_ID` and `PROD_AWS_SECRET_ACCESS_KEY` GitHub secrets configured for the production deployment.

## Folder structure

`.github/workflows` - configuration for CI/CD process (GitHub Actions)
`bin/dynamodb-export.ts` - CloudFormation stack config. Please add any necessary tags to this file.
`lib/dynamodb-export-stack.ts` - AWS resources to be created.
`src/index.ts` - Lambda application logic (TypeScript)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run lint` lint code files
- `npm run test` perform the jest unit tests
