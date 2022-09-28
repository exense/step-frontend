#!/bin/bash

TIMESTAMP=$(date +%s)

DIST_DIR=dist/step-app
sed -i "s/_REPLACE_ME_WITH_A_TIMESTAMP_/$TIMESTAMP/g" $DIST_DIR/index.html
sed -i "s/_REPLACE_ME_WITH_A_TIMESTAMP_/$TIMESTAMP/g" $DIST_DIR/*.js
