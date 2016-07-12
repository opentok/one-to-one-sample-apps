#!/bin/bash
LOGGING="../../../node_modules/opentok-solutions-logging/opentok-solutions-logging.js"

npm i
cd public/js/components
cp -v $LOGGING opentok-solutions-logging.js


