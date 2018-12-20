const elasticSearch = require('elasticsearch');
const httpAwsEs = require('http-aws-es');

const esClientParams = {
  hosts: [process.env.ES_HOST],
};
const envs = ['test', 'development'];
if (!envs.includes(process.env.NODE_ENV)) {
  esClientParams.connectionClass = httpAwsEs;
}
module.exports = elasticSearch.Client(esClientParams);
