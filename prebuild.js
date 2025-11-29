import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy files from src/statics to build/statics
const srcStaticsDir = path.join(__dirname, 'src', 'statics');
const buildStaticsDir = path.join(__dirname, 'build', 'statics');

if (!fs.existsSync(buildStaticsDir)) {
    fs.mkdirSync(buildStaticsDir, { recursive: true });
    console.log(`✓ Created directory: ${buildStaticsDir}`);
}

const staticFiles = fs.readdirSync(srcStaticsDir).filter(file => file.endsWith('.json'));
console.log(`\nCopying static files...`);
for (const file of staticFiles) {
    const srcPath = path.join(srcStaticsDir, file);
    const destPath = path.join(buildStaticsDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied: ${file}`);
}

// Read the locales.json to get locale codes
const localesConfigPath = path.join(__dirname, 'src', 'statics', 'locales.json');
const localesConfig = JSON.parse(fs.readFileSync(localesConfigPath, 'utf-8'));

// Get all locale codes
const locales = localesConfig.map(locale => locale.code);

// Create the locales directory if it doesn't exist
const localesDir = path.join(__dirname, 'build', 'statics', 'locales');
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
    console.log(`✓ Created directory: ${localesDir}`);
}

// Read all JSON files from src/i18n
const i18nDir = path.join(__dirname, 'src', 'i18n');
const i18nFiles = fs.readdirSync(i18nDir).filter(file => file.endsWith('.json'));

console.log(`\nProcessing ${i18nFiles.length} i18n files for ${locales.length} locales...`);

// Initialize locale objects
const localeData = {};
locales.forEach(locale => {
    localeData[locale] = {};
});

// Process each i18n file
for (const file of i18nFiles) {
    const keyName = file.replace('.json', '');
    const filePath = path.join(i18nDir, file);
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Add translations to each locale
    for (const locale of locales) {
        if (translations[locale] !== undefined) {
            localeData[locale][keyName] = translations[locale];
        }
    }
}

// Function to sort object keys alphabetically
function sortObjectKeys(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

// Write locale files to build/statics/locales
let createdCount = 0;
for (const locale of locales) {
    const localeFilePath = path.join(localesDir, `${locale}.json`);
    const sortedData = sortObjectKeys(localeData[locale]);
    fs.writeFileSync(localeFilePath, JSON.stringify(sortedData, null, 4), 'utf-8');
    console.log(`✓ Created: ${locale}.json`);
    createdCount++;
}

console.log(`\n========================================`);
console.log(`Total locale files created: ${createdCount}`);
console.log(`========================================`);
console.log('Prebuild complete!');