const CLI = require('clui');
const Promise = require('bluebird');

const { Spinner } = CLI;

const client = require('../lib/client');
const handleData = require('../lib/dataHandler');
const logger = require('../lib/logger');

const awaitTaskCompletion = async (taskId) => {
  const task = await client.tasks.get({ taskId });
  if (task.body.completed) return task;

  await Promise.delay(1000);
  return awaitTaskCompletion(taskId);
};

/**
 * Create a new Index
 *
 * @param {string} [name='artshell'] The index name
 */
const createIndex = async (name = 'artshell') =>
  client.indices
    .create({
      index: name,
      body: handleData(),
    })
    .then((res) => {
      logger.info(res);
      logger.info('Done!');
    })
    .catch(logger.error);

/**
 * Update index mapping
 *
 * @param {string} name The index name to update
 */
const updateMapping = async (name) => {
  const { mappings } = handleData();
  await client.indices
    .putMapping({
      index: name,
      body: mappings,
    })
    .then((res) => {
      logger.info(res);
      logger.info('Done!');
    })
    .catch(logger.error);
};

/**
 * Migrate data from `oldName` index to new  `newName` index
 *
 * @param {string} oldName The old index name
 * @param {string} newName The new index name
 * @param {string} [alias='artshell_main'] The index alias
 */
const reindex = async (oldName, newName, alias = 'artshell_main') => {
  // create new index
  let status = new Spinner(`'creating index ${newName}`);
  status.start();
  const data = handleData();
  await client.indices
    .create({
      index: newName,
      body: data,
    })
    .then(logger.info)
    .catch(logger.error);
  status.stop();

  // move data to new index
  status = new Spinner(`Reindexing ${oldName} to ${newName}`);
  status.start();
  const task = await client.reindex({
    waitForCompletion: false,
    body: {
      source: { index: oldName },
      dest: { index: newName },
    },
  });
  await awaitTaskCompletion(task.body.task);
  status.stop();

  // update alias
  status = new Spinner(`Setting up alias to point to ${newName}`);
  status.start();
  await client.indices.updateAliases({
    body: {
      actions: [
        { remove: { index: oldName, alias } },
        { add: { index: newName, alias } },
      ],
    },
  });
  status.stop();
};

/**
 * Delete index
 *
 * @param {string} name The index name to delete
 */
const deleteIndex = async (name) =>
  client.indices
    .delete({ index: name })
    .then((res) => {
      logger.info(res);
      logger.info('Done!');
    })
    .catch(logger.error);

module.exports = (cmd) => {
  cmd
    .command('indices')
    .alias('i')
    .description('Index operations')
    .option('-c, --create [name]', 'create index')
    .option('-u, --update [name]', 'update index')
    .option('-r, --reindex [old_name] [new_name] [alias]', 'reindex')
    .option('-d, --delete [name]', 'remove index')
    .action((operation) => {
      if (operation.create) {
        createIndex(operation.create);
      } else if (operation.update) {
        updateMapping(operation.update);
      } else if (operation.reindex) {
        reindex(operation.reindex, cmd.args[3], cmd.args[4]);
      } else if (operation.delete) {
        deleteIndex(operation.delete);
      }
    });
};
