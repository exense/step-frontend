#!/bin/bash

SPEC_URL=$1
GENERATED_CODE_LOCATION=./projects/step-core/src/lib/client/generated
CLIENT_MODULE_NAME=StepClientModule.ts

npx openapi --input $SPEC_URL --output $GENERATED_CODE_LOCATION --client angular --useUnionTypes --name $CLIENT_MODULE_NAME --exportCore false --exportSchemas true

# make services providedIn:'root' and remove them from the module's provided-array
sed -i "s/@Injectable()/@Injectable({providedIn:'root'})/g" $GENERATED_CODE_LOCATION/services/*Service.ts
sed -i "/.*Service.*/d" $GENERATED_CODE_LOCATION/$CLIENT_MODULE_NAME
