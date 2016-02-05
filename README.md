# bundbi

bundle builder for browserify

## install

```

# to get the cli
$ npm install -g bundbi

$ bundbi [build name]

```

## Usage

In your `package.json`'s `browserify` config add a `build` object.
Each value in `build` is the config for building a bundle. You and supply
The same browserify configs detailed [here](https://github.com/substack/node-browserify#browserifyfiles--opts).

A build also accepts these attributes:

- `main` : (required) path to main entry point for browserify to build from
- `outfile` : (required) file where the bundle is written to
- `external`: an array of external modules. see [here](https://github.com/substack/browserify-handbook#external-bundles)
- `watch` : enables watchify on the `main` file

Any config can be added directly under the the `browserify` key to provide configuration for all builds. These can be overridden in each `build` config.

## External Builds

If an `external` list is provided, `buildify` will create an external build with each module in the list. By default the bundle will be written to the same path as the build `outfile` with `-externals.js` appended to the file name e.g.

given `app/assets/app.js`

The externals will be written to `app/assets/app-externals.js`

## Example

in `package.json`

```

{
  ....
  "scripts" : {
    "build" : "bundbi app"
  },
  "browserify" : {
    "transform" : ["babelify"],
    "extensions" : [
      ".jsx"
    ],
    "build" : {
      "app" : {
        "main" : "src/app.js",
        "outfile" : "../app/assets/app.js",
        "external" : [
          "flux",
          "events"
        ]

      }
    }
  }
}

```

then

```
$ npm run build
```


## Todo

- [ ] common externals
- [ ] common external resolution with build level externals e.g. keep external bundles DRY
- [ ] allow for custom paths for external bundles
- [ ] add `commander` for more robust cli control
