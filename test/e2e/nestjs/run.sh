#!/usr/bin/env bash

set -e

node_major_version=$(node --version | cut -d. -f1 | cut -dv -f2)

if [ "$node_major_version" -lt 16 ]; then
  echo "Node.js version is less than 16. Exiting with status 0."
  exit 0
else
  echo "Node.js version is 16 or greater. Continuing..."
fi

cd test/e2e/nestjs

rm -rf project-name clean.js

npm install --global @nestjs/cli
yes npm | nest new project-name

cat << EOF > clean.js
const fs = require("fs")

const content = fs.readFileSync("./project-name/test/app.e2e-spec.ts", "utf8")

const contentWithTepper = content
  .replace(
    "import * as request from 'supertest'",
    "import { tepper } from 'tepper'",
  )
  .replace(
    "return request(app.getHttpServer())",
    "return tepper(app.getHttpServer())",
  )
  .replace(
    ".expect('Hello World!');",
    ".expect('Hello World!').run();",
  )

console.log(contentWithTepper)

EOF

node clean.js > ./project-name/test/app.new.e2e-spec.ts

mv ./project-name/test/app.new.e2e-spec.ts ./project-name/test/app.e2e-spec.ts

cd project-name

npm install --save-dev ../../../..

npm run test:e2e
