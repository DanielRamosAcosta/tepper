#!/usr/bin/env bash

set -e

cd test/e2e/nestjs

rm -rf project-name

npx @nestjs/cli new project-name

cd project-name

npm i --save-dev ../../..

sed -ie '3d' test/app.e2e-spec.ts
sed -i '' '3i\
import { tepper } from "tepper"
' test/app.e2e-spec.ts

npm run test:e2e
