#!/bin/bash
set -e

PUBLIC="../../sample-app/public"
LOGGING="../../sample-app/node_modules/opentok-solutions-logging/opentok-solutions-logging.js"

task="$1"

#Run unit tests
if [ "$task" == "-t" ]; then
	jasmine
	exit 0
fi

#Create zip file with JS and doc
if [ "$task" == "-d" ]; then

	if [[ -d opentok.js-text-chat ]]
	then
		cd opentok.js-text-chat
		npm i
		npm update
  	cp -v node_modules/opentok-one-to-one-communication/opentok-one-to-one-communication.js src/opentok-one-to-one-communication.js
		cp -v node_modules/opentok-solutions-logging/dist/opentok-solutions-logging.js src/opentok-solutions-logging.js
		gulp dist
		cd dist
    cp -v text-chat-acc-pack.js $PUBLIC/js/components/text-chat-acc-pack.js
    cp -v theme.css $PUBLIC/css/theme.css
    gulp zip
		exit 0
	else
		echo "Please run this script from 'JS'."
		exit 1
	fi
fi

echo Invalid parameters, please use ‘-t’ to run tests or ‘-d’ to create zip file with JS and doc.
exit 1
