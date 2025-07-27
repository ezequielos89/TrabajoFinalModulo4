// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract Faucet is ReentrancyGuard {
    address public owner;
    IERC20 public pepaToken;
    IERC20 public botiToken;

    mapping(address => uint256) public lastClaimTime;

    uint256 public claimAmountPepa;
    uint256 public claimAmountBoti;
    uint256 public cooldown = 1 minutes;

    event TokensClaimed(address indexed user, uint256 pepaAmount, uint256 botiAmount);
    event TokensWithdrawn(address indexed to, uint256 pepaAmount, uint256 botiAmount);
    event ClaimAmountsUpdated(uint256 newPepaAmount, uint256 newBotiAmount);
    event CooldownUpdated(uint256 newCooldown);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _pepa, address _boti, uint256 _claimPepa, uint256 _claimBoti) {
        owner = msg.sender;
        pepaToken = IERC20(_pepa);
        botiToken = IERC20(_boti);
        claimAmountPepa = _claimPepa;
        claimAmountBoti = _claimBoti;
    }

    function claim() external nonReentrant {
        require(block.timestamp - lastClaimTime[msg.sender] >= cooldown, "Wait cooldown");
        require(pepaToken.balanceOf(address(this)) >= claimAmountPepa, "Faucet empty PEPA");
        require(botiToken.balanceOf(address(this)) >= claimAmountBoti, "Faucet empty BOTI");

        lastClaimTime[msg.sender] = block.timestamp;
        require(pepaToken.transfer(msg.sender, claimAmountPepa), "PEPA transfer failed");
        require(botiToken.transfer(msg.sender, claimAmountBoti), "BOTI transfer failed");

        emit TokensClaimed(msg.sender, claimAmountPepa, claimAmountBoti);
    }

    function withdrawTokens(address to) external onlyOwner {
        uint256 pepaBal = pepaToken.balanceOf(address(this));
        uint256 botiBal = botiToken.balanceOf(address(this));

        require(pepaToken.transfer(to, pepaBal), "Withdraw PEPA failed");
        require(botiToken.transfer(to, botiBal), "Withdraw BOTI failed");

        emit TokensWithdrawn(to, pepaBal, botiBal);
    }

    function loadTokens(uint256 amountPepa, uint256 amountBoti) external onlyOwner {
        require(pepaToken.transferFrom(msg.sender, address(this), amountPepa), "PEPA load failed");
        require(botiToken.transferFrom(msg.sender, address(this), amountBoti), "BOTI load failed");
    }

    function setClaimAmounts(uint256 _claimPepa, uint256 _claimBoti) external onlyOwner {
        claimAmountPepa = _claimPepa;
        claimAmountBoti = _claimBoti;
        emit ClaimAmountsUpdated(_claimPepa, _claimBoti);
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        cooldown = _cooldown;
        emit CooldownUpdated(_cooldown);
    }
}
