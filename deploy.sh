#!/usr/bin/env bash

set -e

git checkout gh-pages
git merge master

npm run index
npm run build

awk -F, '{$1=$1+1;print}' OFS=, VERSION > VERSION.tmp && mv VERSION{.tmp,}

git commit -a -m "Creates release deploy #`cat VERSION`"
git push

git checkout master
