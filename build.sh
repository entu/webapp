#!/bin/bash

# set -o errexit -o nounset

npm install entu-cms@1.1.3

./node_modules/entu-cms/build.js ./entu-ssg.yaml

cp -r ./assets/ ./build/assets
cp ./assets/robots.txt ./build/robots.txt
cp ./assets/img/favicon.ico ./build/favicon.ico
