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
};

async function main() {
  let choice;
  do {
    choice = await readlineSync.question(`
    :::::::::::::::::::::::::::::::::::::::
    What do you want to do?
    :::::::::::::::::::::::::::::::::::::::
    [1] APPROVE
    [2] BUY
    [3] SELL
    [4] SNIPER
    [5] SNIPER V2
    `);
  } while (choice < 1 && choice > 4);

  switch (choice) {
    case "1":
      await tokenApprove();
      break;
    case "2":
      await fastBuy();
      break;
    case "3":
      await fastSell();
      break;
    case "4":
      await pairCreatedListner();
      break;
    case "5":
      await pairPolling();
      break;
    default:
      console.log("No Choice");
      break;
  }
}

async function pairCreatedListner() {
  console.log("Sniper Started");

  const provider =
    process.env.RPC.indexOf("wss") >= 0
      ? new ethers.providers.WebSocketProvider(process.env.RPC)
      : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const factory = new ethers.Contract(
    CONSTANTS.FACTORY_ADDRESS,
    CONSTANTS.FACTORY_ABI,
    account
  );

  const router = new ethers.Contract(
    CONSTANTS.ROUTER_ADDRESS,
    CONSTANTS.ROUTER_ABI,
    account
  );

  const amountToBuy = await readlineSync.question("Amount to buy (BnB): ");
  const amountOutMin = await readlineSync.question("Amount Out Min (Tokens): ");
  const token = await readlineSync.question("Token to Snipe ( Address ): ");

  factory.on("PairCreated", async (token0, token1, pairAddress) => {
    let tok0, tok1, pairAdd, tok;
    [tok0, tok1, pairAdd, tok] = [
      token0.toUpperCase(),
      token1.toUpperCase(),
      pairAddress.toUpperCase(),
      token.toUpperCase(),
    ];

    console.log(`
~~~~~~~~~~~~~~~~~~
New pair detected
~~~~~~~~~~~~~~~~~~
token0: ${tok0}
token1:  ${tok1}
addressPair:  ${pairAdd}
Date:  ${new Date()}

    `);

    if (tok0 === token || tok1 === token) {
      console.log(`
      ::::::::::::::::::::::::::::::::::::::::::::::::
      PAIR FOUND!
      ::::::::::::::::::::::::::::::::::::::::::::::::
      `);

      if (tok0 === CONSTANTS.BNB_ADDRESS) {
        swapExactETHForTokens(
          factory,
          router,
          amountToBuy,
          amountOutMin,
          tok0,
          tok1,
          wallet.address,
          process.env.GAS_LIMIT,
          process.env.GAS_PRICE,
          process.env.DECIMALS
        );
      } else if (tok1 === CONSTANTS.BNB_ADDRESS) {
        swapExactETHForTokens(
          factory,
          router,
          amountToBuy,
          amountOutMin,
          tok1,
          tok0,
          wallet.address,
          process.env.GAS_LIMIT,
          process.env.GAS_PRICE,
          process.env.DECIMALS
        );
      } else if (tok0 === CONSTANTS.BUSD_ADDRESS) {
        swapExactTokensForTokens(
          factory,
          router,
          amountToBuy,
          amountOutMin,
          tok0,
          tok1,
          wallet.address,
          process.env.GAS_LIMIT,
          process.env.GAS_PRICE,
          process.env.DECIMALS
        );
      } else if (tok1 === CONSTANTS.BUSD_ADDRESS) {
        swapExactTokensForTokens(
          factory,
          router,
          amountToBuy,
          amountOutMin,
          tok1,
          tok0,
          wallet.address,
          process.env.GAS_LIMIT,
          process.env.GAS_PRICE,
          process.env.DECIMALS
        );
      }
    } else {
      console.log("Pair don't match!");
    }
  });
}
async function fastBuy() {
  console.log("FAST BUY STARTED");

  const provider =
    process.env.RPC.indexOf("wss") >= 0
      ? new ethers.providers.WebSocketProvider(process.env.RPC)
      : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const factory = new ethers.Contract(
    CONSTANTS.FACTORY_ADDRESS,
    CONSTANTS.FACTORY_ABI,
    account
  );

  const router = new ethers.Contract(
    CONSTANTS.ROUTER_ADDRESS,
    CONSTANTS.ROUTER_ABI,
    account
  );

  const amountToBuy = await readlineSync.question("Amount to buy (BnB): ");
  const amountOutMin = await readlineSync.question("Amount Out Min (Tokens): ");
  const token = await readlineSync.question("Token to buy ( Address ): ");

  swapExactETHForTokens(
    factory,
    router,
    amountToBuy,
    amountOutMin,
    CONSTANTS.BNB_ADDRESS,
    token,
    wallet.address,
    process.env.GAS_LIMIT,
    process.env.GAS_PRICE,
    process.env.DECIMALS
  );
}
async function fastSell() {
  console.log("FAST SELL STARTED");

  const provider =
    process.env.RPC.indexOf("wss") >= 0
      ? new ethers.providers.WebSocketProvider(process.env.RPC)
      : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const factory = new ethers.Contract(
    CONSTANTS.FACTORY_ADDRESS,
    CONSTANTS.FACTORY_ABI,
    account
  );

  const router = new ethers.Contract(
    CONSTANTS.ROUTER_ADDRESS,
    CONSTANTS.ROUTER_ABI,
    account
  );

  const amountToBuy = await readlineSync.question("Amount to sell (Tokens): ");
  const amountOutMin = await readlineSync.question("Amount Out Min (BnB): ");
  const token = await readlineSync.question("Token to sell (Address): ");

  swapExactTokensForETH(
    factory,
    router,
    amountToBuy,
    amountOutMin,
    token,
    CONSTANTS.BNB_ADDRESS,
    wallet.address,
    process.env.GAS_LIMIT,
    process.env.GAS_PRICE,
    process.env.DECIMALS
  );
}
async function tokenApprove() {
  console.log("APPROVE STARTED");

  const provider =
    process.env.RPC.indexOf("wss") >= 0
      ? new ethers.providers.WebSocketProvider(process.env.RPC)
      : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const token = await readlineSync.question("Token to approve ( Address ): ");
  const amountToBuy = await readlineSync.question("Amount to spend: ");

  const tokenContract = new ethers.Contract(
    token,
    CONSTANTS.ERC20_ABI,
    account
  );

  approve(
    tokenContract,
    parseFloat(amountToBuy),
    process.env.GAS_LIMIT,
    process.env.GAS_PRICE,
    process.env.DECIMALS
  );
}
async function pairPolling() {
  console.log("Sniper V2 Started");

  const provider =
    process.env.RPC.indexOf("wss") >= 0
      ? new ethers.providers.WebSocketProvider(process.env.RPC)
      : new ethers.providers.JsonRpcProvider(process.env.RPC);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = wallet.connect(provider);

  const factory = new ethers.Contract(
    CONSTANTS.FACTORY_ADDRESS,
    CONSTANTS.FACTORY_ABI,
    account
  );

  const router = new ethers.Contract(
    CONSTANTS.ROUTER_ADDRESS,
    CONSTANTS.ROUTER_ABI,
    account
  );

  const ERC = new ethers.Contract(
    CONSTANTS.BNB_ADDRESS,
    CONSTANTS.ERC20_ABI,
    account
  );

  const amountToBuy = await readlineSync.question("Amount to buy (BnB): ");
  const amountOutMin = await readlineSync.question("Amount Out Min (Tokens): ");
  const token = await readlineSync.question("Token to Snipe ( Address ): ");

  if (await checkLiquidity(factory, ERC, CONSTANTS.BNB_ADDRESS, token)) {
    console.log("START TRY TO BUY");
    swapExactETHForTokens(
      factory,
      router,
      amountToBuy,
      amountOutMin,
      CONSTANTS.BNB_ADDRESS,
      token,
      wallet.address, 
      process.env.GAS_LIMIT,
      process.env.GAS_PRICE,
      process.env.DECIMALS
    ); 
  } 
}

