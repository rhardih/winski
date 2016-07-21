#!/usr/bin/env bash

set -e

git stash

git checkout gh-pages
git merge master

npm run index
npm run build_scss
npm run build_js

awk -F, '{$1=$1+1;print}' OFS=, VERSION > VERSION.tmp && mv VERSION{.tmp,}

git commit -a -m "Creates release deploy # `cat VERSION`"
git push -f

git checkout master

git stash pop

npm run index

# re-trigger bundle build
touch js/app.js
touch js/download.js
