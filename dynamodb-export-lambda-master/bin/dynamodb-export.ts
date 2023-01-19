#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DynamodbExportStack } from '../lib/dynamodb-export-stack';

const app = new cdk.App();

const stack = new DynamodbExportStack(app, 'DynamodbExportStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
  tags: {
    region: process.env.AWS_REGION as string,
    account_id: process.env.AWS_ACCOUNT_ID as string,
    application: 'dynamodb-export-to-s3',
  },
});

stack.templateOptions.templateFormatVersion = '2010-09-09';
stack.templateOptions.description = 'Deploys solution to export DynamoDB table to S3 on regular intervals';
