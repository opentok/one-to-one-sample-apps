#!/bin/bash
set -e

PUBLIC="../../sample-app/public"
SRC_PATH="../opentok.js-ss-annotation/src/"
IMAGES_PATH="../opentok.js-ss-annotation/dist/images"
TEMPLATES_PATH="../opentok.js-ss-annotation/dist/templates/"
CSS_PATH="../opentok.js-ss-annotation/css"
ANNOTATIONS_PATH="../opentok.js-ss-annotation/annotations"
NPM_MODULES="../opentok.js-ss-annotation/node_modules"

function fetchNpmPackages()
{
  echo "Fetching NPM Packages"
	npm i
	echo "Checking for NPM Updates"
	npm update

  copyDependencies
}

function copyDependencies()
{
	echo "Copying NPM Packages"
	cp -v $NPM_MODULES/opentok-one-to-one-communication/opentok-one-to-one-communication.js $SRC_PATH
	cp -v $NPM_MODULES/opentok-annotation/dist/opentok-annotation.js $SRC_PATH
	cp -v $NPM_MODULES/opentok-screen-sharing/dist/opentok-screen-sharing.js $SRC_PATH
	cp -v $NPM_MODULES/opentok-solutions-logging/dist/opentok-solutions-logging.js $SRC_PATH
	cp -v $NPM_MODULES/opentok-solutions-css/style.css $CSS_PATH
}

if [[ -d opentok.js-ss-annotation ]]
then
	cd opentok.js-ss-annotation

	fetchNpmPackages

	gulp dist
        gulp zip
	cd dist
  cp -v screenshare-annotation-acc-pack.js $PUBLIC/js/components/screenshare-annotation-acc-pack.js
	cp -v opentok-style.css $PUBLIC/css/
else
	echo "Please run this script from 'js-screensharing-annotation'."
	exit 1
fi
