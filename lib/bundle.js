'use strict'
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const browserify =  require('browserify');
const watchify  = require('watchify');
const errorExit = require('./error');


module.exports = (targetBundle, config) => {

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
  xbundle.pipe(fs.createWriteStream(externalOutfile));

  // ------------------------------------------------------------------
  //                     bundle target
  // ------------------------------------------------------------------

  let main = targetBundle.main;
  let extensions = config.extensions
  let plugin = [];
  if(config.watch) {
    plugin.push(watchify);
  }
  basedir = path.join(basedir, 'src');
  if(!main) {
    errorExit(`${target} requires a main file to bundle`);
  }
  let b = browserify('app.js',{basedir, extensions, plugin});
  b.external(_.map(externals,_.last));
  if(config.watch) {
    b.on('update', bundle);
  }
  bundle();

  function bundle() {
    console.log(`bundling ${main}`);
    let stream = fs.createWriteStream(path.join(basedir,'..', targetOutfile));
    stream.on('end',
    b.bundle().pipe(stream);
  }
}
