// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC404.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

// MyERC404 contract inherits ERC404 abstract contract
contract MyERC404 is ERC404 {

    // Variable to store token price
    uint256 public tokenPrice;

    // Base URI for token metadata
    string private baseURI;

    // Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        uint256 _tokenPrice,
        address _owner
    ) ERC404(_name, _symbol, _decimals, _totalSupply, _owner) {
        // Mint initial supply to the owner
        balanceOf[_owner] = _totalSupply * (10 ** _decimals);
        // Set token price
        tokenPrice = _tokenPrice;

    }

    // Function to allow users to purchase ERC404 tokens
    function buy() public payable {
        // Ensure sufficient Ether sent
        require(msg.value > 0, "Insufficient Ether sent");
        // Ensure token price is set
        require(tokenPrice > 0, "Token price not set");
        
        // Calculate amount of tokens to be purchased
        uint256 amount = msg.value / tokenPrice;
        require(amount > 0, "Insufficient Ether sent");

        // Ensure contract has enough tokens to sell
        require(balanceOf[owner] >= amount * (10 ** decimals), "Contract/Owner does not have enough tokens");
        
        // Transfer tokens from owner to buyer
        balanceOf[msg.sender] += amount * (10 ** decimals);
        balanceOf[owner] -= amount * (10 ** decimals);
        
        // Emit Transfer event
        emit Transfer(owner, msg.sender, amount * (10 ** decimals));
    }

    // Fallback function to receive Ether
    receive() external payable {
        buy();
    }

    // Function to withdraw Ether from the contract (for owner)
    function withdraw() external {
        // Ensure only owner can withdraw
        require(msg.sender == owner, "Only owner can withdraw");
        // Transfer contract balance to owner
        payable(owner).transfer(address(this).balance);
    }

    // Function to transfer tokens between addresses
    function transfer(address _to, uint256 _amount) public override returns (bool) {
        // Ensure sender has enough balance
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        // Ensure recipient address is valid
        require(_to != address(0), "Invalid recipient address");

        // Transfer tokens
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;

        // Emit Transfer event
        emit Transfer(msg.sender, _to, _amount);

        return true;
    }

    // Function to override tokenURI
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        // Ensure the token exists
        require(_exists(_tokenId), "Token does not exist");

        // Concatenate base URI with token ID to form complete URI
        string memory uri = string(abi.encodePacked(getBaseURI(), Strings.toString(_tokenId)));

        return uri;
    }

    // Internal function to check if a token exists
    function _exists(uint256 _tokenId) internal view returns (bool) {
        require(_tokenId != 0, "Token does not exist");
        return _tokenId <= totalSupply;
    }

    // Function to set base URI for token metadata
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    // Function to get base URI for token metadata
    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

      // Function to get balance of an address
    function getbalanceOf(address _owner) public view returns (uint256) {
        return balanceOf[_owner];
    }

}
