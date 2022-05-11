const fs = require('fs');

module.exports = () => {
  try {
    return {
      mappings: process.env.MAPPING_PATH
        ? JSON.parse(
            fs.readFileSync(process.env.MAPPING_PATH, 'utf8').toString()
          )
        : {},
      settings: process.env.SETTINGS_PATH
        ? JSON.parse(
            fs.readFileSync(process.env.SETTINGS_PATH, 'utf8').toString()
          )
        : {},
    };
  } catch (e) {
    return null;
  }
};
