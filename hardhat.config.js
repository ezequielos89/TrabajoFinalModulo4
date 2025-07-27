require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  mocha: {
    timeout: 40000
  }
};