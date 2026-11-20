# Deploying ZEROVA to Robinhood Chain (chain 4663)

You deploy. Nobody else holds your key. Use a Foundry keystore (`cast wallet import`) or a hardware wallet.
These contracts have **not been tested and not been audited**. Real ETH is at risk. Do one small launch yourself
before you announce anything.

## 0. Requirements
- Foundry (`forge`, `cast`), Node.js, Python 3.
- ETH on Robinhood Chain in the deployer wallet for gas.
- A treasury address you control. It receives the 0.0005 ETH launch fees and 30% of pool fees. It cannot be changed later.

```bash
cd contracts
npm install                      # OpenZeppelin Contracts 5.1.0
forge build
export RPC=https://rpc.mainnet.chain.robinhood.com
```

## 1. Check the chain facts the contracts rely on (read-only)
```bash
cast chain-id --rpc-url $RPC                                                         # 4663
cast call 0x1f7d7550B1b028f7571E69A784071F0205FD2EfA "feeAmountTickSpacing(uint24)(int24)" 10000 --rpc-url $RPC   # 200
cast call 0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3 "factory()(address)" --rpc-url $RPC   # 0x1f7d7550...2EfA
cast call 0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3 "WETH9()(address)" --rpc-url $RPC     # 0x0Bd7D308...cAD73
```
If any answer differs, stop. The addresses are constants in `src/ZerovaFactory.sol`.

## 2. Choose the launch price
```bash
python3 scripts/tick-from-fdv.py 2      # fully diluted value at launch, in ETH
```
It prints `START_TICK`, `SQRT_PRICE_TOKEN0` and `SQRT_PRICE_TOKEN1`, plus where the painting completes (x16)
and where the liquidity range ends (x1012). These are fixed for every launch of this factory.

## 3. Deploy the renderer
```bash
forge create src/ZerovaRenderer.sol:ZerovaRenderer --rpc-url $RPC --account <your-keystore> --broadcast
```
Note the "Deployed to" address as RENDERER.

## 4. Deploy the factory (it deploys the Enso NFT contract itself)
Write the arguments to a file, one line, in this order (the start tick is negative, a file avoids it being read as a flag):
```bash
echo '<TREASURY> <START_TICK> <SQRT_PRICE_TOKEN0> <SQRT_PRICE_TOKEN1> <RENDERER> "ZEROVA Enso" "ENSO"' > constructor-args.txt
forge create src/ZerovaFactory.sol:ZerovaFactory --rpc-url $RPC --account <your-keystore> --broadcast \
  --constructor-args-path constructor-args.txt
```
Note the address as FACTORY. Then:
```bash
cast call <FACTORY> "enso()(address)" --rpc-url $RPC
cast call <FACTORY> "startTick()(int24)" --rpc-url $RPC
cast call <FACTORY> "treasury()(address)" --rpc-url $RPC
```

## 5. Verify the source (optional, recommended)
Blockscout verification flags for mainnet are not confirmed in the docs read so far. Try:
```bash
forge verify-contract <ADDRESS> src/ZerovaFactory.sol:ZerovaFactory --verifier blockscout \
  --verifier-url https://robinhoodchain.blockscout.com/api/ --rpc-url $RPC --guess-constructor-args
```

## 6. Open launching on the site
In `design/concepts/sumi/index.html` set `var FACTORY='<FACTORY>';`, commit and push. The Studio then
simulates each launch, sends it through the visitor's wallet, and shows the token, pool and Enso.

## After launch
- Pool fees: anyone may call `collectFees(id)`; 70% goes to the coin's creator, 30% to the treasury.
- Launch fees: anyone may call `withdrawLaunchFees()`; the ETH goes only to the treasury.
- Seal: anyone may call `seal(id)` on the Enso contract once the 10-minute average price has reached completion.
