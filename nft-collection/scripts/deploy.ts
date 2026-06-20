import { ethers } from "hardhat";
import { WuXiaPixelHeroes } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // ============ CONFIG ============
  const NFT_NAME = "WuXiaPixelHeroes";
  const NFT_SYMBOL = "WXPH";
  const UNREVEALED_URI = "ipfs://QmWuXiaPixelHeroesUnrevealedPlaceholder/";
  const MERKLE_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";
  // ⬆️ Replace with your actual merkle root (run `npx ts-node scripts/generateMerkleRoot.ts` to generate)

  const WuXiaPixelHeroesFactory = await ethers.getContractFactory("WuXiaPixelHeroes");
  const nft: WuXiaPixelHeroes = await WuXiaPixelHeroesFactory.deploy(
    NFT_NAME,
    NFT_SYMBOL,
    UNREVEALED_URI,
    MERKLE_ROOT
  );

  await nft.waitForDeployment();
  const deployedAddress = await nft.getAddress();

  console.log("\n================================================");
  console.log(`✅  武侠像素英雄 NFT 合集已部署到: ${deployedAddress}`);
  console.log(`    网络链 ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`    总量: 100 枚（10 枚团队储备）`);
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
