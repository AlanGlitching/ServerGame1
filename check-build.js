const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build files...\n');

const buildDir = path.join(__dirname, 'client', 'build');
const requiredFiles = [
  'index.html',
  '_redirects',
  'static/js/main.53a84f29.js',
  'static/css/main.fa2f2825.css',
  'asset-manifest.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

console.log('\n📊 Build Summary:');
console.log(`Total required files: ${requiredFiles.length}`);
console.log(`Files present: ${requiredFiles.filter(f => fs.existsSync(path.join(buildDir, f))).length}`);
console.log(`Files missing: ${requiredFiles.filter(f => !fs.existsSync(path.join(buildDir, f))).length}`);

if (allFilesExist) {
  console.log('\n🎉 All required files are present!');
} else {
  console.log('\n⚠️  Some files are missing. Check the build process.');
}

// Check file sizes
console.log('\n📏 File Sizes:');
requiredFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`${file}: ${sizeKB} KB`);
  }
}); 