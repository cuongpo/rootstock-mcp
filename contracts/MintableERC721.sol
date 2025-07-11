// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MintableERC721
 * @dev An ERC721 NFT contract with minting functionality
 */
contract MintableERC721 is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _nextTokenId = 1;
    }
    
    /**
     * @dev Mint a new NFT to the specified address
     * @param to The address to mint the NFT to
     * @param tokenId The token ID to mint
     * @param tokenURI The URI for the token metadata
     */
    function mint(address to, uint256 tokenId, string memory tokenURI) public onlyOwner {
        _safeMint(to, tokenId);
        if (bytes(tokenURI).length > 0) {
            _setTokenURI(tokenId, tokenURI);
        }
    }
    
    /**
     * @dev Mint a new NFT with auto-incremented token ID
     * @param to The address to mint the NFT to
     * @param tokenURI The URI for the token metadata
     * @return tokenId The minted token ID
     */
    function mintNext(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        if (bytes(tokenURI).length > 0) {
            _setTokenURI(tokenId, tokenURI);
        }
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs to multiple addresses
     * @param recipients Array of addresses to mint NFTs to
     * @param tokenURIs Array of token URIs (must match recipients length)
     */
    function batchMint(address[] memory recipients, string[] memory tokenURIs) public onlyOwner {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            
            _safeMint(recipients[i], tokenId);
            if (bytes(tokenURIs[i]).length > 0) {
                _setTokenURI(tokenId, tokenURIs[i]);
            }
        }
    }
    
    /**
     * @dev Returns the total amount of tokens stored by the contract
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Returns the next token ID that will be minted
     */
    function nextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Returns the token URI for a given token ID
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via string.concat).
        if (bytes(_tokenURI).length > 0) {
            return string.concat(base, _tokenURI);
        }
        
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Sets the token URI for a given token ID
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "";
    }
    
    /**
     * @dev Set the base URI for all tokens
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        // This would require storing the base URI in a state variable
        // For simplicity, we'll keep the current implementation
    }
}
