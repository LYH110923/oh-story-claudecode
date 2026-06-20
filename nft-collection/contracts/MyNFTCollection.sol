// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WuXiaPixelHeroes
 * @dev ERC-721 NFT Collection with:
 *      - Merkle-tree whitelist presale
 *      - Public sale with per-wallet limit
 *      - Owner reserve mint
 *      - Pausable (emergency stop)
 *      - Revealable metadata (base URI + unrevealed URI)
 *      - ETH withdrawal
 */
contract WuXiaPixelHeroes is ERC721, ERC721Enumerable, ERC721Burnable, Ownable2Step, Pausable {
    using Strings for uint256;

    // ============ SUPPLY CONFIG ============
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant RESERVE_SUPPLY = 10; // team/giveaway mint

    // ============ MINT LIMITS ============
    uint256 public constant PRESALE_MAX_PER_WALLET = 2;
    uint256 public constant PUBLICSALE_MAX_PER_WALLET = 3;

    // ============ PRICE (in wei) ============
    uint256 public presalePrice = 0.01 ether;
    uint256 public publicPrice = 0.02 ether;

    // ============ SALE PHASE ============
    enum Phase {
        NotStarted,
        Presale,
        PublicSale,
        SoldOut
    }

    Phase public currentPhase = Phase.NotStarted;

    // ============ WHITELIST (MERKLE TREE) ============
    bytes32 public merkleRoot;

    // ============ MINT TRACKING ============
    uint256 public totalMinted;
    uint256 public reserveMinted;
    mapping(address => uint256) public presaleMintedByAddress;
    mapping(address => uint256) public publicsaleMintedByAddress;

    // ============ METADATA ============
    string public baseURI;
    string public unrevealedURI;
    bool public revealed;

    // ============ EVENTS ============
    event PresaleMint(address indexed to, uint256 indexed quantity);
    event PublicSaleMint(address indexed to, uint256 indexed quantity);
    event ReserveMint(address indexed to, uint256 indexed quantity);
    event PhaseChanged(Phase newPhase);
    event PriceChanged(uint256 presalePrice, uint256 publicPrice);
    event MerkleRootSet(bytes32 merkleRoot);
    event Revealed(string baseURI);

    // ============ ERRORS ============
    error InvalidPhase();
    error NotWhitelisted();
    error InsufficientPayment();
    error ExceedsMaxSupply();
    error ExceedsPresaleLimit();
    error ExceedsPublicLimit();
    error ExceedsReserveLimit();
    error InvalidQuantity();
    error InvalidProof();
    error TransferFailed();
    error AlreadyRevealed();

    // ============ CONSTRUCTOR ============
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _unrevealedURI,
        bytes32 _merkleRoot
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        unrevealedURI = _unrevealedURI;
        merkleRoot = _merkleRoot;
    }

    // ============ MODIFIERS ============
    modifier onlyDuringPresale() {
        if (currentPhase != Phase.Presale) revert InvalidPhase();
        _;
    }

    modifier onlyDuringPublicSale() {
        if (currentPhase != Phase.PublicSale) revert InvalidPhase();
        _;
    }

    // ============ PHASE CONTROL (OWNER ONLY) ============

    function setPhase(Phase _phase) external onlyOwner {
        currentPhase = _phase;
        emit PhaseChanged(_phase);
    }

    function startPresale() external onlyOwner {
        currentPhase = Phase.Presale;
        emit PhaseChanged(Phase.Presale);
    }

    function startPublicSale() external onlyOwner {
        currentPhase = Phase.PublicSale;
        emit PhaseChanged(Phase.PublicSale);
    }

    function pauseMint() external onlyOwner {
        _pause();
    }

    function unpauseMint() external onlyOwner {
        _unpause();
    }

    // ============ PRICE CONFIG (OWNER ONLY) ============

    function setPrices(uint256 _presalePrice, uint256 _publicPrice) external onlyOwner {
        presalePrice = _presalePrice;
        publicPrice = _publicPrice;
        emit PriceChanged(_presalePrice, _publicPrice);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootSet(_merkleRoot);
    }

    // ============ METADATA (OWNER ONLY) ============

    function reveal(string memory _baseURI) external onlyOwner {
        if (revealed) revert AlreadyRevealed();
        baseURI = _baseURI;
        revealed = true;
        emit Revealed(_baseURI);
    }

    function setUnrevealedURI(string memory _unrevealedURI) external onlyOwner {
        unrevealedURI = _unrevealedURI;
    }

    // ============ MINT FUNCTIONS ============

    /**
     * @dev Whitelist presale mint. Caller must be in the merkle tree.
     */
    function presaleMint(uint256 _quantity, bytes32[] calldata _proof)
        external
        payable
        onlyDuringPresale
        whenNotPaused
    {
        if (_quantity == 0) revert InvalidQuantity();
        if (!_isWhitelisted(msg.sender, _proof)) revert NotWhitelisted();

        uint256 newPresaleMinted = presaleMintedByAddress[msg.sender] + _quantity;
        if (newPresaleMinted > PRESALE_MAX_PER_WALLET) revert ExceedsPresaleLimit();

        uint256 newTotal = totalMinted + _quantity;
        if (newTotal > MAX_SUPPLY) revert ExceedsMaxSupply();

        if (msg.value != presalePrice * _quantity) revert InsufficientPayment();

        presaleMintedByAddress[msg.sender] = newPresaleMinted;
        totalMinted = newTotal;

        for (uint256 i = 0; i < _quantity; i++) {
            _safeMint(msg.sender, totalMinted - _quantity + i + 1);
        }

        if (totalMinted == MAX_SUPPLY) {
            currentPhase = Phase.SoldOut;
            emit PhaseChanged(Phase.SoldOut);
        }

        emit PresaleMint(msg.sender, _quantity);
    }

    /**
     * @dev Public sale mint.
     */
    function publicMint(uint256 _quantity)
        external
        payable
        onlyDuringPublicSale
        whenNotPaused
    {
        if (_quantity == 0) revert InvalidQuantity();

        uint256 newPublicMinted = publicsaleMintedByAddress[msg.sender] + _quantity;
        if (newPublicMinted > PUBLICSALE_MAX_PER_WALLET) revert ExceedsPublicLimit();

        uint256 newTotal = totalMinted + _quantity;
        if (newTotal > MAX_SUPPLY) revert ExceedsMaxSupply();

        if (msg.value != publicPrice * _quantity) revert InsufficientPayment();

        publicsaleMintedByAddress[msg.sender] = newPublicMinted;
        totalMinted = newTotal;

        for (uint256 i = 0; i < _quantity; i++) {
            _safeMint(msg.sender, totalMinted - _quantity + i + 1);
        }

        if (totalMinted == MAX_SUPPLY) {
            currentPhase = Phase.SoldOut;
            emit PhaseChanged(Phase.SoldOut);
        }

        emit PublicSaleMint(msg.sender, _quantity);
    }

    /**
     * @dev Owner reserve mint for team / giveaways.
     */
    function reserveMint(address _to, uint256 _quantity) external onlyOwner {
        if (_quantity == 0) revert InvalidQuantity();

        uint256 newReserve = reserveMinted + _quantity;
        if (newReserve > RESERVE_SUPPLY) revert ExceedsReserveLimit();

        uint256 newTotal = totalMinted + _quantity;
        if (newTotal > MAX_SUPPLY) revert ExceedsMaxSupply();

        reserveMinted = newReserve;
        totalMinted = newTotal;

        for (uint256 i = 0; i < _quantity; i++) {
            _safeMint(_to, totalMinted - _quantity + i + 1);
        }

        if (totalMinted == MAX_SUPPLY) {
            currentPhase = Phase.SoldOut;
            emit PhaseChanged(Phase.SoldOut);
        }

        emit ReserveMint(_to, _quantity);
    }

    // ============ WITHDRAW ============

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert TransferFailed();

        (bool success,) = payable(owner()).call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ INTERNAL HELPERS ============

    function _isWhitelisted(address _user, bytes32[] calldata _proof)
        internal
        view
        returns (bool)
    {
        bytes32 leafHash = keccak256(abi.encode(_user));
        bytes32 leaf = keccak256(bytes.concat(leafHash));
        return MerkleProof.verifyCalldata(_proof, merkleRoot, leaf);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        _requireOwned(tokenId);

        if (!revealed) {
            return unrevealedURI;
        }

        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    // ============ IERC165 / IERC721 ENUMERABLE OVERRIDES ============

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }
}
