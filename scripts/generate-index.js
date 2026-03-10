#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// 根据模块名生成注释
function getCategoryComment(moduleName) {
  // 首字母大写
  const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `${capitalized} utilities`;
}

// 解析文件中的所有 export
function parseExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const valueExports = [];
  const typeExports = [];
  
  // 匹配类型导出 (interface, type, enum)
  const typeExportRegex = /^export\s+(?:interface|type|enum)\s+(\w+)/gm;
  let match;
  
  while ((match = typeExportRegex.exec(content)) !== null) {
    typeExports.push(match[1]);
  }
  
  // 匹配值导出 (const, function, class)
  const valueExportRegex = /^export\s+(?:const|function|class)\s+(\w+)/gm;
  while ((match = valueExportRegex.exec(content)) !== null) {
    valueExports.push(match[1]);
  }
  
  // 匹配 export { ... }
  const namedExportRegex = /export\s+\{([^}]+)\}/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(name => {
      const trimmed = name.trim();
      // 处理 "x as y" 的情况
      const asMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
      if (asMatch) {
        return asMatch[2]; // 返回 alias 后的名字
      }
      return trimmed;
    }).filter(Boolean);
    // 默认添加到值导出，除非在类型导出中已存在
    names.forEach(name => {
      if (!typeExports.includes(name)) {
        valueExports.push(name);
      }
    });
  }
  
  return {
    types: [...new Set(typeExports)],
    values: [...new Set(valueExports)]
  };
}

// 生成 index.ts 内容
function generateIndexContent() {
  const files = fs.readdirSync(srcDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .sort();
  
  let content = '';
  
  files.forEach(file => {
    const moduleName = file.replace('.ts', '');
    const filePath = path.join(srcDir, file);
    const { types, values } = parseExports(filePath);
    
    if (types.length === 0 && values.length === 0) return;
    
    const categoryComment = getCategoryComment(moduleName);
    
    content += `// ${categoryComment}\n`;
    
    // 导出类型
    if (types.length > 0) {
      content += `export type {\n`;
      types.sort().forEach((exp, index) => {
        content += `  ${exp}`;
        if (index < types.length - 1) {
          content += ',\n';
        } else {
          content += '\n';
        }
      });
      content += `} from './${moduleName}'\n`;
    }
    
    // 导出值
    if (values.length > 0) {
      content += `export {\n`;
      values.sort().forEach((exp, index) => {
        // 特殊处理：MD5 模块的导出别名
        if (moduleName === 'md5' && exp === 'MD5') {
          content += `  md5 as MD5`;
        } else {
          content += `  ${exp}`;
        }
        
        if (index < values.length - 1) {
          content += ',\n';
        } else {
          content += '\n';
        }
      });
      content += `} from './${moduleName}'\n`;
    }
    
    content += '\n';
  });
  
  return content.trim() + '\n';
}

// 主函数
function main() {
  try {
    console.log('🔍 Scanning exports from src files...');
    
    const indexContent = generateIndexContent();
    const indexPath = path.join(srcDir, 'index.ts');
    
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    
    console.log('✅ index.ts has been generated successfully!');
    console.log(`📝 File: ${indexPath}`);
  } catch (error) {
    console.error('❌ Error generating index.ts:', error);
    process.exit(1);
  }
}

main();
