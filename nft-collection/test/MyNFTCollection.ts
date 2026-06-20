import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { WuXiaPixelHeroes } from "../typechain-types";

const PRESALE_PRICE = ethers.parseEther("0.01");
const PUBLIC_PRICE = ethers.parseEther("0.02");

describe("WuXiaPixelHeroes", function () {
  async function deployFixture() {
    const [owner, user1, user2, user3, notWhitelistedUser] =
      await ethers.getSigners();

    // Build merkle tree from whitelist addresses
    const whitelistedAddresses = [user1, user2, user3].map(
      (u) => u.address
    );
    const tree = StandardMerkleTree.of(
      whitelistedAddresses.map((a) => [a]),
      ["address"]
    );
    const merkleRoot = tree.root;

    const WuXiaPixelHeroesFactory = await ethers.getContractFactory("WuXiaPixelHeroes");
    const nft: WuXiaPixelHeroes = await WuXiaPixelHeroesFactory.deploy(
      "WuXiaPixelHeroes",
      "WXPH",
      "ipfs://QmWuXiaPixelHeroesUnrevealed/",
      merkleRoot
    );

    // Get proofs for each user
    const getProof = (address: string) => {
      for (const [i, v] of tree.entries()) {
        if (v[0] === address) {
          return tree.getProof(i);
        }
      }
      return [];
    };

    return {
      nft,
      owner,
      user1,
      user2,
      user3,
      notWhitelistedUser,
      tree,
      getProof,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { nft, owner } = await loadFixture(deployFixture);
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set correct name and symbol", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.name()).to.equal("WuXiaPixelHeroes");
      expect(await nft.symbol()).to.equal("WXPH");
    });

    it("Should start with NotStarted phase", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.currentPhase()).to.equal(0); // Phase.NotStarted = 0
    });

    it("Should have correct initial supply", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.totalMinted()).to.equal(0);
      expect(await nft.MAX_SUPPLY()).to.equal(100);
    });
  });

  describe("Phase Control", function () {
    it("Should allow owner to change phase", async function () {
      const { nft } = await loadFixture(deployFixture);
      await nft.startPresale();
      expect(await nft.currentPhase()).to.equal(1); // Presale

      await nft.startPublicSale();
      expect(await nft.currentPhase()).to.equal(2); // PublicSale
    });

    it("Should revert when non-owner tries to change phase", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await expect(nft.connect(user1).startPresale()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to pause/unpause", async function () {
      const { nft } = await loadFixture(deployFixture);
      await nft.pauseMint();
      expect(await nft.paused()).to.equal(true);

      await nft.unpauseMint();
      expect(await nft.paused()).to.equal(false);
    });
  });

  describe("Presale (Whitelist)", function () {
    it("Should allow whitelisted user to mint", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();

      const proof = getProof(user1.address);
      const quantity = 2;
      const value = PRESALE_PRICE * BigInt(quantity);

      await expect(
        nft.connect(user1).presaleMint(quantity, proof, { value })
      )
        .to.emit(nft, "PresaleMint")
        .withArgs(user1.address, quantity);

      expect(await nft.balanceOf(user1.address)).to.equal(quantity);
      expect(await nft.totalMinted()).to.equal(quantity);
    });

    it("Should revert for non-whitelisted user", async function () {
      const { nft, notWhitelistedUser, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();

      const proof = getProof(notWhitelistedUser.address); // empty proof
      await expect(
        nft
          .connect(notWhitelistedUser)
          .presaleMint(1, proof, { value: PRESALE_PRICE })
      ).to.be.revertedWithCustomError(nft, "NotWhitelisted");
    });

    it("Should revert with wrong payment", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();

      const proof = getProof(user1.address);
      await expect(
        nft.connect(user1).presaleMint(1, proof, { value: PRESALE_PRICE / 2n })
      ).to.be.revertedWithCustomError(nft, "InsufficientPayment");
    });

    it("Should enforce per-wallet limit", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();

      const proof = getProof(user1.address);
      // Mint 2 (max)
      await nft.connect(user1).presaleMint(2, proof, {
        value: PRESALE_PRICE * 2n,
      });
      // 3rd should fail
      await expect(
        nft.connect(user1).presaleMint(1, proof, { value: PRESALE_PRICE })
      ).to.be.revertedWithCustomError(nft, "ExceedsPresaleLimit");
    });

    it("Should revert if not in presale phase", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      const proof = getProof(user1.address);

      await expect(
        nft.connect(user1).presaleMint(1, proof, { value: PRESALE_PRICE })
      ).to.be.revertedWithCustomError(nft, "InvalidPhase");
    });
  });

  describe("Public Sale", function () {
    it("Should allow public mint", async function () {
      const { nft, notWhitelistedUser } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      const quantity = 2;
      const value = PUBLIC_PRICE * BigInt(quantity);

      await expect(
        nft.connect(notWhitelistedUser).publicMint(quantity, { value })
      )
        .to.emit(nft, "PublicSaleMint")
        .withArgs(notWhitelistedUser.address, quantity);

      expect(await nft.balanceOf(notWhitelistedUser.address)).to.equal(quantity);
    });

    it("Should enforce per-wallet limit", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      // Mint 3 (max)
      await nft.connect(user1).publicMint(3, { value: PUBLIC_PRICE * 3n });
      // 4th should fail
      await expect(
        nft.connect(user1).publicMint(1, { value: PUBLIC_PRICE })
      ).to.be.revertedWithCustomError(nft, "ExceedsPublicLimit");
    });

    it("Should revert with wrong payment", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      await expect(
        nft.connect(user1).publicMint(1, { value: PUBLIC_PRICE / 2n })
      ).to.be.revertedWithCustomError(nft, "InsufficientPayment");
    });

    it("Should revert if not in public sale phase", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await expect(
        nft.connect(user1).publicMint(1, { value: PUBLIC_PRICE })
      ).to.be.revertedWithCustomError(nft, "InvalidPhase");
    });
  });

  describe("Reserve Mint (Owner Only)", function () {
    it("Should allow owner to mint reserve tokens", async function () {
      const { nft, owner, user2 } = await loadFixture(deployFixture);
      await nft.reserveMint(user2.address, 50);
      expect(await nft.balanceOf(user2.address)).to.equal(50);
      expect(await nft.reserveMinted()).to.equal(50);
    });

    it("Should enforce reserve supply limit", async function () {
      const { nft, owner, user2 } = await loadFixture(deployFixture);
      await nft.reserveMint(user2.address, 100);
      await expect(nft.reserveMint(user2.address, 1)).to.be.revertedWithCustomError(
        nft,
        "ExceedsReserveLimit"
      );
    });

    it("Should revert when non-owner tries reserve mint", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await expect(
        nft.connect(user1).reserveMint(user1.address, 1)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Metadata / Reveal", function () {
    it("Should return unrevealed URI before reveal", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();
      const proof = getProof(user1.address);
      await nft.connect(user1).presaleMint(1, proof, { value: PRESALE_PRICE });

      expect(await nft.tokenURI(1)).to.equal("ipfs://QmUnrevealed/");
    });

    it("Should return baseURI after reveal", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPresale();
      const proof = getProof(user1.address);
      await nft.connect(user1).presaleMint(1, proof, { value: PRESALE_PRICE });

      await nft.reveal("ipfs://QmRevealedBaseURI/");
      expect(await nft.tokenURI(1)).to.equal("ipfs://QmRevealedBaseURI/1.json");
    });

    it("Should revert if already revealed", async function () {
      const { nft } = await loadFixture(deployFixture);
      await nft.reveal("ipfs://QmRevealedBaseURI/");
      await expect(nft.reveal("ipfs://QmAnother/")).to.be.revertedWithCustomError(
        nft,
        "AlreadyRevealed"
      );
    });

    it("Should revert for non-existent token", async function () {
      const { nft } = await loadFixture(deployFixture);
      await expect(nft.tokenURI(1)).to.be.reverted;
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { nft, owner, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      const value = PUBLIC_PRICE * 3n;
      await nft.connect(user1).publicMint(3, { value });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await expect(nft.withdraw()).to.changeEtherBalance(
        nft,
        -value
      );
      // Note: owner balance change ≈ value (less gas)
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter > balanceBefore).to.equal(true);
    });

    it("Should revert when non-owner tries to withdraw", async function () {
      const { nft, user1 } = await loadFixture(deployFixture);
      await expect(nft.connect(user1).withdraw()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Total Supply / SoldOut", function () {
    it("Should track totalSupply correctly", async function () {
      const { nft, user1, user2, getProof } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      await nft.connect(user1).publicMint(3, { value: PUBLIC_PRICE * 3n });
      await nft.connect(user2).publicMint(2, { value: PUBLIC_PRICE * 2n });

      expect(await nft.totalMinted()).to.equal(5);
      expect(await nft.totalSupply()).to.equal(5);
    });

    it("Should respect MAX_SUPPLY", async function () {
      const { nft, owner } = await loadFixture(deployFixture);
      await nft.startPublicSale();

      const signers = await ethers.getSigners();
      const users = signers.slice(1, 31); // 30 users

      // 30 users * 3 each = 90 public mints
      for (const user of users) {
        await nft.connect(user).publicMint(3, {
          value: PUBLIC_PRICE * 3n,
        });
      }

      // + 10 reserve = 100 total
      await nft.reserveMint(owner.address, 10);

      const total = await nft.totalMinted();
      expect(total).to.equal(90 + 10);
      expect(total).to.be.lessThanOrEqual(await nft.MAX_SUPPLY());
    });
  });

  describe("Burn", function () {
    it("Should allow token owner to burn", async function () {
      const { nft, user1, getProof } = await loadFixture(deployFixture);
      await nft.startPublicSale();
      await nft.connect(user1).publicMint(1, { value: PUBLIC_PRICE });

      expect(await nft.balanceOf(user1.address)).to.equal(1);
      await nft.connect(user1).burn(1);
      expect(await nft.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Price Configuration", function () {
    it("Should allow owner to update prices", async function () {
      const { nft } = await loadFixture(deployFixture);
      const newPresale = ethers.parseEther("0.05");
      const newPublic = ethers.parseEther("0.10");
      await nft.setPrices(newPresale, newPublic);

      expect(await nft.presalePrice()).to.equal(newPresale);
      expect(await nft.publicPrice()).to.equal(newPublic);
    });
  });
});
