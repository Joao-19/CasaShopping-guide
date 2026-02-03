const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(process.cwd(), '.next');
const ENVS = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_API_HOST',
    'NEXT_PUBLIC_WEB_URL',
    'NEXT_PUBLIC_BASE_PATH'
];

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        ENVS.forEach(envKey => {
            const placeholder = 'APP_' + envKey;
            const value = process.env[envKey] || ''; 
            // Replace all occurrences
            if (content.includes(placeholder)) {
                content = content.split(placeholder).join(value);
                changed = true;
                 if (value) {
                    console.log(`Replacing ${placeholder} with value (length: ${value.length}) in ${path.basename(filePath)}`);
                } else {
                    console.log(`Replacing ${placeholder} with empty string in ${path.basename(filePath)}`);
                }
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return;
    }
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (/\.(js|json|html)$/.test(file)) {
            replaceInFile(filePath);
        }
    });
}

console.log('Starting runtime env replacement for Admin App...');
console.log(`Target Directory: ${TARGET_DIR}`);
walkDir(TARGET_DIR);
console.log('Finished runtime env replacement.');
