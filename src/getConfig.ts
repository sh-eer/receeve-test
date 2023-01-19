interface IConfig {
  [key: string]: string;
}

/**
 * Get a lambda configuration
 *
 * @returns {IConfig}
 */
export const getConfig = (): IConfig => {
  if (!process.env.DYNAMODB_TABLE_ARN) {
    throw new Error('DYNAMODB_TABLE_ARN has not been defined');
  }
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error('S3_BUCKET_NAME has not been defined');
  }

  return {
    dynamodbTableArn: process.env.DYNAMODB_TABLE_ARN,
    bucketName: process.env.S3_BUCKET_NAME,
  };
};

export default getConfig;
