'use strict'
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const browserify =  require('browserify');
const watchify  = require('watchify');
const errorExit = require('./error');

let logDurration = (stream, message) => {
  stream.on('pipe', () => console.time(message));
  stream.on('finish', () => console.timeEnd(message));
}

module.exports = (targetBundle, config, opts) => {

  let basedir = path.resolve('.');
  let targetOutfile = targetBundle.outfile;

  if(!targetOutfile) {
    errorExit(`${target} must have an outfile`);
  }
  let targetOutfileInfo = path.parse(targetOutfile);
  let externals = _.map(targetBundle.external, (ext) => _.flatten([ext]));

  // ------------------------------------------------------------------
  //                     bundle external requires
  // ------------------------------------------------------------------

  let xb = browserify({basedir});
  for(let external of externals) {
    let expose = _.last(external);
    xb.require(_.first(external), {expose});
  }

  let xbundle = xb.bundle();
  xbundle.on('error', errorExit);

  let externalOutfile = targetBundle.externalOutfile;

  if(!externalOutfile) {
    externalOutfile = path.join(basedir,
                                targetOutfileInfo.dir,
                                `${targetOutfileInfo.name}-externals.js`)
  }
  let xStream = fs.createWriteStream(externalOutfile);
  logDurration(xStream, `bundled ${targetBundle.target} externals`);
  xbundle.pipe(xStream);

  // ------------------------------------------------------------------
  //                     bundle target
  // ------------------------------------------------------------------

  let main = targetBundle.main;
  if(!main) {
    errorExit(`${target} requires a main file to bundle`);
  }

  let mainFileInfo = path.parse(main);
  let plugin = [];
  let bConfig = Object.assign({},config,targetBundle,opts);

  if(bConfig.watch) {
    // https://github.com/substack/watchify#watchifyb-opts
    plugin.push(watchify);
    bConfig.cache = {};
    bConfig.packageCache = {};
  }
  basedir = path.join(basedir, mainFileInfo.dir);
  let bOpts = Object.assign({},bConfig,{basedir,plugin});
  console.log(bOpts);
  let b = browserify('app.js',bOpts);
  b.external(_.map(externals,_.last));

  b.on('update', bundle);
  b.on('error', errorExit);
  bundle();

  function bundle() {
    let stream = fs.createWriteStream(path.join(basedir,'..', targetOutfile));
    logDurration(stream, `bundled ${targetBundle.target} src`);
    b.bundle().pipe(stream);
  }
}
