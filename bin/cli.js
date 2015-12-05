#!/usr/bin/env node
'use strict'
const path = require('path');
const _ = require('underscore');
const bundle = require('../lib/bundle');
const errorExit = require('../lib/error');

let packageJson = require(path.resolve('./package.json'));

if(!packageJson.browserify || !packageJson.browserify.build) {
  console.log('nothing to do: can\'t find the build config');
  process.exit(0);
}

let builds = packageJson.browserify.build;
let target = _.last(process.argv);
let targetBundle = builds[target];
let watch  = false;

if (!targetBundle) {
  console.log(`nothing to do for '${target}' bundle`);
  process.exit(0);
}

bundle(Object.assign(targetBundle, {target}),
       Object.assign(packageJson.browserify, {watch}));
