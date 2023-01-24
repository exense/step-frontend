#!/bin/bash

SPEC_URL=$1
GENERATED_CODE_LOCATION=./projects/step-core/src/lib/client/generated
CLIENT_MODULE_NAME=StepGeneratedClientModule

# downloading file before executing openapi to make sure it is already generated in the BE
curl $SPEC_URL  > /dev/null

npx openapi --input $SPEC_URL --output $GENERATED_CODE_LOCATION --client angular --useUnionTypes --name $CLIENT_MODULE_NAME --exportCore false --exportSchemas true

# make services global singletons and remove them from the module's provided-array
sed -i "" -e "s/@Injectable()/@Injectable({providedIn:'root'})/g" $GENERATED_CODE_LOCATION/services/*Service.ts
sed -i "" -e "/.*Service.*/d" $GENERATED_CODE_LOCATION/$CLIENT_MODULE_NAME.ts
sed -i "" -e  "s#/rest#rest#g" $GENERATED_CODE_LOCATION/StepGeneratedClientModule.ts

# run prettier
npx prettier --write "$GENERATED_CODE_LOCATION/*"
npx prettier --write "$GENERATED_CODE_LOCATION/**/*"
