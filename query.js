import ethers from "ethers";
import dotenv from "dotenv";
import * as readlineSync from "readline-sync";
dotenv.config();

/* COSTANTS */
const CONSTANTS = {
  FACTORY_ADDRESS: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", // PancakeSwap V2 factory address
  ROUTER_ADDRESS: "0x10ED43C718714eb63d5aA57B78B54704E256024E", //PancakeSwap V2 router
  BNB_ADDRESS: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // BNB CONTRACT ADDRESS
  BUSD_ADDRESS: "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD CONTRACT ADDRESS

  FACTORY_ABI: [
    "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  ],
  ROUTER_ABI: [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)",
    "function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  ],
  ERC20_ABI: [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  PROXY_ABI: [{"inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"admin_","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"admin_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"implementation_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}]
};

async function main() {
  const provider =
  process.env.RPC.indexOf("wss") >= 0
    ? new ethers.providers.WebSocketProvider(process.env.RPC)
    : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const factory = new ethers.Contract(
    CONSTANTS.FACTORY_ADDRESS,
    CONSTANTS.FACTORY_ABI,
    wallet
  );

  const proxy = new ethers.Contract(
    '0x9E63c9F73cf8700811DfE8331FcA4aFc5D4D7268',
    CONSTANTS.PROXY_ABI,
    account
  );


  const proxySS = await proxy.implementation_;
  console.log('proxxx', proxySS)
   
  // And query:
/*   provider.getLogs(filter).then((logs) => {
      console.log(logs);
  }); */


}


async function createFilter() {
  const filter = factory.filters.PairCreated(CONSTANTS.BNB_ADDRESS, '0x36953B5Ec00A13eDcEceB3aF258D034913D2A79D');
  filter.fromBlock = await provider.getBlockNumber() - 10000;
  filter.toBlock = "latest";
  console.log('asd', provider.getBlockNumber() - 10000)
  return filter;
}

main();
