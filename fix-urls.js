const fs=require('fs'); 
const path=require('path'); 

function walk(dir) { 
  let results = []; 
  const list = fs.readdirSync(dir); 
  list.forEach(file => { 
    file = path.resolve(dir, file); 
    const stat = fs.statSync(file); 
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist') && !file.includes('.next')) { 
      results = results.concat(walk(file)); 
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
      results.push(file); 
    } 
  }); 
  return results; 
} 

const files = walk('apps'); 
let count=0; 
files.forEach(f => { 
  let content=fs.readFileSync(f, 'utf8'); 
  let newContent = content.replace(/\(process\.env\.CORE_SERVICE_INTERNAL_URL\s*\|\|\s*'http:\/\/127\.0\.0\.1:3001'\)/g, "(process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL.replace('/api/auth', '') : (process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3000'))"); 
  
  newContent = newContent.replace(/process\.env\.CORE_SERVICE_URL\s*\|\|\s*'http:\/\/localhost:3001'/g, "(process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL.replace('/api/auth', '') : (process.env.CORE_SERVICE_URL || 'http://127.0.0.1:3000'))"); 
  
  if(newContent!==content){
    fs.writeFileSync(f, newContent); 
    count++;
  } 
}); 
console.log('Updated ' + count + ' files');
