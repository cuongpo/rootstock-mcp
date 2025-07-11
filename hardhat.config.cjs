require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    rootstock: {
      url: "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: process.env.ROOTSTOCK_PRIVATE_KEYS ? [process.env.ROOTSTOCK_PRIVATE_KEYS] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
