#!/usr/bin/env node
'use strict'
const path = require('path');
const _ = require('underscore');
const bundle = require('../lib/bundle');
const errorExit = require('../lib/error');

let packageJson = require(path.resolve('./package.json'));

if(!packageJson.browserify) {
  errorExit('nothing to do');
}

let builds = packageJson.browserify.bundle;
let target = _.last(process.argv);
let targetBundle = builds[target];

if (!targetBundle) {
  errorExit(`nothing to do for '${target}' bundle`);
}

bundle(targetBundle, Object.assign(packageJson.browserify,{watch}));
