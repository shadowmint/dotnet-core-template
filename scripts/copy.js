const fs = require('fs');
const path = require('path');

/** Log debug messages to the console? */
const DEBUG = true;

function copy(src, dest) {
  return new Promise((resolve, reject) => {
    walkFind(src).then((list) => {
      mkdir(dest).then(() => {
        console.log(list);
        walkCopy(src, dest, list).then(resolve, reject);
      }, reject);
    }, reject);
  });
}

function walkFind(src) {
  trace('explore: ' + src);
  let data = {pending: ['.'], busy: 0, dirs: [], files: [], error: null};
  return new Promise((resolve, reject) => {
    let step = () => {
      if (data.error) {
        reject(data.error);
      }
      else if (data.busy || data.pending.length) {
        walkFindFSM(src, '', data, step);
      }
      else {
        resolve(data);
      }
    };
    walkFindFSM(src, src, data, step);
  });
}

function walkFindFSM(root, part, data, step) {
  let aborted = false;
  let dir = path.join(part, data.pending.shift());
  data.busy += 1;
  trace("- Folder: " + dir);
  fs.readdir(dir, (err, list) => {
    if (aborted) return;
    if (err) {
      data.error = err;
      aborted = true;
      return;
    }
    let resolved = 0;
    for (let i = 0; i < list.length; i++) {
      let here = path.join(dir, list[i]);
      trace("-- File: " + here);
      fs.stat(here, (err, stat) => {
        if (aborted) return;
        if (err) {
          aborted = true;
          data.error = err;
          return;
        }
        if (stat.isDirectory()) {
          data.pending.push(here);
        }
        else {
          let shortname = here.substr(root.length + 1, here.length);
          data.files.push(shortname);
        }
        resolved += 1;
        if (resolved == list.length) {
          data.busy -= 1;
          let shortname = dir.substr(root.length + 1, dir.length);
          data.dirs.push(shortname);
          trace("- Finished: " + here);
          step();
        }
      });
    }
  });
}

function walkCopy(root, dest, data) {
  return new Promise((resolve, reject) => {
    let folderCount = 0;
    let fileCount = 0;
    let folders = data.dirs.map(i => path.join(dest, i));
    let files = data.files.map(i => [path.join(root, i), path.join(dest, i)]);
    let error = null;
    trace("Copy to: " + dest);
    let continueWithCopy = (path) => {
      folderCount += 1;
      trace("mkdir: (" + folderCount + "/" + folders.length + ") " + path);
      if (error) {
        reject(error);
      }
      if (folderCount == folders.length) {
        console.log("Done with folders");
        files.map(i => copyFile(i).then(() => finishedCopy(i), (err) => { error = err; }));
      }
    };
    let finishedCopy = (path) => {
      fileCount += 1;
      trace(" copy: (" + fileCount + "/" + files.length + ") " + path);
      if (error) {
        reject(error);
      }
      if (fileCount == files.length) {
        console.log("Done with files");
        resolve({folders: folders, files: files.map(i => i[1])});
      }
    };
    folders.map(i => mkdir(i).then(() => continueWithCopy(i), (err) => { error = err; }));
  });
}

function copyFile(paths) {
  const src = paths[0];
  const dest = paths[1];
  return new Promise((resolve, reject) => {
    console.log("cp " + src + " " + dest);
    fs.copyFile(src, dest, (err) => {
      console.log("cp " + src + " " + dest + " ", err);
      if (err) reject(err);
      resolve();
    });
  }).catch((err) => {
    reject(err);
  });
}

function mkdir(target) {
  return new Promise((resolve, reject) => {
    try {
      let parts = target.split(path.sep);
      let partial = path.isAbsolute(target) ? '/' : process.cwd();
      for (let i = 0; i < parts.length; i++) {
        partial = path.join(partial, parts[i]);
        if (!fs.existsSync(partial)) {
          fs.mkdirSync(partial);
        }
      }
      resolve();
    }
    catch(err) {
      reject(err);
    }
  });
}

function trace(message) {
  if (DEBUG) {
    console.log(message);
  }
}

module.exports = {
  copy: copy
};
