/**
 * Generate a Merkle Root + proof for a list of whitelisted addresses.
 * 
 * Usage:
 *   npx ts-node scripts/generateMerkleRoot.ts
 * 
 * Input: addresses.json - an array of addresses
 *   [
 *     "0x1234...",
 *     "0x5678...",
 *     ...
 *   ]
 * 
 * Output:
 *   - Prints merkle root
 *   - Writes proofs to merkle-proofs.json
 *   - Writes root to merkle-root.txt
 */

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import * as fs from "fs";
import * as path from "path";

function main() {
  // Try to read addresses.json. If not found, use demo addresses.
  const addressesPath = path.join(__dirname, "../addresses.json");
  let addresses: string[];

  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));
    console.log(`✅  从 addresses.json 读取了 ${addresses.length} 个地址\n`);
  } else {
    // Demo addresses (replace with your own!)
    addresses = [
      "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
      "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
      "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
      "0x617F2E2fD72FD9D5503197092aCacc4F7a26F7c2",
    ];
    console.log(`⚠️  未找到 addresses.json, 使用示例地址 (${addresses.length} 个)\n`);
  }

  // Build tree — each leaf is keccak256(abi.encodePacked(address))
  // which matches what the contract does in _isWhitelisted
  const values = addresses.map((addr) => [addr]);
  const tree = StandardMerkleTree.of(values, ["address"]);

  const root = tree.root;
  console.log("================================================");
  console.log("🌳  Merkle Root:");
  console.log(`    ${root}`);
  console.log("================================================\n");

  // Generate proofs for each address
  const proofs: Record<string, { proof: string[]; leaf: string }> = {};
  for (const [i, v] of tree.entries()) {
    const proof = tree.getProof(i);
    proofs[v[0]] = {
      proof,
      leaf: tree.leafHash(v),
    };
  }

  // Save to file
  const proofsPath = path.join(__dirname, "../merkle-proofs.json");
  fs.writeFileSync(
    proofsPath,
    JSON.stringify(
      {
        merkleRoot: root,
        totalAddresses: addresses.length,
        proofs,
      },
      null,
      2
    )
  );
  console.log(`📝 Proofs 已保存到: ${proofsPath}`);

  const rootPath = path.join(__dirname, "../merkle-root.txt");
  fs.writeFileSync(rootPath, root);
  console.log(`📝 Root 已保存到: ${rootPath}\n`);

  // Verification test
  console.log("🔍  校验示例 (第一个地址):");
  const firstAddr = addresses[0];
  const firstProof = proofs[firstAddr].proof;
  console.log(`   地址: ${firstAddr}`);
  console.log(`   Proof: ${JSON.stringify(firstProof)}`);
  console.log(`   验证结果: ${tree.verify([firstAddr], firstProof) ? "✅ 通过" : "❌ 失败"}\n`);

  console.log("================================================");
  console.log("✅  完成! 将 merkle-root.txt 中的值填入 deploy.ts");
  console.log("================================================");
}

main();
