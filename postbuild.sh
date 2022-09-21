#!/bin/bash

## add timestamp to scripts.sh in order to prevent caching of legacy code
TIMESTAMP=$(date +%s)
SCRIPTSJS_FILENAME_BEFORE=scripts.js
SCRIPTSJS_FILENAME_AFTER=scripts-$TIMESTAMP.js

SCRIPTSJS_FILE_FOLDER=dist/step-app/app
INDEX_HTML_FILE_PATH=dist/step-app/index.html

mv $SCRIPTSJS_FILE_FOLDER/$SCRIPTSJS_FILENAME_BEFORE $SCRIPTSJS_FILE_FOLDER/$SCRIPTSJS_FILENAME_AFTER
sed -i "" -e "s/$SCRIPTSJS_FILENAME_BEFORE/$SCRIPTSJS_FILENAME_AFTER/g" $INDEX_HTML_FILE_PATH
