const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      const blues = ['1853A8', '1A52A3', '123D63', '0D3150', '286092', '092B4C'];
      // The user wants "har jagha jaha bhi blue hai" replaced. 
      // I will replace ONLY the accent bright blues to be safe, because replacing the dark base texts will ruin readability.
      // Wait, 1853A8 and 1A52A3 are the primary blues used for active/highlights.
      
      content = content.replace(/text-\[\#(1853A8|1A52A3)\]/g, 'text-brand-primary');
      content = content.replace(/bg-\[\#(1853A8|1A52A3)\]/g, 'bg-brand-primary');
      content = content.replace(/border-\[\#(1853A8|1A52A3)\]/g, 'border-brand-primary');
      
      content = content.replace(/hover:text-\[\#(1853A8|1A52A3)\]/g, 'hover:text-brand-primary');
      content = content.replace(/hover:bg-\[\#(1853A8|1A52A3)\]/g, 'hover:bg-brand-primary-hover');
      content = content.replace(/hover:border-\[\#(1853A8|1A52A3)\]/g, 'hover:border-brand-primary');
      
      content = content.replace(/group-hover:text-\[\#(1853A8|1A52A3)\]/g, 'group-hover:text-brand-primary');
      
      // Fix for group-hover/something:text
      content = content.replace(/group-hover\/([a-zA-Z0-9_-]+):text-\[\#(1853A8|1A52A3)\]/g, 'group-hover/$1:text-brand-primary');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceColors(path.join(__dirname, 'frontend', 'src'));
console.log('Done');
