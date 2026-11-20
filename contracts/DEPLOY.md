# Deploying ZEROVA to Robinhood Chain (chain 4663)

You deploy. Nobody else holds your key. Use a Foundry keystore (`cast wallet import`) or a hardware wallet.
The contracts have no owner and no upgrade path: once deployed, nothing in them can be changed or fixed.
They are tested (below) but **not externally audited**. Real ETH is at risk.

## 0. Requirements
- Foundry (`forge`, `cast`), Node.js 20 or newer, Python 3.
- ETH on Robinhood Chain in the deployer wallet for gas.
- A treasury address you control. It receives the 0.0005 ETH launch fees and 30% of pool fees. It cannot be changed later.

```bash
cd contracts
npm install
forge build
export RPC=https://rpc.mainnet.chain.robinhood.com
```

## 1. Local end-to-end test (no network)
```bash
npm test
```
Runs the contracts against the real Uniswap V3 bytecode (`@uniswap/v3-core` 1.0.1, `@uniswap/v3-periphery` 1.4.4,
`@uniswap/swap-router-contracts` 1.3.1) in a local EVM. It checks input rules, launches in both token orders, a pool
created in advance by someone else, buying and selling, the 2% wallet limit for 10 minutes, strokes, seal (including a
very busy pool), the 70 / 30 fee split, launch fees, and runs `test/Fork.t.sol` too. Expect `87 passed, 0 failed`.

## 2. Fork test against mainnet state (read-only, nothing is sent)
```bash
forge test --match-contract ForkTest --fork-url $RPC -vv
```
Deploys the contracts inside a local copy of the chain and checks the real Uniswap factory, position manager,
SwapRouter02 and WETH: launches in both token orders, a buy and a sell, fee collection, the Enso image.
Expect 3 tests passed. If anything fails, stop.

## 3. Choose the launch price
```bash
python3 scripts/tick-from-fdv.py 2      # fully diluted value at launch, in ETH
```
It prints `START_TICK`, `SQRT_PRICE_TOKEN0` and `SQRT_PRICE_TOKEN1`, plus where the painting completes (x16)
and where the liquidity range ends (x1012). These are fixed for every launch of this factory.

## 4. Dry run, then deploy
```bash
export TREASURY=0x...            # your treasury address
export START_TICK=...            # from step 3
export SQRT_PRICE_TOKEN0=...
export SQRT_PRICE_TOKEN1=...

# dry run: simulates against mainnet, sends nothing
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --account <your-keystore> --sender <your-address>

# deploy: the same command with --broadcast
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --account <your-keystore> --sender <your-address> --broadcast
```
The script refuses to run on any chain but 4663, re-checks the Uniswap and WETH facts, deploys the renderer and the
factory (the factory deploys the Enso contract), and prints the three addresses under `== Return ==`.
Note them as RENDERER, FACTORY and ENSO.

## 5. Check the deployment (read-only)
```bash
cast call $FACTORY "treasury()(address)"    --rpc-url $RPC   # your treasury
cast call $FACTORY "startTick()(int24)"     --rpc-url $RPC   # START_TICK
cast call $FACTORY "enso()(address)"        --rpc-url $RPC   # ENSO
cast call $FACTORY "launchCount()(uint256)" --rpc-url $RPC   # 0
```

## 6. Verify the source on Blockscout (recommended)
```bash
forge verify-contract $RENDERER src/ZerovaRenderer.sol:ZerovaRenderer --verifier blockscout \
  --verifier-url https://robinhoodchain.blockscout.com/api/ --rpc-url $RPC
forge verify-contract $FACTORY src/ZerovaFactory.sol:ZerovaFactory --verifier blockscout \
  --verifier-url https://robinhoodchain.blockscout.com/api/ --rpc-url $RPC --guess-constructor-args
forge verify-contract $ENSO src/ZerovaEnso.sol:ZerovaEnso --verifier blockscout \
  --verifier-url https://robinhoodchain.blockscout.com/api/ --rpc-url $RPC --guess-constructor-args
```

## 7. Open launching on the site
In `design/concepts/sumi/index.html` set `var FACTORY='<FACTORY>';`. Optionally set `SOCIAL.x` to the project's
X profile. Commit and push; Vercel publishes it.

## 8. Smoke test before announcing
1. Open the site, connect your own wallet, launch one coin. The fee is 0.0005 ETH plus gas (a launch uses about
   7.5 million gas: token, pool, price history slots, position and Enso).
2. The ticker shows it within 30 seconds; the coin sheet shows the Enso and five Zero Standard checks as true.
3. Collection shows the Enso under My Enso and the coin under My Launches.
4. If the ticker stays empty while no wallet is connected, the public RPC refuses reads from browsers.
   With a wallet connected, the site reads through the wallet instead.

## After launch
- Pool fees: anyone may call `collectFees(id)`; 70% goes to the coin's creator, 30% to the treasury.
- Launch fees: anyone may call `withdrawLaunchFees()`; the ETH goes only to the treasury.
- Seal: anyone may call `seal(id)` on the Enso contract once the 10-minute average price has reached completion.
  The pool keeps 64 price history slots. If a coin trades in more than 64 blocks within 10 minutes, the history is
  shorter than 10 minutes and sealing waits for calmer trading. Anyone can add slots on the pool with
  `increaseObservationCardinalityNext`.
- A launch whose pool already exists at another price reverts with `PoolPrice`; sending it again uses a new random
  salt and so a new token address. The site does this on each attempt.
