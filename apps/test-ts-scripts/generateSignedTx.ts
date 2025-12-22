import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const testWallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

async function main() {
  const savedProperties = console.log;
  console.log = ()=>{};
  const inputs = process.argv.slice(2);

  const domain = {
    name: "Web3HackersDAO",
    version: "1",
    chainId: 11155111,
    verifyingContract: inputs[0]
  };
  const types = {
    Voucher: [
      { name: "receiver", type: "address" },
      { name: "expiryBlock", type: "uint256" },
      { name: "isAdmin", type: "bool" },
      { name: "psrLevel", type: "uint8" },
      { name: "jexsLevel", type: "uint8" },
      { name: "tklLevel", type: "uint8" },
      { name: "web3Level", type: "uint8" },
      { name: "kvtrLevel", type: "uint8" }
    ]
  };

  const voucher = {
    receiver: inputs[1],
    expiryBlock: Number(inputs[8]),   // match types name
    isAdmin: inputs[2] === "true" ? true : false,
    psrLevel: Number(inputs[3]),
    jexsLevel: Number(inputs[4]),
    tklLevel: Number(inputs[5]),
    web3Level: Number(inputs[6]),
    kvtrLevel: Number(inputs[7])
  };

  // ethers v6: signTypedData
  const signature = await testWallet.signTypedData(domain, types, voucher);

  const encodedSignature = ethers.AbiCoder.defaultAbiCoder().encode(["bytes"], [signature]);

  console.log = savedProperties;

return encodedSignature;
}

(
  async ()=>
    main().then((value)=>{
      process.stdout.write(value);
      process.exit(0);
    }).catch((reason)=>{
  process.stderr.write(reason);
  console.error(reason);
  process.exit(1);
    })
)();