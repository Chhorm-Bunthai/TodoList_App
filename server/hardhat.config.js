require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
// require("@nomiclabs/hardhat-waffle");

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
};
