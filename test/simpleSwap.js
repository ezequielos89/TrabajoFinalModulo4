const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let tokenA, tokenB, simpleSwap, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const BotiCoin = await ethers.getContractFactory("BotiCoin");
    const PepaCoin = await ethers.getContractFactory("PepaCoin");
    const SimpleSwap = await ethers.getContractFactory("TrabajoPracticoModulo3"); // nombre del contrato

    tokenA = await BotiCoin.deploy(1000);
    tokenB = await PepaCoin.deploy(1000);
    simpleSwap = await SimpleSwap.deploy();

    await tokenA.mint(owner.address, ethers.parseUnits("1000", 18));
    await tokenB.mint(owner.address, ethers.parseUnits("1000", 18));

    await tokenA.approve(simpleSwap.target, ethers.MaxUint256);
    await tokenB.approve(simpleSwap.target, ethers.MaxUint256);
  });

  async function advanceTimeBy(seconds) {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const newTimestamp = block.timestamp + seconds;

    await ethers.provider.send("evm_setNextBlockTimestamp", [newTimestamp]);
    await ethers.provider.send("evm_mine");

    return newTimestamp;
  }

  it("debería agregar liquidez", async function () {
    const now = await advanceTimeBy(10);
    const deadline = now + 600;

    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseUnits("100", 18),
      ethers.parseUnits("50", 18),
      0,
      0,
      owner.address,
      deadline
    );

    const pool = await simpleSwap.pools(tokenA.target, tokenB.target);
    expect(pool.reserveA).to.equal(ethers.parseUnits("100", 18));
    expect(pool.reserveB).to.equal(ethers.parseUnits("50", 18));
  });

  it("debería devolver el precio correctamente", async function () {
    const now = await advanceTimeBy(10);
    const deadline = now + 600;

    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseUnits("100", 18),
      ethers.parseUnits("200", 18),
      0,
      0,
      owner.address,
      deadline
    );

    const price = await simpleSwap.getPrice(tokenA.target, tokenB.target);
    expect(price).to.equal(ethers.parseUnits("2", 18));
  });

  it("debería realizar un swap exitoso", async function () {
    const now = await advanceTimeBy(10);
    const deadline = now + 600;

    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseUnits("1000", 18),
      ethers.parseUnits("1000", 18),
      0,
      0,
      owner.address,
      deadline
    );

    await tokenA.approve(simpleSwap.target, ethers.parseUnits("10", 18));

    await simpleSwap.swapExactTokensForTokens(
      ethers.parseUnits("10", 18),
      0,
      [tokenA.target, tokenB.target],
      owner.address,
      deadline
    );
  });

  it("debería remover liquidez correctamente", async function () {
    const now = await advanceTimeBy(10);
    const deadline = now + 600;

    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseUnits("1000", 18),
      ethers.parseUnits("1000", 18),
      0,
      0,
      owner.address,
      deadline
    );

    const lpBalance = await simpleSwap.balanceOf(owner.address);

    await simpleSwap.removeLiquidity(
      tokenA.target,
      tokenB.target,
      lpBalance,
      0,
      0,
      owner.address,
      deadline
    );
  });

  it("debería fallar si el deadline está vencido", async function () {
    const now = await advanceTimeBy(10);
    const expiredDeadline = now - 1;

    await expect(
      simpleSwap.swapExactTokensForTokens(
        ethers.parseUnits("10", 18),
        0,
        [tokenA.target, tokenB.target],
        owner.address,
        expiredDeadline
      )
    ).to.be.revertedWith("Expired");
  });

  it("debería fallar si no hay liquidez en getPrice", async function () {
    await expect(
      simpleSwap.getPrice(tokenA.target, tokenB.target)
    ).to.be.reverted; // se espera panic por división por cero
  });

  it("debería fallar al remover liquidez si no existe pool", async function () {
    const now = await advanceTimeBy(10);
    const deadline = now + 600;

    await expect(
      simpleSwap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        ethers.parseUnits("100", 18),
        0,
        0,
        owner.address,
        deadline
      )
    ).to.be.reverted;
  });
});
