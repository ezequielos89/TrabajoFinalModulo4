const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("PepaCoin - funciones mint y burn", function () {
  let owner, addr1, tokenB;
  const initialSupply = ethers.parseUnits("1000000", 18);

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const PepaCoin = await ethers.getContractFactory("PepaCoin");
    tokenB = await PepaCoin.deploy(ethers.parseUnits("1000000", 0)); // Pasa el initialSupply como uint256
    await tokenB.waitForDeployment(); // <-- Cambiado aquí
  });

  it("debería permitir al owner mintear tokens", async function () {
    const amount = ethers.parseUnits("100", 18);
    await tokenB.mint(owner.address, amount);
    expect(await tokenB.balanceOf(owner.address)).to.equal(initialSupply.add(amount));
  });

  it("debería revertir si un no-owner intenta mintear", async function () {
    const amount = ethers.parseUnits("100", 18);
    await expect(tokenB.connect(addr1).mint(addr1.address, amount)).to.be.reverted;
  });

  it("debería quemar tokens correctamente", async function () {
    const amount = ethers.parseUnits("50", 18);
    await tokenB.burn(amount);
        expect(await tokenB.balanceOf(owner.address)).to.equal(initialSupply.sub(amount));
      });
    });