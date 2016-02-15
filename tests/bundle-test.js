'use strict';
const fs = require('fs');
const path = require('path');

const proxyquire = require('proxyquire').noCallThru();
const test = require('tape');
const sinon = require('sinon');
let exampleJson = require('../example/package.json');
sinon.stub(fs, 'createWriteStream').returns({on: sinon.spy()});

const watchify = sinon.spy();
const bundleStub = {};
bundleStub.on = sinon.spy(() => bundleStub),
bundleStub.pipe =sinon.spy(() => bundleStub)


const browserifyStub =  {
  require: sinon.spy(),
  bundle: () => bundleStub,
  external: sinon.spy(),
  transform: sinon.spy(),
  plugin: sinon.spy(),
  on: sinon.spy()
}
const browserifySpy = sinon.spy(() => browserifyStub);

const bundle = proxyquire('../lib/bundle', {
  'browserify': browserifySpy,
  'watchify': watchify,
  './exit': (message) => {
    throw new Error(message);
  },
  'fs' : fs
});

let targetBuild = Object.assign(exampleJson.browserify.build['demo'], {target: 'demo'});
let outputFile = path.parse(targetBuild.outfile);

function resetSpies(t) {
  browserifySpy.reset();
  browserifyStub.plugin.reset();
  t.end();
}

test('required params', required => {
  required.test('requires an outfile ', t => {
    t.throws(() => bundle({}), /bundle must have an outfile/);
    t.end();
  });
});

test('bundling' , bundleTest => {
  bundle(targetBuild);

  bundleTest.test('externals', external => {
     external.test('adds required modules', t => {
       t.equal(browserifyStub.require.firstCall.args[0],'underscore');
       t.end();
     });
     external.test('writes to default outfile', t => {
       let bundleStream = path.parse(fs.createWriteStream.firstCall.args[0]);
       t.equal(bundleStream.name, `${outputFile.name}-externals`);
       t.end();
     });
     external.end();
  });

  bundleTest.test('source', source => {
    source.test('uses the main entry file', t => {
      t.equal(path.parse(targetBuild.main).base, browserifySpy.secondCall.args[0]);
      t.end();
    });

    source.test('adds transforms', t => {
      t.equal(targetBuild.transform[0], browserifyStub.transform.firstCall.args[0]);
      t.end();
    });

    source.test('sets externals', t => {
      t.deepEqual(targetBuild.external, browserifyStub.external.firstCall.args[0]);
      t.end();
    });

    source.test('writes to outfile', t => {
      let bundleStream = path.parse(fs.createWriteStream.secondCall.args[0]);
      t.equal(bundleStream.name, outputFile.name);
      t.end();
    });

    source.test('teardown', resetSpies);

    source.end();
  });
});

test('plugins', plugin => {

  plugin.test('watchify', watchify => {
    bundle(targetBuild, {watch: true});
    watchify.test('default config', t => {
      t.ok(browserifyStub.plugin.called);
      t.end();
    });
    watchify.test('teardown', resetSpies);
    watchify.end();
  });

  plugin.test('watchify polling', watchify => {
    bundle(targetBuild, {watch: true, poll: 500});
    watchify.test('enabled', t => {
      t.deepEqual({poll: 500}, browserifyStub.plugin.firstCall.args[1]);
      t.end();
    });

    watchify.test('teardown', resetSpies);
  });
});
