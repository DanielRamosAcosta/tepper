#!/usr/bin/env bash

set -e

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
EOF

if [ "$node_major_version" -eq 16 ]; then
  cat << EOF >> clean.js
    .replace(
      "import { tepper } from 'tepper'",
      "import { tepper } from 'tepper';\nimport fetch from 'node-fetch'",
    )
    .replace(
      "return tepper(app.getHttpServer())",
      "return tepper(app.getHttpServer(), { fetch })",
    )
EOF
fi

cat << EOF >> clean.js

console.log(contentWithTepper)

EOF

node clean.js > ./project-name/test/app.new.e2e-spec.ts

mv ./project-name/test/app.new.e2e-spec.ts ./project-name/test/app.e2e-spec.ts

cd project-name

npm install --save-dev ../../../.. node-fetch@2 @types/node-fetch

npm run test:e2e
