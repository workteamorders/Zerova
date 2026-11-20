// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ZerovaToken
/// @notice Fixed-supply ERC-20 created by the ZEROVA factory. No mint after construction, no tax,
/// no blacklist, no pause, no owner. For the first 10 minutes a wallet may hold at most 2% of supply.
/// @dev No immutables: every token has identical runtime code, so the factory can check the code hash.
contract ZerovaToken is ERC20 {
    uint256 public constant SUPPLY = 1_000_000_000e18;
    uint256 public constant LIMIT_WINDOW = 600;
    uint256 public constant MAX_WALLET = (SUPPLY * 200) / 10_000;

    address public factory;
    address public pool;
    address public positionManager;
    uint64 public launchedAt;

    error WalletLimit();
    error OnlyFactory();

    constructor(string memory name_, string memory symbol_, address positionManager_) ERC20(name_, symbol_) {
        factory = msg.sender;
        positionManager = positionManager_;
        launchedAt = uint64(block.timestamp);
        _mint(msg.sender, SUPPLY);
    }

    /// @notice Records the pool once. Only the factory, only once.
    function setPool(address pool_) external {
        if (msg.sender != factory || pool != address(0)) revert OnlyFactory();
        pool = pool_;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (
            block.timestamp < uint256(launchedAt) + LIMIT_WINDOW && to != address(0) && to != pool && to != factory
                && to != positionManager
        ) {
            if (balanceOf(to) > MAX_WALLET) revert WalletLimit();
        }
    }
}
