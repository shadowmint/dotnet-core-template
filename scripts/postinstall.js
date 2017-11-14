let path = require('path');
let fs = require('fs');
let copy = require('./copy');

// Exit vars
let done = false;

// Paths
let root = process.env.INIT_CWD || path.join(__dirname, '..', '..', '..');
let src = path.join(__dirname, '..', 'lib');
let pkg = path.join(root, '_packages');
let ismodule = fs.existsSync(path.join(root, 'node_modules'));

// Create folder if missing
if (ismodule) {
  copy.copy(src, pkg).then(() => {
    done = true;
  }, (err) => {
    console.error(err)
    process.exit(1);
  });
}

(function wait () {
   if (!done) setTimeout(wait, 100);
})();
