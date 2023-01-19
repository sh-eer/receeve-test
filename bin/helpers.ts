import * as cdk from 'aws-cdk-lib';

/**
 * Gets variable value from CDK context
 *
 * @see: https://docs.aws.amazon.com/cdk/v2/guide/context.html
 *
 * @param {cdk.App} app - CDK application instance
 * @param {string} contextKey - name of the context variable
 *
 * @returns value of the context variable
 */
export const getContextVariable = (app: cdk.App, contextKey: string): string => {
  const contextVar = app.node.tryGetContext(contextKey);
  if (!contextVar) throw new Error(`Context variable ${contextKey} is missing in CDK command. Pass it as -c ${contextKey}=VALUE`);

  return contextVar;
};
