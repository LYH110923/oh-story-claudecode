# NFT Collection - ERC-721 智能合约项目

一个完整的 ERC-721 NFT 发售项目,使用 Solidity 0.8.24 + Hardhat + OpenZeppelin。

## 功能特性

- ✅ **ERC-721 标准代币** (兼容所有 NFT 市场:OpenSea、Blur、LooksRare 等)
- ✅ **白名单预售** (Merkle Tree 实现,Gas 极低)
- ✅ **公开发售** (无门槛,支持每人限额)
- ✅ **团队储备额度** (100 个留作空投/Giveaway)
- ✅ **可暂停** (紧急情况下暂停 mint)
- ✅ **延迟 Reveal** (发售完成后再揭露元数据)
- ✅ **ETH 自动提款** (提现到 owner 地址)
- ✅ **两步所有权转让** (Ownable2Step,防止误操作)
- ✅ **完整测试** (约 20+ 测试用例覆盖所有核心路径)

## 合约参数(可修改)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `MAX_SUPPLY` | 10,000 | 总供应量 |
| `RESERVE_SUPPLY` | 100 | 团队储备量 |
| `PRESALE_MAX_PER_WALLET` | 3 | 白名单每人上限 |
| `PUBLICSALE_MAX_PER_WALLET` | 5 | 公售每人上限 |
| `presalePrice` | 0.01 ETH | 预售单价 |
| `publicPrice` | 0.02 ETH | 公售单价 |

## 目录结构

```
nft-collection/
├── contracts/
│   └── MyNFTCollection.sol     # 核心合约
├── test/
│   └── MyNFTCollection.ts      # 测试用例
├── scripts/
│   ├── deploy.ts               # 部署脚本
│   └── generateMerkleRoot.ts   # 生成白名单 Merkle Tree
├── addresses.json              # 白名单地址列表
├── hardhat.config.ts           # Hardhat 配置
├── package.json
└── tsconfig.json
```

---

## 快速开始

### 1. 安装依赖

```bash
cd nft-collection
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

然后编辑 `.env`,填入:
- `PRIVATE_KEY` - 你的钱包私钥(部署用,有钱付 Gas)
- `SEPOLIA_RPC_URL` / `POLYGON_RPC_URL` 等 - 对应链的 RPC 节点

> 💡 推荐使用 [Alchemy](https://www.alchemy.com/) 或 [Infura](https://infura.io/) 获取 RPC。

### 3. 本地测试(强烈建议先在本地跑通)

```bash
# 编译合约
npm run compile

# 跑测试
npm run test

# 启动本地节点(模拟真实环境)
npm run node
```

### 4. 准备白名单

编辑 `addresses.json`,填入白名单地址:

```json
[
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
  "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
]
```

然后生成 Merkle Root:

```bash
npx ts-node scripts/generateMerkleRoot.ts
```

将输出的 `merkle root` 填入 `scripts/deploy.ts` 中的 `MERKLE_ROOT` 变量。

### 5. 修改合约配置

编辑 `contracts/MyNFTCollection.sol`:
- 修改 `MAX_SUPPLY`、`RESERVE_SUPPLY` 等常量
- 修改 `presalePrice`、`publicPrice`

编辑 `scripts/deploy.ts`:
- `NFT_NAME` / `NFT_SYMBOL` - 项目名和代号
- `UNREVEALED_URI` - 未 reveal 时显示的图片 IPFS 地址
- `MERKLE_ROOT` - 上一步生成的 Merkle Root

---

## 部署

### 测试网 (Sepolia / Amoy)

```bash
# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy.ts --network sepolia

# 部署到 Polygon Amoy 测试网
npx hardhat run scripts/deploy.ts --network amoy
```

### 主网 (Ethereum / Polygon / Base / BSC)

```bash
# 部署到 Ethereum 主网
npx hardhat run scripts/deploy.ts --network ethereum

# 部署到 Polygon 主网
npx hardhat run scripts/deploy.ts --network polygon

