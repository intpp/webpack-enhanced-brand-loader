const fs = require('fs');
const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');
const chalk = require('chalk');
const { name: packageName } = require('./package');
const schema = require('./schema.json');

const regex = /\.[^.]+$/;

let notified = false;

const load = (originalResource, brand, callback) => {
  const extension = originalResource.match(regex)[0];
  const isHtml = extension === '.html';
  const encoding = isHtml ? 'utf-8' : null;

  const resource = brand ? originalResource.replace(regex, `.${brand}${extension}`) : originalResource;

  if (fs.existsSync(resource)) {
    const content = fs.readFileSync(resource, encoding);

    return {
      resource,
      content,
      isHtml,
    };
  }

  const content = fs.readFileSync(originalResource, encoding);

  return {
    resource,
    content,
    isHtml,
  };
};

module.exports = function (originalContent, map, meta) {
  const options = getOptions(this);
  const { brand } = options;

  validateOptions(schema, options, packageName);

  const callback = this.async();
  const { resource: originalResource, addDependency } = this;

  if (!notified) {
    notified = true;

    if (brand) {
      console.log(chalk.green(`${packageName}: brand = ${brand}`));
    } else {
      console.log(chalk.yellow(`${packageName}: Option "brand" has not been set, using default (no brand).`));
    }
  }

  const { resource, content, isHtml } = load(originalResource, brand);

  if (originalResource !== resource) {
    addDependency(resource);
  }

  if (isHtml) {
    return callback(null, `module.exports = ${JSON.stringify(content)}`, map, meta);
  }

  return callback(null, content, map, meta);
};

