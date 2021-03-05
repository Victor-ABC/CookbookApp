const path = require('path');
const fs = require('fs');

const RELEVANT_FILES = ['.ts', '.json', '.html', '.scss'];
const DIR_TO_IGNORE = ['node_modules', 'dist', '.nyc_output', 'coverage', '.vscode', '.git'];

function printFiles(author, filePath) {
  if (fs.lstatSync(filePath).isDirectory()) {
    if (DIR_TO_IGNORE.includes(path.basename(filePath))) return;
    fs.readdirSync(filePath).forEach(childFilePath => {
      printFiles(author, path.join(filePath, childFilePath));
    });
  } else {
    if (!RELEVANT_FILES.includes(path.extname(filePath))) return;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`Autor: ${author}`)) {
      console.log(filePath);
    }
  }
}

printFiles(process.argv[2], 'api-server');
printFiles(process.argv[2], 'client');