// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ZerovaFactory} from "../src/ZerovaFactory.sol";
import {ZerovaRenderer} from "../src/ZerovaRenderer.sol";
import {ZerovaEnso} from "../src/ZerovaEnso.sol";
import {ZerovaToken} from "../src/ZerovaToken.sol";

/// Read-only check against Robinhood Chain mainnet state. Nothing is broadcast.
///   forge test --match-contract ForkTest --fork-url https://rpc.mainnet.chain.robinhood.com -vv
/// It deploys the contracts inside a local copy of the chain, launches coins in both token orders,
/// buys and sells through the real Uniswap SwapRouter02, and collects the pool fees.

interface Vm {
    function deal(address who, uint256 amount) external;
}

interface IUniFactory {
    function feeAmountTickSpacing(uint24 fee) external view returns (int24);
}

interface INpm {
    function factory() external view returns (address);
    function WETH9() external view returns (address);
    function ownerOf(uint256 id) external view returns (address);
    function positions(uint256 id)
        external
        view
        returns (uint96, address, address, address, uint24, int24, int24, uint128, uint256, uint256, uint128, uint128);
}

interface IPool {
    function slot0() external view returns (uint160, int24, uint16, uint16, uint16, uint8, bool);
}

interface IErc20 {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

interface IRouter02 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256);
    function factory() external view returns (address);
    function WETH9() external view returns (address);
}

contract ForkTest {
    Vm internal constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    address internal constant V3_FACTORY = 0x1f7d7550B1b028f7571E69A784071F0205FD2EfA;
    address internal constant NPM = 0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3;
    address internal constant ROUTER02 = 0xCaf681a66D020601342297493863E78C959E5cb2;
    address internal constant WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;

    // Example launch price: 2 ETH fully diluted (scripts/tick-from-fdv.py 2). The checks hold for any valid price.
    int24 internal constant START = -200_400;
    uint160 internal constant SQ0 = 3527495286400058447893961;
    uint160 internal constant SQ1 = 1779478419032190703672274283612071;

    address internal immutable TREASURY = address(uint160(uint256(keccak256("zerova fork test treasury"))));
    uint256 internal constant FEE = 0.0005 ether;
    uint256 internal constant SUPPLY = 1_000_000_000e18;

    ZerovaFactory internal f;
    ZerovaEnso internal e;
    uint256 internal nonce;

    receive() external payable {}

    function setUp() public {
        require(block.chainid == 4663, "fork Robinhood Chain mainnet: --fork-url https://rpc.mainnet.chain.robinhood.com");
        vm.deal(address(this), 1_000 ether);
        ZerovaRenderer r = new ZerovaRenderer();
        f = new ZerovaFactory(TREASURY, START, SQ0, SQ1, address(r), "ZEROVA Enso", "ENSO");
        e = f.enso();
    }

    function test_chainFacts() public view {
        require(V3_FACTORY.code.length > 0 && NPM.code.length > 0 && ROUTER02.code.length > 0 && WETH.code.length > 0, "missing code");
        require(INpm(NPM).factory() == V3_FACTORY, "NPM.factory");
        require(INpm(NPM).WETH9() == WETH, "NPM.WETH9");
        require(IRouter02(ROUTER02).factory() == V3_FACTORY, "router factory");
        require(IRouter02(ROUTER02).WETH9() == WETH, "router WETH9");
        require(IUniFactory(V3_FACTORY).feeAmountTickSpacing(10_000) == 200, "1% tier tick spacing");
    }

    function _launch() internal returns (uint256 id, address token) {
        nonce++;
        (id, token) = f.launch{value: FEE}("Fork Test", "FORK", 3, 2, keccak256(abi.encode(nonce, block.timestamp)));
    }

    function _check(uint256 id, address token) internal view {
        ZerovaFactory.Launch memory l = f.launchOf(id);
        bool isT0 = token < WETH;
        require(l.token0 == isT0, "order");
        (, int24 tick,,,,,) = IPool(l.pool).slot0();
        require(tick == (isT0 ? START - 1 : -START), "launch tick");
        (,,,,,,, uint128 liq,,,,) = INpm(NPM).positions(l.positionId);
        require(liq > 0, "liquidity");
        require(INpm(NPM).ownerOf(l.positionId) == address(f), "position owner");
        require(IErc20(token).balanceOf(address(f)) < SUPPLY / 100_000, "supply seeded");
        (bool a, bool b, bool c, bool d, bool g) = f.zeroStandard(token);
        require(a && b && c && d && g, "zero standard");
        require(e.ownerOf(id) == address(this), "enso owner");
        require(e.strokes(id) == 0, "strokes at launch");
    }

    function test_launchBothOrders() public {
        bool seen0;
        bool seen1;
        for (uint256 i; i < 40 && !(seen0 && seen1); ++i) {
            (uint256 id, address token) = _launch();
            _check(id, token);
            if (token < WETH) seen0 = true;
            else seen1 = true;
        }
        require(seen0 && seen1, "both token orders");
    }

    function test_tradeAndCollect() public {
        (uint256 id, address token) = _launch();
        ZerovaFactory.Launch memory l = f.launchOf(id);
        // buy 0.01 ETH through the real router: well under the 2% wallet limit
        uint256 got = IRouter02(ROUTER02).exactInputSingle{value: 0.01 ether}(
            IRouter02.ExactInputSingleParams(WETH, token, 10_000, address(this), 0.01 ether, 0, 0)
        );
        require(got > 0 && got < SUPPLY / 50, "buy");
        (, int24 tickAfter,,,,,) = IPool(l.pool).slot0();
        require(l.token0 ? tickAfter > START - 1 : tickAfter < -START, "price moved up");
        // sell half back
        IErc20(token).approve(ROUTER02, got / 2);
        uint256 back = IRouter02(ROUTER02).exactInputSingle(
            IRouter02.ExactInputSingleParams(token, WETH, 10_000, address(this), got / 2, 0, 0)
        );
        require(back > 0, "sell");
        // pool fees: 70% to the creator (this contract), 30% to the treasury
        uint256 w0 = IErc20(WETH).balanceOf(TREASURY);
        uint256 c0 = IErc20(WETH).balanceOf(address(this));
        f.collectFees(id);
        uint256 tw = IErc20(WETH).balanceOf(TREASURY) - w0;
        uint256 cw = IErc20(WETH).balanceOf(address(this)) - c0;
        require(cw > 0 && tw > 0, "fees paid");
        require(cw * 3 / 7 <= tw + 1 && tw <= cw * 3 / 7 + 1, "70/30 split");
        // launch fee goes only to the treasury
        uint256 t0 = TREASURY.balance;
        f.withdrawLaunchFees();
        require(TREASURY.balance - t0 == FEE, "launch fee to treasury");
        // the Enso renders
        bytes memory uri = bytes(e.tokenURI(id));
        require(uri.length > 1000, "tokenURI");
    }
}
