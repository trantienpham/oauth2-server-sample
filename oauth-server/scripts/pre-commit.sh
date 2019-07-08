#!/usr/bin/env bash

NODE=$(which node)

if [[ -z $NODE ]]; then
  echo "Please install NodeJS first."
  exit 1
fi

$NODE ./node_modules/.bin/eslint .

if [ $? -ne 0 ]; then
  echo "*** ERROR *** : JSLint failed for file: $file, please fix code and recommit"
  exit 1
else
  exit 0
fi
