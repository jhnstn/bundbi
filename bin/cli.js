#!/usr/bin/env node
'use strict'
const path = require('path');
const bundle = require('../lib/bundle');
const exit = require('../lib/exit');
const meow = require('meow');

const cli = meow(`
  Usage
    Requires adding build config in package.json
    see https://github.com/jhnstn/bundbi#example for more details

    $ bundbi <build>

  Options
    -w, --watch Watches for changes in source
    -d, --debug Enable Browserify debug setting
    --poll=INTERVAL Enable polling for NFS mounted directories

  Examples
    $ bundbi app -w
`, {
    alias: {
      w: 'watch',
      d: 'debug'
    }
});

let packageJson = require(path.resolve('./package.json'));

if(!packageJson.browserify || !packageJson.browserify.build) {
  exit('nothing to do: can\'t find the build config',0);
}

let builds = packageJson.browserify.build;
let target = cli.input[0];

let targetBuild = builds[target];
if(!targetBuild) {
  exit(`nothing to do for '${target}' bundle`,0);
}
bundle(Object.assign({},targetBuild, {target}),
       Object.assign({},packageJson.browserify, cli.flags));
