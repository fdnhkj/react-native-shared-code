const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;

let platformSpecificLocTotal = 0;
process.argv.slice(2).forEach((filePath) => {
  const data = fs.readFileSync(filePath, {encoding: 'utf8'});
  traverse(
    babylon.parse(data, {sourceType: 'module', plugins: ['jsx', 'flow', 'objectRestSpread', 'classProperties']}), 
    {
      ImportDeclaration(path, state) {
        if(path.get('source').node.value === 'react-native') {
          path.get('specifiers').forEach(function(specifier) {
            if(specifier.node.imported) {
              const importedIdentifierName = specifier.node.imported.name;
              if(importedIdentifierName === 'Platform') {
                const platformSpecificLoc = new Set();
                const {referencePaths} = path.scope.getBinding(importedIdentifierName);
                referencePaths.forEach(function(referencePath) {
                  platformSpecificLoc.add(referencePath.node.loc.start.line);
                });
                platformSpecificLocTotal += platformSpecificLoc.size;
              }
            }
          });
        }
      }
    }
  );
});
console.log(platformSpecificLocTotal);