import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';
import { MyERC404 } from '../typechain/MyERC404';

describe('MyERC404 Contract', function () {
  let myERC404: MyERC404;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MyERC404Factory = await ethers.getContractFactory('MyERC404', owner);
    myERC404 = (await MyERC404Factory.deploy(
      'TokenName',
      'TKN',
      18,
      1000, // totalSupply
      ethers.parseEther('1'),    // tokenPrice
      await owner.getAddress()
    )) as MyERC404;
  });

  it('Should set the right owner', async function () {
    expect(await myERC404.owner()).to.equal(await owner.getAddress());
  });

  it('Should mint initial supply to the owner', async function () {
    const ownerBalance = await myERC404.balanceOf(await owner.getAddress());
    expect(ownerBalance).to.equal(ethers.parseEther('1000'));
  });

  it('Should allow users to purchase ERC404 tokens', async function () {
    const initialContractBalance1 = await ethers.provider.getBalance(myERC404.target);
    const addr1BeforeBalance = await myERC404.balanceOf(await addr1.getAddress());
    const ownerBalance = await myERC404.balanceOf(await myERC404.owner());
    expect(addr1BeforeBalance).to.equal(ethers.parseEther('0'));
    expect(ownerBalance).to.equal(ethers.parseEther('1000'));
    await myERC404.connect(addr1).buy({ value: ethers.parseEther('1') });
    const addr1Balance = await myERC404.balanceOf(await addr1.getAddress());
    const ownerAfterBalance = await myERC404.balanceOf(await myERC404.owner());
    expect(addr1Balance).to.equal(ethers.parseEther('1'));
    expect(ownerAfterBalance).to.equal(ethers.parseEther('999'));
  });

  it('Should revert if insufficient Ether sent for purchase', async function () {
    await expect(myERC404.connect(addr1).buy({ value: 0 })).to.be.revertedWith('Insufficient Ether sent');
  });

  it('Should transfer tokens between addresses', async function () {
    await myERC404.transfer(await addr1.getAddress(), ethers.parseEther('100'));
    const addr1Balance = await myERC404.balanceOf(await addr1.getAddress());
    expect(addr1Balance).to.equal(ethers.parseEther('100'));
  });

  it('Should revert when transferring tokens if sender does not have enough balance', async function () {
    await expect(myERC404.transfer(await addr2.getAddress(), ethers.parseEther('10000')))
      .to.be.revertedWith('Insufficient balance');
  });

  it('Should revert when transferring tokens to the zero address', async function () {
    await expect(myERC404.transfer(ethers.ZeroAddress, ethers.parseEther('100')))
      .to.be.revertedWith('Invalid recipient address');
  });

  it('Should set and get base URI for token metadata', async function () {
    const baseURI = 'https://tokenuri.nft/';
    await myERC404.setBaseURI(baseURI);
    expect(await myERC404.getBaseURI()).to.equal(baseURI);
  });

  it('Should revert when setting base URI if caller is not the owner', async function () {
    try {
      await expect(myERC404.connect(addr1).setBaseURI('https://tokenuri.nft/'));
      expect.fail("Expected to revert with Unauthorize");
    } catch (error) {
      expect(error.message).to.contain("Unauthorize");
    }
  })

  it('Should withdraw Ether from the contract', async function () {
    const initialContractBalance1 = await ethers.provider.getBalance(myERC404.target);
    const addr1BeforeBalance = await myERC404.balanceOf(await addr1.getAddress());
    const ownerBalance = await myERC404.balanceOf(await myERC404.owner());
    expect(addr1BeforeBalance).to.equal(ethers.parseEther('0'));
    expect(ownerBalance).to.equal(ethers.parseEther('1000'));
    await myERC404.connect(addr1).buy({ value: ethers.parseEther('1') });
    const addr1Balance = await myERC404.balanceOf(await addr1.getAddress());
    const ownerAfterBalance = await myERC404.balanceOf(await myERC404.owner());
    expect(addr1Balance).to.equal(ethers.parseEther('1'));
    expect(ownerAfterBalance).to.equal(ethers.parseEther('999'));
    const initialContractBalance2 = await ethers.provider.getBalance(myERC404.target);
    const ownerBalanceETH = await ethers.provider.getBalance(await owner.getAddress());
    const withdrawAmount = ethers.parseEther('1');
    await myERC404.withdraw();
    const ownerBalanceETHAfterWithdraw = await ethers.provider.getBalance(await owner.getAddress());
    expect(ownerBalanceETHAfterWithdraw).to.be.greaterThan(ownerBalanceETH);
  });

  it('Should revert when trying to withdraw Ether from the contract by non-owner', async function () {
    await expect(myERC404.connect(addr1).withdraw()).to.be.revertedWith('Only owner can withdraw');
  });


  it('Should return the correct token URI', async function () {
    const baseURI = 'https://tokenuri.nft/';
    await myERC404.setBaseURI(baseURI);
    const tokenId = 1;
    const tokenURI = await myERC404.tokenURI(tokenId);
    expect(tokenURI).to.equal(baseURI + tokenId.toString());
  });

  it('Should revert when getting token URI for a non-existent token', async function () {
    await expect(myERC404.tokenURI(0)).to.be.revertedWith('Token does not exist');
  });

  it('Should return the correct balance of an address', async function () {
    const balance = await myERC404.getbalanceOf(await owner.getAddress());
    expect(balance).to.equal(ethers.parseEther('1000'));
  });
});