# 部署到 Base 主网
npx hardhat run scripts/deploy.ts --network base
```

### 验证合约

```bash
npx hardhat verify --network ethereum \
  <部署地址> "MyNFTCollection" "MNFT" "ipfs://Qm..." "0x<merkleRoot>"
```

---

## 发售流程(操作顺序)

### 阶段一:部署后

部署完成后,合约处于 `NotStarted` 阶段,此时:
- 用户不能 mint
- 只有 owner 可以进行配置操作

### 阶段二:开启白名单预售

```bash
# 通过 etherscan/blockscout 的合约界面调用:
startPresale()

# 或通过 Hardhat console:
npx hardhat console --network ethereum
> const nft = await ethers.getContractAt("MyNFTCollection", "<合约地址>")
> await nft.startPresale()
```

白名单用户在前端调用:
```solidity
presaleMint(quantity, proof)  // 需要支付 presalePrice * quantity
```

其中 `proof` 从你生成的 `merkle-proofs.json` 中获取对应地址的证明数组。

### 阶段三:开启公开发售

```bash
startPublicSale()
```

任何用户调用:
```solidity
publicMint(quantity)  // 需要支付 publicPrice * quantity
```

### 阶段四:Reveal 元数据

所有 NFT mint 完成后,上传 metadata JSON 到 IPFS,调用:

```bash
reveal("ipfs://<metadata_CID>/")
```

Reveal 后 `tokenURI(1)` 将返回 `ipfs://<metadata_CID>/1.json`。

### 阶段五:提款

```bash
withdraw()
```

合约内的所有 ETH 将转到 owner 地址。

---

## 元数据格式 (OpenSea 兼容)

每个 token 的 JSON 文件结构(如 `1.json`):

```json
{
  "name": "MyNFT #1",
  "description": "这是一个示例 NFT 描述",
  "image": "ipfs://QmImageHash/image1.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ]
}
```

推荐使用 [Pinata](https://www.pinata.cloud/) 或 [NFT.Storage](https://nft.storage/) 上传到 IPFS。

---

## 前端集成示例 (ethers.js v6)

```javascript
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const nft = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  signer
);

// === 白名单 mint ===
const tx = await nft.presaleMint(2, proof, {
  value: ethers.parseEther("0.02"), // 0.01 * 2
});
await tx.wait();

// === 公售 mint ===
const tx2 = await nft.publicMint(3, {
  value: ethers.parseEther("0.06"), // 0.02 * 3
});
await tx2.wait();

// === 查询当前阶段 ===
const phase = await nft.currentPhase();
// 0 = NotStarted, 1 = Presale, 2 = PublicSale, 3 = SoldOut
```

---

## 在 OpenSea 上发售

部署完成后,OpenSea 会自动识别你的合约(因为是标准 ERC-721)。你只需要:

1. 在 OpenSea 搜索你的合约地址
2. 登录后点击"Edit Collection",填写项目信息
3. 用户 mint 后,NFT 会自动显示在 OpenSea 上

或者:
- 使用 OpenSea 的 [Seaport](https://github.com/ProjectOpenSea/seaport) 协议进行二次交易列表化
- 使用 OpenSea 的 Creator Fee(版税) - 在合约上调用 `setTokenRoyalty`(如果需要,可以添加到合约)

---

## 安全提示

1. **永远不要把 `.env` 提交到 Git** - 私钥泄露 = 资产丢失
2. **永远先在测试网部署测试**,确认一切正常后再部署主网
3. **建议对主网合约做安全审计** - 尤其是大额项目
4. **Owner 权限要保护好** - 可以考虑使用多签钱包(如 Gnosis Safe)
5. **Merkle Root 设置后不要随意更改** - 否则白名单会失效

---

## Gas 估算 (参考)

| 操作 | Estimated Gas |
|------|---------------|
| 部署合约 | ~4,500,000 |
| presaleMint(1) | ~80,000 |
| publicMint(1) | ~75,000 |
| reserveMint(1) | ~70,000 |
| withdraw | ~30,000 |

可通过 `REPORT_GAS=true npx hardhat test` 查看精确 Gas 报告。

---

## License

MIT
