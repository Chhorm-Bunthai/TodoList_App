require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
    ],
  },
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: process.env.APP_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API_KEY,
  },
};
