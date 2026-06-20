# 武侠像素英雄 NFT · 零基础完整操作手册

> 适用人群：零编程基础、零区块链基础、只想把 NFT 发出去的普通人
> 预计耗时：约 30~60 分钟（含各平台注册、等待确认）
> 成本：测试网 ≈ 0 元，主网约 1~20 美元（视 Gas 价格而定）

---

## 第一部分 · 准备工作（约 15 分钟）

### 第 1 步：安装小狐狸钱包 MetaMask

MetaMask 是一个浏览器插件钱包，就像你在区块链世界的"支付宝"。

1. 打开 Chrome 或 Edge 浏览器（推荐 Chrome）
2. 访问 **https://metamask.io/**
3. 点击 "Download for Chrome" → "添加到 Chrome"
4. 安装完成后，浏览器右上角会出现小狐狸图标 🦊
5. 点击小狐狸 → "创建新钱包"
6. 设置一个安全密码（**务必记住，无法找回**）
7. **最关键一步**：它会给你 12 个英文单词，叫做"助记词"
   - 👉 **把这 12 个单词手抄在纸上，放在安全的地方**
   - ❌ **绝对不要截图、不要存手机、不要发邮件、不要告诉任何人**
   - ⚠️ 助记词 = 你的钱，丢了就找不回！
8. 下一步会让你按顺序确认这 12 个单词，确认后就创建成功了
9. 钱包默认在 Ethereum 主网，点击右上角"复制地址"按钮，把你的钱包地址复制下来（看起来像 `0x1234abcd...`）

> ✅ 现在你有了自己的区块链钱包地址，接下来就可以开始创建 NFT 了！

---

## 第二部分 · 选择方案（二选一）

### 方案 A：用 OpenSea 直接创建（最简单，**推荐新手**）

**优点**：完全图形界面，不用写代码，5 分钟就能上架
**缺点**：无法自定义白名单、预售等高级玩法

**操作步骤**：

1. 打开 **https://opensea.io/**
2. 右上角点击钱包图标 → 选择 MetaMask
3. MetaMask 会弹窗问你是否授权连接，点"下一步"→"连接"
4. 点击右上角头像 → "Create" → "Collection"
5. 填写合集信息：
   - **Name**：`武侠像素英雄` （或 WuXiaPixelHeroes）
   - **Description**：100 位独一无二的武侠像素小人
   - **Logo image**：上传一张代表性图片（可以用刚才预览图中 4 个中的任一个）
   - **Banner image**：首页展示横幅
   - **Category**：选择 Art 或 Collectibles
   - **Blockchain**：**Polygon**（推荐，Gas 费便宜）或 **Ethereum**
   - **Creator earnings**：5%（每次有人转手，你都能拿 5% 佣金）
6. 点击 "Create" 创建合集

**逐个 mint NFT（100 个，每次一个）：**

7. 在你的合集页面点 "Add Item" 或 "Create"
8. 上传一张像素小人图片（PNG / JPG / GIF）
9. 填写：
   - **Name**：武侠像素英雄 #1
   - **External link**：可以留空
   - **Description**：剑客，手持长剑，白衫披风，月下竹林
   - **Properties**（属性，点击 + 号添加）：
     - `角色` → `剑客`
     - `性别` → `男`
     - `武器` → `长剑`
     - `稀有度` → `传说`
   - **Levels** / **Stats**：留空
10. 点击 "Create" — 钱包会弹窗让你签名（**这个签名不花钱**）
11. 你的第 1 个 NFT 就诞生了！
12. 重复第 7~11 步，一共创建 100 个不同的 NFT（每一个上传不同的图片和属性）

**让用户可以购买：**

13. 进入某一个 NFT 详情页
14. 点击 "Sell"
15. 设置：
    - **Price**：0.01 ETH（或你想要的价格）
    - **Duration**：7 天（或自定义）
    - **Quantity**：1
16. 点击 "Complete listing"
17. MetaMask 会弹窗让你签名（可能需要支付一小笔 Gas，Polygon 上几乎免费）
18. 上架成功！用户现在可以购买了

> 💡 **提示**：如果想让某一批 NFT 统一开放给公众 mint（而非一个个上架），推荐使用下面的**方案 B**，部署自己的合约，再让 OpenSea 自动识别。

