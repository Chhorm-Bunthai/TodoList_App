require("@nomicfoundation/hardhat-toolbox");
const { ethers } = require("hardhat");

async function main() {
  const TodoList = await ethers.getContractFactory("TodoList");
  const todoList = await TodoList.deploy();
  console.log(`TodoList deployed to: ${todoList.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
