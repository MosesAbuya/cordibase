const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.pnpm = pkg.pnpm || {};
pkg.pnpm.ignoredBuiltDependencies = ["@google/genai", "msgpackr-extract", "protobufjs"];
pkg.pnpm.onlyBuiltDependencies = [];
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Fixed pnpm package.json');