async function checkLiquidity(factory, ERC, tokenToSpend, tokenToBuy) {
  const pairAddress = await factory.getPair(tokenToSpend, tokenToBuy);
  if (pairAddress != null) {
    if (pairAddress.toString().indexOf("0x0000000000000") > -1) {
      console.log("PAIR NOT DETECTED");
      return await checkLiquidity(factory, ERC, tokenToSpend, tokenToBuy);
    } 
  } 
  const pairBNBvalue = await ERC.balanceOf(pairAddress);
  const pairBNBvalueFormatted = await ethers.utils.formatEther(pairBNBvalue);
  console.log(`BnB Balance : ${pairBNBvalueFormatted}`);

  if (parseFloat(pairBNBvalueFormatted) > parseFloat(1)) { 
    return true;
  } else {
    console.log("Retry ...");
    return await checkLiquidity(factory, ERC, tokenToSpend, tokenToBuy);
  }
}
async function swapExactETHForTokens(
  factory,
  router,
  amountToBuy,
  amountOutMin,
  tokenIn,
  tokenOut,
  recipient,
  gasLimit,
  gasPrice,
  decimals
) {
  const amountIn = ethers.utils.parseUnits(amountToBuy, "ether");
  console.log("SwapExactETHForTokens start ... ");

  const tx = await router.swapExactETHForTokens(
    `${amountOutMin * 10 ** decimals}`,
    [tokenIn, tokenOut],
    recipient,
    Date.now() + 1000 * 60 * 5, //5 minutes
    {
      gasLimit: gasLimit,
      gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
      nonce: null,
      value: amountIn,
    }
  );
  tx.wait()
    .then((resp) => {
      console.log(`Token purchased successfully! ;)
tx: ${resp.transactionHash}
#############################################`);
    })
    .catch((err) => {
      console.log(`ERROR! Token purchase unsuccessful :(
tx: ${err.transactionHash}
#############################################`);
    });
}
async function swapExactTokensForTokens(
  factory,
  router,
  amountToBuy,
  amountOutMin,
  tokenIn,
  tokenOut,
  recipient,
  gasLimit,
  gasPrice,
  decimals
) {
  console.log("swapExactTokensForTokens start ... ");
  const amountIn = amountToBuy * 600 * 10 ** 18;
  const tx = await router.swapExactTokensForTokens(
    `${amountIn}`,
    `${amountOutMin * 10 ** decimals}`,
    [tokenIn, tokenOut],
    recipient,
    Date.now() + 1000 * 60 * 5,
    {
      gasLimit: gasLimit,
      gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
      nonce: null,
    }
  );
  tx.wait()
    .then((resp) => {
      console.log(`Token purchased successfully! ;)
tx: ${resp.transactionHash}
#############################################`);
    })
    .catch((err) => {
      console.log(`ERROR! Token purchase unsuccessful :(
tx: ${err.transactionHash}
#############################################`);
    });
}
async function swapExactTokensForETH(
  factory,
  router,
  amountToBuy,
  amountOutMin,
  tokenIn,
  tokenOut,
  recipient,
  gasLimit,
  gasPrice,
  decimals
) {
  console.log("swapExactTokensForETH start ... ");
  const amountIn = amountToBuy * 10 ** decimals;
  const tx = await router.swapExactTokensForETH(
    `${amountIn}`,
    `${ethers.utils.parseUnits(`${amountOutMin}`, "ether")}`,
    [tokenIn, tokenOut],
    recipient,
    Date.now() + 1000 * 60 * 5,
    {
      gasLimit: gasLimit,
      gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
      nonce: null,
    }
  );
  tx.wait()
    .then((resp) => {
      console.log(`Token sold successfully! ;)
tx: ${resp.transactionHash}
#############################################`);
    })
    .catch((err) => {
      console.log(`ERROR! Token sold unsuccessful :(
tx: ${err.transactionHash}
#############################################`);
    });
}
async function approve(
  tokenContract,
  amountToBuy,
  gasLimit,
  gasPrice,
  decimals
) {
  const tx = await tokenContract.approve(
    CONSTANTS.ROUTER_ADDRESS,
    `${amountToBuy * 10 ** decimals}`,
    {
      gasLimit: `${gasLimit}`,
      gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
      nonce: null,
    }
  );

  tx.wait()
    .then((resp) => {
      console.log(`TOKEN APPROVED WITH SUCCESS! ;)
tx: ${resp.transactionHash}
#############################################`);
    })
    .catch((resp) => {
      console.log(`APPROVE ERROR!
tx: ${resp.transactionHash}
#############################################`);
    });
}

main();
