//
// CONFIG
// CONFIG.JS
//
// Reads the YAML file based on environment, and stored in memory for access by app
// Restart required if YAML data changes
//

var env = process.env.NODE_ENV || 'development';

var yaml = require("js-yaml");
var fs = require("fs");
var dconfig = yaml.load(fs.readFileSync("./config.yaml"));

if (env == "production") {
    module.exports = dconfig.production;
} else {
    module.exports = dconfig.development;
}