---

### 方案 B：部署自定义智能合约（功能更强，需一点技术能力）

**优点**：支持白名单预售、公售、限量 mint、团队储备、可暂停、延迟 Reveal 等高级玩法
**缺点**：需要命令行操作，约 30 分钟

下面是使用本项目代码 `WuXiaPixelHeroes` 合约的完整步骤。

---

## 第三部分 · 方案 B 详细步骤

### 第一步：安装 Node.js（电脑上的运行环境）

**Windows 用户**：
1. 访问 https://nodejs.org/
2. 下载 **LTS 版本**（左侧大按钮，如 20.x.x）
3. 双击安装，一路 Next 即可（默认勾上 "Add to PATH"）
4. 打开命令行（按 `Win+R` 输入 `cmd` 回车），输入 `node -v`，看到版本号就说明装好了

**Mac 用户**：
1. 访问 https://nodejs.org/ 下载 LTS
2. 或打开终端输入 `brew install node`（如果装了 Homebrew）

### 第二步：下载本项目代码

**方式 1：** 如果你有 Git
```bash
git clone <你的代码仓库地址>
cd nft-collection
```

**方式 2：** 直接把项目文件夹复制到电脑上即可（你现在打开的这个项目）

### 第三步：安装项目依赖

在项目根目录（`nft-collection` 文件夹内）打开命令行/终端，运行：

```bash
npm install
```

等它跑完（可能需要 2~5 分钟，会装好所有工具包）。

### 第四步：配置钱包和网络

1. 在 `nft-collection` 文件夹里创建一个新文件，名字叫 `.env`（注意前面有个点）
2. 把下面内容复制进去，然后改成你自己的信息：

```
PRIVATE_KEY=你的钱包私钥
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/你的API_KEY
AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/你的API_KEY
ETHERSCAN_API_KEY=你的EtherscanAPIKey
```

**怎么获取这些信息？**

**私钥 PRIVATE_KEY**（⚠️ 极其重要，不能泄露）：
- 打开 MetaMask → 账户详情 → 导出私钥 → 输入密码 → 复制
- 粘贴到 PRIVATE_KEY= 后面，不要加引号，不要有空格

**RPC URL（Alchemy 节点服务）**：
- 访问 https://alchemy.com → 用邮箱注册账号 → 创建新 App
- 网络选 "Polygon" 和 "Polygon Amoy"
- 进入 App 详情 → View Key → 复制 HTTPS 链接

**ETHERSCAN_API_KEY**（用于验证合约，可选）：
- 访问 https://etherscan.io/ 注册 → API Keys → 创建免费 Key

### 第五步：先在测试网测试（强烈建议！）

我们先在 Polygon Amoy 测试网练练手，完全不花真钱。

**在 MetaMask 添加 Amoy 测试网**：
1. 打开 MetaMask → 顶部"以太坊主网" → 添加网络 → 自定义网络
2. 填入：
   - 网络名称：Polygon Amoy
   - 新的 RPC URL：`https://rpc-amoy.polygon.technology`
   - 链 ID：`80002`
   - 货币符号：`POL`
   - 区块浏览器：`https://amoy.polygonscan.com`
3. 保存，切换到 Polygon Amoy 网络

**获取测试币**：
- 访问 https://faucet.polygon.technology/
- 选 Amoy → 粘贴你的钱包地址 → Submit
- 等几分钟，0.2 POL 测试币就到账了

**生成白名单 Merkle Root**（可选，如果你要预售功能）：
```bash
# 编辑 addresses.json，填入预售白名单地址
npx hardhat run scripts/generateMerkleRoot.ts
```

