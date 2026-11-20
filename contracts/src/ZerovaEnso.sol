// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IUniswapV3Pool} from "./interfaces/IUniswapV3.sol";

interface IZerovaRenderer {
    function tokenURI(
        uint256 id,
        string calldata name,
        string calldata symbol,
        uint8 gesture,
        uint8 pigment,
        uint8 strokes,
        bool sealed_,
        uint64 seed
    ) external view returns (string memory);
}

interface IERC20Meta {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}

/// @title ZerovaEnso
/// @notice One painting per launch: the coin's symbol, written in 12 strokes. The strokes follow the pool price
/// up from the launch price and come off again if it falls. The seal, once recorded, is permanent.
/// The painting is a display of the market state. It adds nothing to the token.
contract ZerovaEnso is ERC721 {
    int24 public constant COMPLETE_TICKS = 27_800;
    uint32 public constant TWAP_SECONDS = 600;

    address public immutable factory;
    IZerovaRenderer public immutable renderer;
    int24 public immutable startTick;

    struct Info {
        address token;
        address pool;
        bool token0;
        uint8 gesture;
        uint8 pigment;
        bool sealed_;
        uint64 seed;
    }

    mapping(uint256 => Info) public info;

    /// @dev ERC-4906
    event MetadataUpdate(uint256 _tokenId);
    event Sealed(uint256 indexed id);

    error OnlyFactory();
    error AlreadySealed();
    error NotComplete();

    constructor(address factory_, address renderer_, int24 startTick_, string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {
        factory = factory_;
        renderer = IZerovaRenderer(renderer_);
        startTick = startTick_;
    }

    function mint(
        address to,
        uint256 id,
        address token,
        address pool,
        bool token0,
        uint8 gesture,
        uint8 pigment,
        uint64 seed
    ) external {
        if (msg.sender != factory) revert OnlyFactory();
        info[id] = Info(token, pool, token0, gesture, pigment, false, seed);
        _mint(to, id);
    }

    /// @notice Ticks the price has moved up from the launch price, oriented as WETH per token.
    function progressTicks(uint256 id) public view returns (int256) {
        Info memory i = info[id];
        (, int24 tick,,,,,) = IUniswapV3Pool(i.pool).slot0();
        return _oriented(i.token0, tick) - int256(startTick);
    }

    /// @notice Strokes drawn now, 0 to 12, from the current pool price.
    function strokes(uint256 id) public view returns (uint8) {
        _requireOwned(id);
        int256 p = progressTicks(id);
        if (p <= 0) return 0;
        uint256 n = (uint256(p) * 12) / uint256(uint24(COMPLETE_TICKS));
        return n > 12 ? 12 : uint8(n);
    }

    /// @notice Record completion. Anyone can call it once the 10-minute average price is at or above completion.
    /// Reverts while the pool has less than 10 minutes of price history.
    function seal(uint256 id) external {
        _requireOwned(id);
        Info storage i = info[id];
        if (i.sealed_) revert AlreadySealed();
        uint32[] memory ago = new uint32[](2);
        ago[0] = TWAP_SECONDS;
        (int56[] memory cum,) = IUniswapV3Pool(i.pool).observe(ago);
        int56 d = cum[1] - cum[0];
        int56 avg = d / int56(uint56(TWAP_SECONDS));
        if (d < 0 && d % int56(uint56(TWAP_SECONDS)) != 0) avg--;
        if (_oriented(i.token0, avg) - int256(startTick) < int256(COMPLETE_TICKS)) revert NotComplete();
        i.sealed_ = true;
        emit Sealed(id);
        emit MetadataUpdate(id);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        _requireOwned(id);
        Info memory i = info[id];
        return renderer.tokenURI(
            id,
            IERC20Meta(i.token).name(),
            IERC20Meta(i.token).symbol(),
            i.gesture,
            i.pigment,
            strokes(id),
            i.sealed_,
            i.seed
        );
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
    }

    function _oriented(bool token0, int256 tick) internal pure returns (int256) {
        return token0 ? tick : -tick;
    }
}
