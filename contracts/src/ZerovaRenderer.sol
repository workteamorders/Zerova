// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ZerovaGlyphs} from "./ZerovaGlyphs.sol";

/// @title ZerovaRenderer
/// @notice Draws an Enso as SVG: the coin's symbol written with a brush. The ink covers the first `strokes`
/// twelfths of the total ink length, in writing order, over a faint pencil underdrawing of the whole symbol.
/// Stateless and pure: anyone can call it to preview a painting before launching.
contract ZerovaRenderer {
    using Strings for uint256;
    using Strings for int256;

    uint256 internal constant GAP = 24; // between glyphs, 1/100 of glyph height
    uint256 internal constant ROW_GAP = 34; // between rows, 1/100 of glyph height

    struct Brush {
        string name;
        uint256 width; // per mille of glyph height
        string dry; // dash pattern of the dry streak, empty for none
        int256 skew; // degrees
        uint256 jitter; // per mille of glyph height
        string cap;
    }

    struct Layout {
        uint256 h; // glyph height in px
        uint256 rows;
        uint256 split; // glyphs in the first row
        uint256[2] rowWidth; // in 1/100 of glyph height
        uint256 top; // y of the first row
    }

    function brush(uint8 g) public pure returns (Brush memory) {
        if (g == 0) return Brush("Still", 120, "", 0, 0, "round");
        if (g == 1) return Brush("Surge", 165, "60 8 140 12", -6, 0, "round");
        if (g == 2) return Brush("Drift", 140, "30 10 90 14", 8, 0, "round");
        if (g == 3) return Brush("Fracture", 140, "14 7 32 10 8 6", 4, 6, "butt");
        if (g == 4) return Brush("Bloom", 155, "", 0, 4, "round");
        if (g == 5) return Brush("Tremor", 100, "", 2, 14, "round");
        if (g == 6) return Brush("Hollow", 180, "10 6 24 8", -3, 0, "round");
        return Brush("Weight", 200, "120 6", 3, 0, "round");
    }

    function pigment(uint8 p) public pure returns (string memory name, string memory ink, string memory wash, string memory seal) {
        if (p == 0) return ("Sumi", "#151821", "#C5C9D0", "#B8321E");
        if (p == 1) return ("Indigo", "#1B2E66", "#BCC6E2", "#B8321E");
        if (p == 2) return ("Vermilion", "#B1301B", "#E6C4BA", "#151821");
        if (p == 3) return ("Umber", "#4A2D1A", "#D6C5AE", "#A5341E");
        if (p == 4) return ("Slate", "#2B3944", "#C1CCD2", "#C0452A");
        return ("Ochre", "#855410", "#E4D1A0", "#1B2330");
    }

    function tokenURI(
        uint256 id,
        string calldata name,
        string calldata symbol,
        uint8 gesture,
        uint8 pig,
        uint8 strokes,
        bool sealed_,
        uint64 seed
    ) external pure returns (string memory) {
        string memory svg = image(id, name, symbol, gesture, pig, strokes, sealed_, seed);
        (string memory pigName,,,) = pigment(pig);
        bytes memory json = abi.encodePacked(
            '{"name":"', symbol, " Enso #", id.toString(),
            '","description":"The symbol ', symbol,
            ", brushed in 12 strokes. The strokes follow the coin's market price up from its launch price and come off again if it falls. Only the completion seal is permanent. A display of market state; it adds nothing to the token.\",",
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[{"trait_type":"Gesture","value":"', brush(gesture).name,
            '"},{"trait_type":"Pigment","value":"', pigName,
            '"},{"trait_type":"Strokes","value":', uint256(strokes).toString(),
            '},{"trait_type":"Sealed","value":"', sealed_ ? "Yes" : "No", '"}]}'
        );
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }

    function image(
        uint256 id,
        string calldata name,
        string calldata symbol,
        uint8 gesture,
        uint8 pig,
        uint8 strokes,
        bool sealed_,
        uint64 seed
    ) public pure returns (string memory) {
        bytes memory sym = bytes(symbol);
        Layout memory L = _layout(sym);
        (int256[] memory xs, int256[] memory ys, uint256[] memory starts) = _points(sym, L, brush(gesture).jitter, seed);
        string memory full = _path(xs, ys, starts, 12);
        string memory ink = strokes == 0 ? "" : _path(xs, ys, starts, strokes > 12 ? 12 : strokes);
        return string(abi.encodePacked(_head(L, pig, full), _ink(L, gesture, pig, ink), _foot(id, name, symbol, strokes, sealed_, seed, pig)));
    }

    // ---- layout -------------------------------------------------------------------------------------------

    function _layout(bytes memory sym) internal pure returns (Layout memory L) {
        uint256 n = sym.length;
        L.rows = n <= 3 ? 1 : 2;
        L.split = L.rows == 1 ? n : (n + 1) / 2;
        uint256 widest;
        for (uint256 r; r < L.rows; ++r) {
            uint256 a = r == 0 ? 0 : L.split;
            uint256 b = r == 0 ? L.split : n;
            uint256 w;
            for (uint256 i = a; i < b; ++i) {
                w += ZerovaGlyphs.width(ZerovaGlyphs.indexOf(sym[i])) + (i > a ? GAP : 0);
            }
            L.rowWidth[r] = w;
            if (w > widest) widest = w;
        }
        uint256 h = L.rows == 1 ? 320 : 290;
        uint256 byWidth = (780 * 100) / widest;
        if (byWidth < h) h = byWidth;
        uint256 byHeight = (750 * 100) / (L.rows * 100 + (L.rows - 1) * ROW_GAP);
        if (byHeight < h) h = byHeight;
        L.h = h;
        uint256 blockH = (h * (L.rows * 100 + (L.rows - 1) * ROW_GAP)) / 100;
        L.top = 150 + (750 - blockH) / 2 - 20;
    }

    /// @dev All pen points in px, in writing order. `starts[k]` is the index where pen stroke k begins;
    /// the last entry equals the point count.
    function _points(bytes memory sym, Layout memory L, uint256 jitter, uint64 seed)
        internal
        pure
        returns (int256[] memory xs, int256[] memory ys, uint256[] memory starts)
    {
        uint256 total;
        uint256 pens;
        for (uint256 i; i < sym.length; ++i) {
            uint256 o = ZerovaGlyphs.offset(ZerovaGlyphs.indexOf(sym[i]));
            uint256 sc = uint8(ZerovaGlyphs.DATA[o++]);
            pens += sc;
            for (uint256 s; s < sc; ++s) {
                uint256 pc = uint8(ZerovaGlyphs.DATA[o]);
                total += pc;
                o += 1 + 2 * pc;
            }
        }
        xs = new int256[](total);
        ys = new int256[](total);
        starts = new uint256[](pens + 1);
        uint256 k;
        uint256 p;
        int256 h = int256(L.h);
        for (uint256 r; r < L.rows; ++r) {
            uint256 a = r == 0 ? 0 : L.split;
            uint256 b = r == 0 ? L.split : sym.length;
            int256 x = 500 - int256((L.rowWidth[r] * L.h) / 200);
            int256 y = int256(L.top + (r * L.h * (100 + ROW_GAP)) / 100);
            for (uint256 i = a; i < b; ++i) {
                uint256 gi = ZerovaGlyphs.indexOf(sym[i]);
                uint256 o = ZerovaGlyphs.offset(gi);
                uint256 sc = uint8(ZerovaGlyphs.DATA[o++]);
                for (uint256 s; s < sc; ++s) {
                    uint256 pc = uint8(ZerovaGlyphs.DATA[o++]);
                    starts[k++] = p;
                    for (uint256 q; q < pc; ++q) {
                        int256 gx = int256(uint256(uint8(ZerovaGlyphs.DATA[o++]))) - 10;
                        int256 gy = int256(uint256(uint8(ZerovaGlyphs.DATA[o++]))) - 10;
                        int256 jx;
                        int256 jy;
                        if (jitter > 0) {
                            uint256 rnd = uint256(keccak256(abi.encode(seed, p)));
                            int256 amp = int256((jitter * L.h) / 1000);
                            jx = int256(rnd % uint256(2 * amp + 1)) - amp;
                            jy = int256((rnd >> 64) % uint256(2 * amp + 1)) - amp;
                        }
                        xs[p] = x + (gx * h) / 100 + jx;
                        ys[p] = y + (gy * h) / 100 + jy;
                        ++p;
                    }
                }
                x += int256(((ZerovaGlyphs.width(gi) + GAP) * L.h) / 100);
            }
        }
        starts[k] = p;
    }

    /// @dev SVG path of the first `n` twelfths of the total ink length, in writing order.
    function _path(int256[] memory xs, int256[] memory ys, uint256[] memory starts, uint256 n)
        internal
        pure
        returns (string memory)
    {
        uint256 total;
        uint256 pens = starts.length - 1;
        for (uint256 s; s < pens; ++s) {
            for (uint256 i = starts[s] + 1; i < starts[s + 1]; ++i) {
                total += _len(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
            }
        }
        uint256 target = (total * n) / 12;
        bool all = n >= 12;
        bytes memory d;
        uint256 done;
        for (uint256 s; s < pens; ++s) {
            uint256 a = starts[s];
            uint256 b = starts[s + 1];
            if (!all && done >= target) break;
            d = abi.encodePacked(d, "M", _n(xs[a]), ",", _n(ys[a]));
            for (uint256 i = a + 1; i < b; ++i) {
                uint256 seg = _len(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
                if (!all && done + seg >= target) {
                    uint256 left = target - done;
                    int256 fx = xs[i - 1] + ((xs[i] - xs[i - 1]) * int256(left)) / int256(seg == 0 ? 1 : seg);
                    int256 fy = ys[i - 1] + ((ys[i] - ys[i - 1]) * int256(left)) / int256(seg == 0 ? 1 : seg);
                    d = abi.encodePacked(d, "L", _n(fx), ",", _n(fy));
                    done = target;
                    break;
                }
                done += seg;
                d = abi.encodePacked(d, "L", _n(xs[i]), ",", _n(ys[i]));
            }
        }
        return string(d);
    }

    // ---- svg parts ----------------------------------------------------------------------------------------

    function _head(Layout memory L, uint8 pig, string memory full) internal pure returns (bytes memory) {
        (, string memory ink, string memory wash,) = pigment(pig);
        uint256 widest = L.rowWidth[0] > L.rowWidth[1] ? L.rowWidth[0] : L.rowWidth[1];
        uint256 blockH = (L.h * (L.rows * 100 + (L.rows - 1) * ROW_GAP)) / 100;
        return abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250">',
            '<rect width="1000" height="1250" fill="#F7F1E6"/>',
            '<ellipse cx="500" cy="', (L.top + blockH / 2).toString(),
            '" rx="', ((widest * L.h) / 200 + L.h / 8).toString(),
            '" ry="', (blockH / 2 + L.h / 10).toString(), '" fill="', wash, '" fill-opacity=".22"/>',
            '<path d="', full, '" fill="none" stroke="', ink,
            '" stroke-opacity=".2" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>'
        );
    }

    function _ink(Layout memory L, uint8 gesture, uint8 pig, string memory ink) internal pure returns (bytes memory) {
        if (bytes(ink).length == 0) return "";
        Brush memory b = brush(gesture);
        (, string memory color,,) = pigment(pig);
        uint256 w = (b.width * L.h) / 1000;
        if (w < 3) w = 3;
        bytes memory skew = b.skew == 0 ? bytes("") : abi.encodePacked(' transform="skewX(', b.skew.toStringSigned(), ')" transform-origin="500 560"');
        bytes memory dry = bytes(b.dry).length == 0
            ? bytes("")
            : abi.encodePacked(
                '<path d="', ink, '" fill="none" stroke="#F7F1E6" stroke-opacity=".32" stroke-width="', (w / 7 + 1).toString(),
                '" stroke-dasharray="', b.dry, '" stroke-linecap="butt" stroke-linejoin="round"/>'
            );
        return abi.encodePacked(
            "<g", skew, ">",
            '<path d="', ink, '" fill="none" stroke="', color, '" stroke-opacity=".12" stroke-width="', (w + w / 3).toString(),
            '" stroke-linecap="', b.cap, '" stroke-linejoin="round"/>',
            '<path d="', ink, '" fill="none" stroke="', color, '" stroke-opacity=".93" stroke-width="', w.toString(),
            '" stroke-linecap="', b.cap, '" stroke-linejoin="round"/>',
            dry, "</g>"
        );
    }

    function _foot(uint256 id, string calldata name, string calldata symbol, uint8 strokes, bool sealed_, uint64 seed, uint8 pig)
        internal
        pure
        returns (bytes memory)
    {
        (, string memory ink,, string memory seal) = pigment(pig);
        bool same = keccak256(bytes(name)) == keccak256(bytes(symbol));
        return abi.encodePacked(
            sealed_ ? _seal(seed, seal) : bytes(""),
            '<text x="60" y="1146" font-family="serif" font-size="40" fill="', ink, '">', name,
            same ? "" : string(abi.encodePacked(" (", symbol, ")")), "</text>",
            '<text x="60" y="1198" font-family="sans-serif" font-size="26" fill="', ink, '" fill-opacity=".8">No. ', id.toString(), "</text>",
            '<text x="940" y="1198" text-anchor="end" font-family="sans-serif" font-size="26" fill="', ink, '" fill-opacity=".8">',
            uint256(strokes > 12 ? 12 : strokes).toString(), " of 12 strokes</text></svg>"
        );
    }

    function _seal(uint64 seed, string memory color) internal pure returns (bytes memory out) {
        out = abi.encodePacked(
            '<rect x="20" y="20" width="960" height="1210" fill="none" stroke="', color, '" stroke-width="3"/>',
            '<rect x="32" y="32" width="936" height="1186" fill="none" stroke="', color, '" stroke-width="1.5"/>',
            '<g transform="rotate(-4 800 1010)"><rect x="743" y="953" width="114" height="114" fill="none" stroke="', color, '" stroke-width="6"/>'
        );
        // four quadrant bits mirrored into a 4x4 grid of cells
        for (uint256 q; q < 4; ++q) {
            if ((seed >> q) & 1 == 0 && q != 0) continue;
            uint256 cx = q % 2;
            uint256 cy = q / 2;
            uint256[4] memory xs = [cx, 3 - cx, cx, 3 - cx];
            uint256[4] memory ys = [cy, cy, 3 - cy, 3 - cy];
            for (uint256 m; m < 4; ++m) {
                out = abi.encodePacked(
                    out, '<rect x="', (756 + xs[m] * 22).toString(), '" y="', (966 + ys[m] * 22).toString(),
                    '" width="19" height="19" fill="', color, '"/>'
                );
            }
        }
        out = abi.encodePacked(out, "</g>");
    }

    function _len(int256 dx, int256 dy) internal pure returns (uint256) {
        uint256 a = uint256(dx < 0 ? -dx : dx);
        uint256 b = uint256(dy < 0 ? -dy : dy);
        return Math.sqrt(a * a + b * b);
    }

    function _n(int256 v) internal pure returns (string memory) {
        return v.toStringSigned();
    }
}
