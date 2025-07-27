const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

describe("Ethers parseUnits test", function () {
  it("should parse units correctly", async function () {
    const amount = utils.parseUnits("1.0", 18);
    expect(amount.toString()).to.equal("1000000000000000000");
  });
});

