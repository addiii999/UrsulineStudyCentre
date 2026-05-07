const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'src', 'app', 'api'));
let count = 0;
files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content.replace(/!checkAdminAuth\(req\)/g, '!(await checkAdminAuth(req))');
        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            console.log(`Updated ${file}`);
            count++;
        }
    }
});
console.log(`Updated ${count} files.`);
