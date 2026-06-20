import { ethers } from "hardhat";
import { MyNFTCollection } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // ============ CONFIG ============
  const NFT_NAME = "MyNFTCollection";
  const NFT_SYMBOL = "MNFT";
  const UNREVEALED_URI = "ipfs://QmUnrevealedPlaceholderURI/";
  const MERKLE_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";
  // ⬆️ Replace with your actual merkle root (run `npx ts-node scripts/generateMerkleRoot.ts` to generate)

  const MyNFTCollectionFactory = await ethers.getContractFactory("MyNFTCollection");
  const nft: MyNFTCollection = await MyNFTCollectionFactory.deploy(
    NFT_NAME,
    NFT_SYMBOL,
    UNREVEALED_URI,
    MERKLE_ROOT
  );

  await nft.waitForDeployment();
  const deployedAddress = await nft.getAddress();

  console.log("\n================================================");
  console.log(`✅  NFT Collection deployed to: ${deployedAddress}`);
  console.log(`    Network chainId: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`    Gas used: ~...`);
  console.log("================================================\n");

  console.log("💡 下一步操作建议:");
  console.log(`  1. 设置白名单 Merkle Root: call setMerkleRoot(bytes32)`);
  console.log(`  2. 开启预售: call startPresale()`);
  console.log(`  3. 开启公售: call startPublicSale()`);
  console.log(`  4. mint 完成后 Reveal: call reveal(baseURI)`);
  console.log(`  5. 提款: call withdraw()`);
  console.log("\n");
  console.log("📝 使用以下命令验证合约:");
  console.log(`    npx hardhat verify --network <network> ${deployedAddress} \\`);
  console.log(`      "${NFT_NAME}" "${NFT_SYMBOL}" "${UNREVEALED_URI}" "${MERKLE_ROOT}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
