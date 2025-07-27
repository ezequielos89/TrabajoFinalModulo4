const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("TrabajoPracticoModulo3 - SimpleSwap", function () {
  let owner, addr1, addr2;
  let tokenA, tokenB, swap;
  const initialSupply = ethers.parseUnits("1000000", 18);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Desplegar tokens
    const BotiCoin = await ethers.getContractFactory("BotiCoin");
    tokenA = await BotiCoin.deploy(ethers.parseUnits("1000000", 0));
    await tokenA.waitForDeployment();

    const PepaCoin = await ethers.getContractFactory("PepaCoin");
    tokenB = await PepaCoin.deploy(ethers.parseUnits("1000000", 0));
    await tokenB.waitForDeployment();

    // Desplegar el swap
    const Swap = await ethers.getContractFactory("TrabajoPracticoModulo3");
    swap = await Swap.deploy();
    await swap.waitForDeployment();

    // Aprobar tokens para el swap
    await tokenA.approve(swap.target, initialSupply);
    await tokenB.approve(swap.target, initialSupply);
  });

  it("debería agregar liquidez correctamente y emitir evento", async function () {
    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("2000", 18);

    await expect(
      swap.addLiquidity(
        tokenA.target,
        tokenB.target,
        amountA,
        amountB,
        0,
        0,
        owner.address,
        0
      )
    ).to.emit(swap, "LiquidityAdded");

    const lpBalance = await swap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);
  });

  it("debería revertir si amountA o amountB es cero", async function () {
    await expect(
      swap.addLiquidity(
        tokenA.target,
        tokenB.target,
        0,
        ethers.parseUnits("1000", 18),
        0,
        0,
        owner.address,
        0
      )
    ).to.be.revertedWith("Invalid amounts");

    await expect(
      swap.addLiquidity(
        tokenA.target,
        tokenB.target,
        ethers.parseUnits("1000", 18),
        0,
        0,
        0,
        owner.address,
        0
      )
    ).to.be.revertedWith("Invalid amounts");
  });

  it("debería hacer swap correctamente y emitir evento", async function () {
    // Agregar liquidez primero
    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);
    await swap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      0,
      0,
      owner.address,
      0
    );

    // Transferir y aprobar tokens a addr1
    await tokenA.transfer(addr1.address, ethers.parseUnits("100", 18));
    await tokenA.connect(addr1).approve(swap.target, ethers.parseUnits("100", 18));

    const path = [tokenA.target, tokenB.target];
    const amountIn = ethers.parseUnits("10", 18);

    await expect(
      swap.connect(addr1).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        addr1.address,
        0
      )
    ).to.emit(swap, "Swap");

    const tokenBBalance = await tokenB.balanceOf(addr1.address);
    expect(tokenBBalance).to.be.gt(0);
  });

  it("debería revertir swap si no hay liquidez", async function () {
    const path = [tokenA.target, tokenB.target];
    const amountIn = ethers.parseUnits("10", 18);

    await tokenA.transfer(addr1.address, amountIn);
    await tokenA.connect(addr1).approve(swap.target, amountIn);

    await expect(
      swap.connect(addr1).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        addr1.address,
        0
      )
    ).to.be.reverted;
  });

  it("debería remover liquidez correctamente y emitir evento", async function () {
    // Agregar liquidez primero
    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);
    await swap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      0,
      0,
      owner.address,
      0
    );

    const lpBalance = await swap.balanceOf(owner.address);

    await expect(
      swap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        lpBalance,
        0,
        0,
        owner.address,
        0
      )
    ).to.emit(swap, "LiquidityRemoved");

    const lpBalanceAfter = await swap.balanceOf(owner.address);
    expect(lpBalanceAfter).to.equal(0);
  });

  it("debería revertir removeLiquidity si no hay LP tokens", async function () {
    await expect(
      swap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        ethers.parseUnits("1", 18),
        0,
        0,
        addr1.address,
        0
      )
    ).to.be.reverted;
  });

  it("debería devolver el precio correctamente", async function () {
    // Agregar liquidez primero
    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("2000", 18);
    await swap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      0,
      0,
      owner.address,
      0
    );

    const price = await swap.getPrice(tokenA.target, tokenB.target);
    expect(price).to.be.gt(0);
  });

  it("debería revertir getPrice si la pool no existe", async function () {
    await expect(
      swap.getPrice(tokenA.target, tokenB.target)
    ).to.be.revertedWith("SimpleSwap: POOL DOES NOT EXIST");
  });
});