#!/bin/bash

browserify ./src/index.js -o ./dist/bundle.js -t [ babelify --presets [ es2015 react ] ] -g [uglifyify]

