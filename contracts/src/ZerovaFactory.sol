// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ZerovaToken} from "./ZerovaToken.sol";
import {ZerovaEnso} from "./ZerovaEnso.sol";
import {INonfungiblePositionManager, IUniswapV3Pool} from "./interfaces/IUniswapV3.sol";

interface IERC20Lite {
    function balanceOf(address) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

/// @title ZerovaFactory
/// @notice Permissionless launches on Robinhood Chain. One call creates the token, creates and prices the
/// Uniswap V3 pool against WETH, puts the whole supply into one locked position, and mints the Enso to the caller.
/// There is no owner, no admin, no proxy and no upgrade. The position can never leave this contract.
contract ZerovaFactory {
    // Robinhood Chain mainnet (chain 4663). Sources recorded in docs/DECISIONS.md.
    address public constant WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;
    INonfungiblePositionManager public constant POSITION_MANAGER =
        INonfungiblePositionManager(0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3);

    uint256 public constant SUPPLY = 1_000_000_000e18;
    uint24 public constant POOL_FEE = 10_000;
    int24 public constant TICK_SPACING = 200;
    int24 public constant RANGE_TICKS = 69_200;
    int24 public constant COMPLETE_TICKS = 27_800;
    uint256 public constant LAUNCH_FEE = 0.0005 ether;
    uint256 public constant CREATOR_FEE_BPS = 7_000;
    uint16 public constant OBSERVATIONS = 64;
    int24 internal constant MAX_TICK = 887_200;

    address public immutable treasury;
    ZerovaEnso public immutable enso;
    /// @notice Launch price as a tick of WETH per token. Multiple of TICK_SPACING.
    int24 public immutable startTick;
    /// @notice Initial pool price when the token sorts before WETH: just below the tick `startTick`.
    uint160 public immutable sqrtPriceToken0;
    /// @notice Initial pool price when the token sorts after WETH: just above the tick `-startTick`.
    uint160 public immutable sqrtPriceToken1;
    bytes32 public immutable tokenCodeHash;

    struct Launch {
        address token;
        address pool;
        uint256 positionId;
        address creator;
        bool token0;
        uint64 launchedAt;
    }

    Launch[] internal _launches;
    /// @notice Launch id (starting at 1, equal to the Enso id) for a token created here; 0 if none.
    mapping(address => uint256) public launchIdOf;

    uint256 private _lock = 1;

    event Launched(
        uint256 indexed id,
        address indexed token,
        address indexed creator,
        address pool,
        uint256 positionId,
        string name,
        string symbol,
        uint8 gesture,
        uint8 pigment
    );
    event FeesCollected(uint256 indexed id, uint256 amount0, uint256 amount1);
    event LaunchFeesWithdrawn(uint256 amount);

    error BadFee();
    error BadName();
    error BadSymbol();
    error BadChoice();
    error PoolPrice();
    error NoLiquidity();
    error TransferFailed();
    error UnknownLaunch();
    error Reentrant();
    error BadConfig();

    modifier nonReentrant() {
        if (_lock != 1) revert Reentrant();
        _lock = 2;
        _;
        _lock = 1;
    }

    constructor(
        address treasury_,
        int24 startTick_,
        uint160 sqrtPriceToken0_,
        uint160 sqrtPriceToken1_,
        address renderer_,
        string memory ensoName_,
        string memory ensoSymbol_
    ) {
        if (treasury_ == address(0) || renderer_ == address(0)) revert BadConfig();
        if (startTick_ % TICK_SPACING != 0) revert BadConfig();
        if (startTick_ < -MAX_TICK || startTick_ + RANGE_TICKS > MAX_TICK) revert BadConfig();
        if (-startTick_ - RANGE_TICKS < -MAX_TICK || -startTick_ > MAX_TICK) revert BadConfig();
        if (sqrtPriceToken0_ == 0 || sqrtPriceToken1_ == 0) revert BadConfig();
        treasury = treasury_;
        startTick = startTick_;
        sqrtPriceToken0 = sqrtPriceToken0_;
        sqrtPriceToken1 = sqrtPriceToken1_;
        tokenCodeHash = keccak256(type(ZerovaToken).runtimeCode);
        enso = new ZerovaEnso(address(this), renderer_, startTick_, ensoName_, ensoSymbol_);
    }

    /// @notice Launch a coin. Send exactly LAUNCH_FEE. The caller receives the Enso and no tokens.
    /// @param name 1 to 32 characters: letters, digits, space and . , ' ! ? -
    /// @param symbol 2 to 8 characters: A to Z and 0 to 9
    /// @param gesture 0 to 7
    /// @param pigment 0 to 5
    /// @param salt Random value chosen by the caller. With the caller's address and the launch count it sets the
    /// token address, so nobody can predict that address and create its pool at another price before the launch.
    /// If a launch still reverts with PoolPrice, sending it again with a new salt uses a new address.
    function launch(string calldata name, string calldata symbol, uint8 gesture, uint8 pigment, bytes32 salt)
        external
        payable
        nonReentrant
        returns (uint256 id, address token)
    {
        if (msg.value != LAUNCH_FEE) revert BadFee();
        _checkName(bytes(name));
        _checkSymbol(bytes(symbol));
        if (gesture >= 8 || pigment >= 6) revert BadChoice();

        ZerovaToken t = new ZerovaToken{salt: keccak256(abi.encode(msg.sender, salt, _launches.length))}(
            name, symbol, address(POSITION_MANAGER)
        );
        token = address(t);
        bool isToken0 = token < WETH;
        (address token0, address token1) = isToken0 ? (token, WETH) : (WETH, token);

        uint160 sqrtP = isToken0 ? sqrtPriceToken0 : sqrtPriceToken1;
        address pool = POSITION_MANAGER.createAndInitializePoolIfNecessary(token0, token1, POOL_FEE, sqrtP);

        // The pool must be fresh and priced exactly as intended. A pool created in advance by someone else
        // at another price makes this launch revert instead of seeding liquidity at a wrong price.
        int24 lower;
        int24 upper;
        {
            (uint160 s, int24 tick,,,,,) = IUniswapV3Pool(pool).slot0();
            if (isToken0) {
                lower = startTick;
                upper = startTick + RANGE_TICKS;
                if (s != sqrtP || tick != lower - 1) revert PoolPrice();
            } else {
                upper = -startTick;
                lower = upper - RANGE_TICKS;
                if (s != sqrtP || tick != upper) revert PoolPrice();
            }
            if (IUniswapV3Pool(pool).liquidity() != 0) revert PoolPrice();
        }

        t.setPool(pool);
        IUniswapV3Pool(pool).increaseObservationCardinalityNext(OBSERVATIONS);

        t.approve(address(POSITION_MANAGER), SUPPLY);
        (uint256 positionId, uint128 liquidity,,) = POSITION_MANAGER.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: POOL_FEE,
                tickLower: lower,
                tickUpper: upper,
                amount0Desired: isToken0 ? SUPPLY : 0,
                amount1Desired: isToken0 ? 0 : SUPPLY,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            })
        );
        if (liquidity == 0) revert NoLiquidity();
        t.approve(address(POSITION_MANAGER), 0);

        id = _launches.length + 1;
        _launches.push(Launch(token, pool, positionId, msg.sender, isToken0, uint64(block.timestamp)));
        launchIdOf[token] = id;

        uint64 seed = uint64(uint256(keccak256(abi.encode(token, msg.sender, block.timestamp, id))));
        enso.mint(msg.sender, id, token, pool, isToken0, gesture, pigment, seed);

        emit Launched(id, token, msg.sender, pool, positionId, name, symbol, gesture, pigment);
    }

    /// @notice Collect the pool fees of a launch. Anyone can call it. 70% goes to the creator, 30% to the treasury.
    function collectFees(uint256 id) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        Launch memory l = launchOf(id);
        (amount0, amount1) = POSITION_MANAGER.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: l.positionId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );
        (address token0, address token1) = l.token0 ? (l.token, WETH) : (WETH, l.token);
        _split(token0, amount0, l.creator);
        _split(token1, amount1, l.creator);
        emit FeesCollected(id, amount0, amount1);
    }

    /// @notice Send the collected launch fees to the treasury. Anyone can call it; the destination is fixed.
    function withdrawLaunchFees() external nonReentrant {
        uint256 amount = address(this).balance;
        (bool ok,) = treasury.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit LaunchFeesWithdrawn(amount);
    }

    function launchCount() external view returns (uint256) {
        return _launches.length;
    }

    function launchOf(uint256 id) public view returns (Launch memory) {
        if (id == 0 || id > _launches.length) revert UnknownLaunch();
        return _launches[id - 1];
    }

    /// @notice The five Zero Standard checks, computed from chain state. Each one tests exactly what its name says.
    function zeroStandard(address token)
        external
        view
        returns (bool launchedHere, bool codeMatches, bool supplyFixed, bool positionLocked, bool fullySeeded)
    {
        uint256 id = launchIdOf[token];
        if (id == 0) return (false, false, false, false, false);
        Launch memory l = _launches[id - 1];
        launchedHere = l.pool != address(0);
        codeMatches = token.codehash == tokenCodeHash;
        supplyFixed = IERC20Lite(token).totalSupply() == SUPPLY;
        (,,,,,,, uint128 liq,,,,) = POSITION_MANAGER.positions(l.positionId);
        positionLocked = POSITION_MANAGER.ownerOf(l.positionId) == address(this) && liq > 0;
        fullySeeded = IERC20Lite(token).balanceOf(address(this)) < SUPPLY / 100_000;
    }

    function _split(address tok, uint256 amount, address creator) internal {
        if (amount == 0) return;
        uint256 toCreator = (amount * CREATOR_FEE_BPS) / 10_000;
        _send(tok, creator, toCreator);
        _send(tok, treasury, amount - toCreator);
    }

    function _send(address tok, address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, bytes memory ret) = tok.call(abi.encodeWithSelector(0xa9059cbb, to, amount));
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) revert TransferFailed();
    }

    function _checkSymbol(bytes memory s) internal pure {
        if (s.length < 2 || s.length > 8) revert BadSymbol();
        for (uint256 i; i < s.length; ++i) {
            bytes1 c = s[i];
            if (!((c >= "A" && c <= "Z") || (c >= "0" && c <= "9"))) revert BadSymbol();
        }
    }

    function _checkName(bytes memory s) internal pure {
        if (s.length < 1 || s.length > 32) revert BadName();
        if (s[0] == " " || s[s.length - 1] == " ") revert BadName();
        for (uint256 i; i < s.length; ++i) {
            bytes1 c = s[i];
            bool ok = (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || (c >= "0" && c <= "9") || c == " " || c == "."
                || c == "," || c == "'" || c == "!" || c == "?" || c == "-";
            if (!ok) revert BadName();
        }
    }
}
