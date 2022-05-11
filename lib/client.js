const AWS = require('aws-sdk');
const createAwsOpensearchConnector = require('aws-opensearch-connector');
const { Client } = require('@opensearch-project/opensearch');

const esClientParams = { node: `https://${process.env.ES_HOST}` };
const envs = ['test', 'local'];
Object.assign(
  esClientParams,
  !envs.includes(process.env.NODE_ENV)
    ? createAwsOpensearchConnector(AWS.config)
    : { ssl: { rejectUnauthorized: false } }
);

module.exports = new Client(esClientParams);
