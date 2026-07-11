import fs from 'fs';
const content = fs.readFileSync('src/core/history-manager.ts', 'utf8');
const idx = content.indexOf("case 'batch'");
console.log('Index:', idx);
console.log('Context:', JSON.stringify(content.substring(Math.max(0, idx-100), idx+100)));
console.log('Bytes:', Buffer.from(content.substring(Math.max(0, idx-100), idx+100)).toString('hex'));