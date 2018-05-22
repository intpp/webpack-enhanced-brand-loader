const fs = require('fs');
const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');
const chalk = require('chalk');
const { name: packageName } = require('./package');
const schema = require('./schema.json');

const regex = /\.[^.]+$/;

let notified = false;

module.exports = function (content, map, meta) {
  const options = getOptions(this);

  validateOptions(schema, options, packageName);

  const { brand } = options;

  const callback = this.async();
  let { resource, addDependency } = this;

  if (brand) {
    if (!notified) {
      console.log(chalk.green(`${packageName}: brand = ${brand}`));
      notified = true;
    }

    try {
      const extension = resource.match(regex)[0];
      const nextFilePath = resource.replace(regex, `.${brand}${extension}`);

      const stats = fs.statSync(nextFilePath);

      if (stats.isFile()) {
        return fs.readFile(nextFilePath, null, function (err, data) {
          if (err) {
            return callback(err);
          }

          addDependency(nextFilePath);
          callback(null, data, map, meta);
        });
      }
    } catch (e) {
    }
  } else {
    if (!notified) {
      console.log(chalk.yellow(`${packageName}: Option "brand" has not been set, using default (no brand).`));
      notified = true;
    }
  }

  callback(null, content, map, meta);
};
module.exports.raw = true;
