'use strict'
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const browserify =  require('browserify');
const watchify  = require('watchify');
const exit = require('./exit');

let logDurration = (stream, message) => {
  console.time(message);
  stream.on('end', () => console.timeEnd(message));
}

module.exports = (targetBundle, cnfg, opts) => {

  let basedir = path.resolve('.');
  let targetOutfile = targetBundle.outfile;
  let config = Object.assign({},cnfg);

  if(!targetOutfile) {
    exit(`bundle must have an outfile`);
  }

  let targetOutfileInfo = path.parse(targetOutfile);
  let externals = _.map(targetBundle.external, (ext) => _.flatten([ext]));

  let targetBasedir = path.join(basedir,targetOutfileInfo.dir);
  // ------------------------------------------------------------------
  //                     bundle external requires
  // ------------------------------------------------------------------
  if(!config.sourceOnly) {
    let xb = browserify({basedir});
    for(let external of externals) {
      let expose = _.last(external);
      xb.require(_.first(external), {expose});
    }

    let xbundle = xb.bundle();
    xbundle.on('error',exit);

    let externalOutfile = targetBundle.externalOutfile;

    if(!externalOutfile) {
      externalOutfile = path.join(targetBasedir,
                                  `${targetOutfileInfo.name}-externals.js`);
    }
    logDurration(xbundle, `bundled ${targetBundle.target} externals`);
    xbundle.pipe(fs.createWriteStream(externalOutfile));
  }

  // ------------------------------------------------------------------
  //                     bundle target
  // ------------------------------------------------------------------

  let main = targetBundle.main;
  if(!main) {
    exit(`${target} requires a main file to bundle`);
  }

  let mainFileInfo = path.parse(main);
  let bConfig = Object.assign({},config,targetBundle,opts);
  if(bConfig.watch) {
    Object.assign(bConfig,{cache: {}, packageCache: {}});
  }
  basedir = path.join(basedir, mainFileInfo.dir);
  let bOpts = Object.assign({},bConfig,{basedir});
  let b = browserify(mainFileInfo.base ,bOpts);
  b.external(_.map(externals,_.last));

  if(bConfig.watch) {
    b.plugin(watchify, {
      poll: bConfig.poll || false
    })
  }

  for(let t of bConfig.transform) {
    b.transform(t);
  }

  function bundle() {
    let _bundle = b.bundle();
    logDurration(_bundle, `bundled ${targetBundle.target} src`);
    _bundle.on('error', exit)
           .pipe(fs.createWriteStream(path.join(targetBasedir, targetOutfileInfo.base)));
  }

  if(bConfig.watch) {
    b.on('update', bundle);
  }
  b.on('error', exit);
  bundle();
}
