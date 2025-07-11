#!/usr/bin/env node

/**
 * Validation script for Smithery deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Smithery deployment configuration...\n');

const checks = [];

// Check required files
const requiredFiles = [
  'smithery.yaml',
  'package.json',
  'build/smithery-server.js',
  'build/smithery.yaml',
  'build/erc20-contracts-rootstock.json'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `File: ${file}`, passed: exists });
}

// Check smithery.yaml structure
console.log('\n📋 Validating smithery.yaml...');
try {
  const smitheryConfig = fs.readFileSync('smithery.yaml', 'utf8');
  
  const hasERC20Tools = smitheryConfig.includes('deploy_erc20_token') &&
                       smitheryConfig.includes('get_token_info') &&
                       smitheryConfig.includes('mint_tokens');
  
  console.log(`   ${hasERC20Tools ? '✅' : '❌'} ERC20 tools defined`);
  checks.push({ name: 'ERC20 tools in smithery.yaml', passed: hasERC20Tools });
  
  const hasCategories = smitheryConfig.includes('categories:') &&
                       smitheryConfig.includes('- tokens') &&
                       smitheryConfig.includes('- erc20');
  
  console.log(`   ${hasCategories ? '✅' : '❌'} ERC20 categories defined`);
  checks.push({ name: 'ERC20 categories in smithery.yaml', passed: hasCategories });
  
  const hasKeywords = smitheryConfig.includes('- erc20') &&
                     smitheryConfig.includes('- token') &&
                     smitheryConfig.includes('- token-deployment');
  
  console.log(`   ${hasKeywords ? '✅' : '❌'} ERC20 keywords defined`);
  checks.push({ name: 'ERC20 keywords in smithery.yaml', passed: hasKeywords });
  
} catch (error) {
  console.log(`   ❌ Error reading smithery.yaml: ${error.message}`);
  checks.push({ name: 'smithery.yaml readable', passed: false });
}

// Check package.json
console.log('\n📦 Validating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const hasSmitheryScript = packageJson.scripts && packageJson.scripts['build:smithery'];
  console.log(`   ${hasSmitheryScript ? '✅' : '❌'} build:smithery script`);
  checks.push({ name: 'build:smithery script', passed: hasSmitheryScript });
  
  const hasEthers = packageJson.dependencies && packageJson.dependencies['ethers'];
  console.log(`   ${hasEthers ? '✅' : '❌'} ethers.js dependency`);
  checks.push({ name: 'ethers.js dependency', passed: hasEthers });
  
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
  checks.push({ name: 'package.json readable', passed: false });
}

// Check build artifacts
console.log('\n🏗️  Validating build artifacts...');
try {
  const indexJs = fs.readFileSync('build/smithery-server.js', 'utf8');
  
  const hasERC20Tools = indexJs.includes('deploy_erc20_token') &&
                       indexJs.includes('get_token_info') &&
                       indexJs.includes('mint_tokens');
  
  console.log(`   ${hasERC20Tools ? '✅' : '❌'} ERC20 tools in build`);
  checks.push({ name: 'ERC20 tools in build', passed: hasERC20Tools });
  
  const hasExplorerLinks = indexJs.includes('getExplorerUrl') &&
                          indexJs.includes('Transaction Explorer:');
  
  console.log(`   ${hasExplorerLinks ? '✅' : '❌'} Explorer links in build`);
  checks.push({ name: 'Explorer links in build', passed: hasExplorerLinks });
  
} catch (error) {
  console.log(`   ❌ Error reading build/smithery-server.js: ${error.message}`);
  checks.push({ name: 'build/smithery-server.js readable', passed: false });
}

// Check ERC20 contracts
console.log('\n🪙  Validating ERC20 contracts...');
try {
  const contracts = JSON.parse(fs.readFileSync('build/erc20-contracts-rootstock.json', 'utf8'));
  
  const hasSimpleERC20 = contracts.simpleERC20 && contracts.simpleERC20.bytecode;
  console.log(`   ${hasSimpleERC20 ? '✅' : '❌'} SimpleERC20 contract`);
  checks.push({ name: 'SimpleERC20 contract', passed: hasSimpleERC20 });
  
  const hasMintableERC20 = contracts.mintableERC20 && contracts.mintableERC20.bytecode;
  console.log(`   ${hasMintableERC20 ? '✅' : '❌'} MintableERC20 contract`);
  checks.push({ name: 'MintableERC20 contract', passed: hasMintableERC20 });
  
} catch (error) {
  console.log(`   ❌ Error reading ERC20 contracts: ${error.message}`);
  checks.push({ name: 'ERC20 contracts readable', passed: false });
}

// Summary
console.log('\n📊 Validation Summary');
console.log('=' .repeat(50));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;

console.log(`✅ Passed: ${passed}/${total} checks`);

if (passed === total) {
  console.log('\n🎉 All checks passed! Ready for Smithery deployment.');
  console.log('\n🚀 To deploy:');
  console.log('   1. smithery login');
  console.log('   2. smithery deploy');
  console.log('\n🔗 Your ERC20 tools will be available at:');
  console.log('   - deploy_erc20_token');
  console.log('   - get_token_info');
  console.log('   - mint_tokens');
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above.');
  console.log('\nFailed checks:');
  checks.filter(c => !c.passed).forEach(c => {
    console.log(`   - ${c.name}`);
  });
  process.exit(1);
}

console.log('\n📚 Documentation:');
console.log('   - SMITHERY.md (deployment guide)');
console.log('   - README.md (general usage)');
console.log('   - smithery.yaml (tool definitions)');
