const fs = require('fs');
const path = require('path');

// Read the compiled contract artifacts
const simpleERC721Path = path.join(__dirname, '../artifacts/contracts/SimpleERC721.sol/SimpleERC721.json');
const mintableERC721Path = path.join(__dirname, '../artifacts/contracts/MintableERC721.sol/MintableERC721.json');

const simpleERC721 = JSON.parse(fs.readFileSync(simpleERC721Path, 'utf8'));
const mintableERC721 = JSON.parse(fs.readFileSync(mintableERC721Path, 'utf8'));

// Create the contracts object
const erc721Contracts = {
  simpleERC721: {
    abi: simpleERC721.abi,
    bytecode: simpleERC721.bytecode
  },
  mintableERC721: {
    abi: mintableERC721.abi,
    bytecode: mintableERC721.bytecode
  }
};

// Write to the source directory
const outputPath = path.join(__dirname, '../src/erc721-contracts-rootstock.json');
fs.writeFileSync(outputPath, JSON.stringify(erc721Contracts, null, 2));

console.log('ERC721 contracts extracted successfully to:', outputPath);
