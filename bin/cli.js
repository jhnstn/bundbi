#!/usr/bin/env node
'use strict'
const path = require('path');
const _ = require('underscore');
const program = require('commander');
const bundle = require('../lib/bundle');
const exit = require('../lib/exit');

let packageJson = require(path.resolve('./package.json'));

if(!packageJson.browserify || !packageJson.browserify.build) {
  exit('nothing to do: can\'t find the build config');
}

let builds = packageJson.browserify.build;
function bundleTarget(target,options) {
  let targetBuild = builds[target];
  if(!targetBuild) {
    exit(`nothing to do for '${target}' bundle`);
  }

  let opts = _.pick(options, 'watch');
  bundle(Object.assign(targetBuild, {target}),
         Object.assign(packageJson.browserify, opts));
}

program
  .version(packageJson.version)
  .arguments('<target>')
  .option('-w, --watch', 'enable watch',false)
  .action((target) => {
    let targetBuild = builds[target];
    if(!targetBuild) {
      exit(`nothing to do for '${target}' bundle`);
    }
    bundle(Object.assign(targetBuild, {target}),
           Object.assign(packageJson.browserify, {watch: program.watch}));
  }).parse(process.argv);
