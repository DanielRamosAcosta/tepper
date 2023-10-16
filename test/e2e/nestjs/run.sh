#!/usr/bin/env bash

set -e
set -x

cd test/e2e/nestjs

rm -rf project-name

npm install --global @nestjs/cli
yes npm | nest new project-name

cd project-name

npm install --save-dev ../../../..

sed -ie '3d' test/app.e2e-spec.ts
sed -i '' '3i\
import { tepper } from "tepper"
' test/app.e2e-spec.ts

sed -ie '19d' test/app.e2e-spec.ts
sed -i '' '19i\
    return tepper(app.getHttpServer())
' test/app.e2e-spec.ts

npm run test:e2e
