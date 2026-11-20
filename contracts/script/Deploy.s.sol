// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ZerovaFactory} from "../src/ZerovaFactory.sol";
import {ZerovaRenderer} from "../src/ZerovaRenderer.sol";

/// Deploys the renderer and the factory (the factory deploys the Enso contract). The owner runs it with their own
/// key; without --broadcast it only simulates.
///   TREASURY=0x... START_TICK=-200400 SQRT_PRICE_TOKEN0=... SQRT_PRICE_TOKEN1=... \
///   forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --account <keystore> --sender <address> [--broadcast]

interface Vm {
    function envAddress(string calldata name) external view returns (address);
    function envInt(string calldata name) external view returns (int256);
    function envUint(string calldata name) external view returns (uint256);
    function startBroadcast() external;
    function stopBroadcast() external;
}

interface INpm {
    function factory() external view returns (address);
    function WETH9() external view returns (address);
}

interface IUniFactory {
    function feeAmountTickSpacing(uint24 fee) external view returns (int24);
}

contract Deploy {
    Vm internal constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    address internal constant V3_FACTORY = 0x1f7d7550B1b028f7571E69A784071F0205FD2EfA;

    function run() external returns (address renderer, address factory, address enso) {
        require(block.chainid == 4663, "not Robinhood Chain mainnet (4663)");
        address treasury = vm.envAddress("TREASURY");
        int256 startTick = vm.envInt("START_TICK");
        uint256 sq0 = vm.envUint("SQRT_PRICE_TOKEN0");
        uint256 sq1 = vm.envUint("SQRT_PRICE_TOKEN1");
        require(treasury != address(0), "TREASURY");
        require(startTick >= type(int24).min && startTick <= type(int24).max, "START_TICK range");
        require(sq0 > 0 && sq0 <= type(uint160).max && sq1 > 0 && sq1 <= type(uint160).max, "SQRT range");

        // chain facts the factory relies on
        address npm = address(0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3);
        address weth = address(0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73);
        require(npm.code.length > 0 && weth.code.length > 0, "Uniswap or WETH missing");
        require(INpm(npm).factory() == V3_FACTORY, "NPM.factory");
        require(INpm(npm).WETH9() == weth, "NPM.WETH9");
        require(IUniFactory(V3_FACTORY).feeAmountTickSpacing(10_000) == 200, "1% tier");

        vm.startBroadcast();
        ZerovaRenderer r = new ZerovaRenderer();
        ZerovaFactory f = new ZerovaFactory(
            treasury, int24(startTick), uint160(sq0), uint160(sq1), address(r), "ZEROVA Enso", "ENSO"
        );
        vm.stopBroadcast();

        require(f.treasury() == treasury && f.startTick() == int24(startTick), "constructor values");
        require(address(f.enso()).code.length > 0, "enso");
        return (address(r), address(f), address(f.enso()));
    }
}
