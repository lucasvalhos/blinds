#!/bin/bash

rm -rf public || exit 0
mkdir -p public/js

npm run build:css
npm run build:html
npm run build:js


cd public

git init

git config user.name "Travis-CI"
git config user.email "travis@w3ctag.org"

git add .
git commit -m "Deploy to GitHub Pages"

git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
