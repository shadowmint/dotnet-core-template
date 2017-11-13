var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');

// Paths
var root = process.env.INIT_CWD;
var src = path.join(__dirname, '..', 'lib');
var pkg = path.join(root, '_packages');
var ismodule = fs.existsSync(path.join(root, 'node_modules'));
if (!root) throw new Error('Requires npm 5.4+');

// Create folder if missing
if (ismodule) {
  mkdirp(pkg, function (err) {
    if (err) {
      console.error(err)
      process.exit(1);
    }

    // Copy files
    ncp(src, pkg, function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });
}