**编译 + 部署合约**：
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network amoy
```

看到类似下面的信息就是成功了：
```
✅  武侠像素英雄 NFT 合集已部署到: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    总量: 100 枚（10 枚团队储备）
```

**验证合约**（让别人可以在浏览器上看到源码）：
```bash
npx hardhat verify --network amoy <部署地址> "WuXiaPixelHeroes" "WXPH" "ipfs://你的基础URI/" "0x你的MerkleRoot"
```

### 第六步：通过区块浏览器操作合约（开启预售/公售）

1. 打开 https://amoy.polygonscan.com/ ，搜索你的合约地址
2. 点击 "Contract" → "Write Contract" → "Connect to Web3" → 用 MetaMask 连接
3. 操作：
   - **开启预售**：调用 `startPresale()`
   - **设置价格**：调用 `setPrices(0.01 ether, 0.02 ether)` 即 `setPrices("10000000000000000", "20000000000000000")`
   - **开启公售**：调用 `startPublicSale()`
   - **团队储备 mint**：调用 `reserveMint(你的地址, 10)`
   - **提款**：调用 `withdraw()` （合约里的钱全部转到你）
4. 用户端在同样的页面：调用 `publicMint(1)` 或 `presaleMint(1, merkleProof)` 即可 mint

### 第七步：在 OpenSea 展示

部署完成后：
1. 访问 `https://testnets.opensea.io/assets/amoy/<合约地址>/1`
2. OpenSea 会自动识别你的 ERC-721 合约
3. 你刚才 mint 出来的 NFT 会自动显示出来
4. 用户在 OpenSea 上就可以看到所有已 mint 的 NFT，也可以互相交易

---

## 第四部分 · 主网上线（真正发 NFT）

当你在测试网熟悉整个流程后，就可以在主网正式发行了：

1. **切换 MetaMask 到 Polygon 主网**（或 Ethereum 主网）
2. **买一点主网币**：用人民币买 MATIC（Polygon）或 ETH（Ethereum），转到你的钱包地址
   - 推荐从币安、欧易等交易所购买后提现到钱包
3. **修改部署脚本**中的 MERKLE_ROOT（如果需要白名单预售）
4. **部署合约到主网**：
   ```bash
   npx hardhat run scripts/deploy.ts --network polygon   # Polygon 主网
   # 或
   npx hardhat run scripts/deploy.ts --network ethereum  # ETH 主网
   ```
5. **开启预售/公售**：同测试网，通过 polygonscan.com/etherscan.io 的 Write Contract 页面操作
6. **在 OpenSea 展示**：访问 `https://opensea.io/assets/<链名>/<合约地址>/1`
7. **推广你的 NFT 合集**！

---

## 第五部分 · 创建 100 个独一无二的像素小人图像

方案有三：

### 方案一：手动画（最有灵魂，也最耗时）

使用免费像素画工具：
- **Aseprite**（专业像素画软件，推荐）
- **Piskel**（免费在线工具：https://www.piskelapp.com/）
- **Procreate + Pixel Art 插件**（iPad）
- 尺寸建议：**64×64 像素** 或 **128×128 像素**

### 方案二：AI 生成（最快）

用 AI 图像生成工具：
- Midjourney 输入：`pixel art wuxia swordsman, 16-bit style, chinese martial arts hero, white robe with sword, retro game aesthetic, --s 250 --style raw --v 6`
- DALL-E / SD / PixVerse 等都可以

关键词参考（替换[]里的内容）：
```
pixel art [角色], [性别], holding [武器], [服饰], chinese wuxia, 16-bit retro game, isolated on dark background, 64x64 pixel art
```

100 个角色可以按照不同组合生成：
- 角色：剑客、刀客、女侠、僧人、刺客、书生、道长、丐帮帮主、侠客、刀客...
- 武器：长剑、弯刀、长枪、折扇、飞镖、双节棍、禅杖、宝剑、银针、琵琶...
- 服饰：白衫、黑袍、粉裙、袈裟、道袍、夜行衣、布衣、青衫...
- 背景：月下竹林、樱花、古寺、雪山、客栈、江湖酒馆...

生成后统一导出为 PNG，按 `1.png` ~ `100.png` 命名。

### 方案三：把预览页的 SVG 导出为图片（刚才已经做好了）

我已经创建了 `nft-preview.html`，打开它就可以看到 4 个示例像素小人：
1. **#001 云游剑客**（传说级）— 白衫、长剑、月下竹林
2. **#002 胭脂女侠**（史诗级）— 粉裙、折扇、樱花飘零
3. **#003 孤影刀客**（稀有级）— 斗笠、弯刀、黄昏远山
4. **#004 禅心武僧**（精良级）— 黄袍、长棍、古寺禅光

**把它们导出成 PNG**：
- 在浏览器打开 `nft-preview.html`
- 对每个 SVG 右键 → "检查" → 找到 `<svg>` 标签 → 右键 Copy → 粘贴到文本编辑器 → 另存为 `.svg` 文件
- 或用浏览器插件、截图工具直接截图后裁剪

