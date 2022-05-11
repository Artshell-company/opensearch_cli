const chalk = require('chalk');

const logger = console;

module.exports = {
  info: (data) => {
    if (typeof data === 'string') {
      logger.info(chalk.green(data));
    } else if (process.env.LOG_LEVEL === 'debug') {
      logger.info(chalk.blue(JSON.stringify(data, null, 2)));
    }
  },
  error: (data) => {
    if (data.message) logger.error(chalk.red(data.message));
    if (process.env.LOG_LEVEL === 'debug') {
      logger.info(chalk.blue(JSON.stringify(data, null, 2)));
    }
  },
};
