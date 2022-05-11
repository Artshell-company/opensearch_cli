require('dotenv').config();

const cmd = require('commander');

cmd.version('1.0.0');

// indices
require('./commands/indices')(cmd);

cmd.parse();