---

## 第六部分 · 元数据上传（让 NFT 真正"有内容"）

每个 NFT 需要一个 JSON 文件描述它（名字、描述、图片、属性）。示例：

```json
{
  "name": "武侠像素英雄 #1",
  "description": "一位独一无二的武侠像素小人，手持专属武器，行走于江湖",
  "image": "ipfs://QmXxxx...xxx/image1.png",
  "attributes": [
    { "trait_type": "角色", "value": "剑客" },
    { "trait_type": "性别", "value": "男" },
    { "trait_type": "武器", "value": "长剑" },
    { "trait_type": "服饰", "value": "白衫披风" },
    { "trait_type": "稀有度", "value": "传说" }
  ]
}
```

**批量上传到 IPFS**（免费去中心化存储）：
1. 访问 https://www.pinata.cloud/ 注册（免费额度足够用）
2. 先把 100 张图片打包文件夹上传 → 得到一个文件夹 CID
3. 为 1 到 100 号各写一个 `1.json` ~ `100.json`，里面填上面的 JSON 模板，image 路径指向 `ipfs://图片CID/1.png`
4. 把所有 JSON 文件再打包成文件夹上传 → 得到 JSON 文件夹 CID
5. 调用合约的 `reveal("ipfs://JSON文件夹CID/")` 把元数据公开

> 💡 **注意**：reveal 之前用户看到的是你部署时设置的 `unrevealedURI`（如一张占位图），reveal 之后才能看到真正的图像和属性。

---

## 第七部分 · 常见问题 FAQ

**Q: 部署合约需要花多少钱？**
A: 在 Polygon 上部署一个 ERC-721 合约 Gas 费大概 0.01~0.1 MATIC（约 0.01~0.1 美元）。在 Ethereum 主网 Gas 费波动较大，便宜时 1~5 美元，高峰时 20~100 美元。

**Q: 用户 mint 一个 NFT 要花多少钱？**
A: 你设置的 mint 价格 + 矿工费。比如你设置 0.01 ETH，用户就付 0.01 ETH 给合约，再加一点 Gas。

**Q: 我能随时改价格吗？**
A: 可以！调用合约的 `setPrices()` 函数即可。

**Q: 怎么提现收到的钱？**
A: 调用 `withdraw()` ，合约里的所有 ETH/MATIC 会自动转到你的钱包。

**Q: 100 个 NFT 都 mint 完以后怎么办？**
A: 合约自动进入 SoldOut 状态。用户可以在 OpenSea / Blur 等平台互相交易（二手市场），你设置的 creator fee 会持续到账。

**Q: 我不懂代码也能行吗？**
A: 可以！**方案 A**（OpenSea 直接创建）完全不需要写代码。如果用方案 B，跟着本文步骤复制粘贴就行，遇到问题复制错误信息到搜索引擎，基本都能找到答案。

**Q: 我没有自己的服务器可以部署合约吗？**
A: 完全不需要服务器！合约部署只需要你的电脑 + 钱包 + 一点 Gas。

---

## 第八部分 · 安全须知（重要！）

1. ✅ **永远不要把私钥告诉任何人**，包括客服、自称项目方、你的好朋友
2. ✅ **只在官方网站操作**，认准 opensea.io、etherscan.io、polygonscan.com
3. ✅ **不要乱点陌生链接、不要下载陌生文件**
4. ✅ **主网操作前先在测试网完整跑一遍流程**
5. ✅ **大额项目建议找专业的人做合约审计**
6. ❌ **不要把 .env 文件上传到 GitHub / 任何公开地方**
7. ❌ **不要在微信/邮件里发助记词**

---

## 路线图总结

```
[10分钟] 装 MetaMask → 备份助记词
[10分钟] 选方案：A（OpenSea 直接创建）或 B（自己部署合约）
[20分钟] 方案 A → OpenSea 创建合集 → 逐个上传 100 个 NFT → 设置价格上架
[30分钟] 方案 B → 装 Node.js → 配置 .env → 测试网部署 → 主网部署 → 开启预售
[∞ 分钟] 推广你的项目、运营社区、持续创作
```

祝你的武侠像素英雄大卖！⚔️
