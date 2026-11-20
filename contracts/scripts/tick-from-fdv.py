#!/usr/bin/env python3
"""Launch price for the ZerovaFactory constructor, computed offline.

Usage:  python3 scripts/tick-from-fdv.py <fully diluted value at launch, in ETH>
Example: python3 scripts/tick-from-fdv.py 2

Prints START_TICK (WETH per token, a multiple of 200, rounded down so the launch price is at most the FDV you
asked for) and the two initial pool prices:
  SQRT_PRICE_TOKEN0  just below the tick START_TICK   (the pool starts at tick START_TICK - 1)
  SQRT_PRICE_TOKEN1  just above the tick -START_TICK  (the pool starts at tick -START_TICK)
The factory checks the resulting pool tick at every launch, so wrong values make launches revert instead of
mispricing them. No network access; nothing is sent.
"""
import sys
from decimal import Decimal, getcontext, ROUND_FLOOR, ROUND_CEILING

getcontext().prec = 90
SUPPLY = Decimal(1_000_000_000)
SPACING = 200
RANGE = 69_200
COMPLETE = 27_800
MAX_TICK = 887_200
Q96 = Decimal(2) ** 96
EPS = Decimal("1e-15")


def sqrt_price(tick: int) -> Decimal:
    return (Decimal("1.0001") ** tick).sqrt() * Q96


def main() -> None:
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    fdv = Decimal(sys.argv[1])
    if fdv <= 0:
        sys.exit("FDV must be positive")
    price = fdv / SUPPLY  # ETH per token
    raw = (price.ln() / Decimal("1.0001").ln())
    tick = int((raw / SPACING).to_integral_value(rounding=ROUND_FLOOR)) * SPACING
    if not (-MAX_TICK <= tick and tick + RANGE <= MAX_TICK):
        sys.exit("tick out of range")
    p0 = int((sqrt_price(tick) * (1 - EPS)).to_integral_value(rounding=ROUND_FLOOR))
    p1 = int((sqrt_price(-tick) * (1 + EPS)).to_integral_value(rounding=ROUND_CEILING))
    if p0 >= 2 ** 160 or p1 >= 2 ** 160:
        sys.exit("price out of range")
    start_fdv = Decimal("1.0001") ** tick * SUPPLY
    print(f"START_TICK={tick}")
    print(f"SQRT_PRICE_TOKEN0={p0}")
    print(f"SQRT_PRICE_TOKEN1={p1}")
    print()
    print(f"# Launch FDV:        {start_fdv:.6f} ETH  (price {start_fdv / SUPPLY:.3E} ETH per token)")
    print(f"# Painting complete: {start_fdv * Decimal('1.0001') ** COMPLETE:.4f} ETH FDV  (x{Decimal('1.0001') ** COMPLETE:.2f})")
    print(f"# Liquidity range up to {start_fdv * Decimal('1.0001') ** RANGE:.2f} ETH FDV  (x{Decimal('1.0001') ** RANGE:.0f})")


if __name__ == "__main__":
    main()
