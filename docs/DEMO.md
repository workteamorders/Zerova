# Demo script: ZEROVA on Robinhood Chain (one take)

Site: `zerova-one.vercel.app`. Network: Robinhood Chain mainnet (chain 4663).
The take makes one real launch: 0.0005 ETH plus gas, signed in your own wallet.

## Before you press record

- Record on the Mac that has the `/etc/hosts` line for `rpc.mainnet.chain.robinhood.com` (or run WARP). Without it the Gallery cannot read the chain.
- Wallet holds at least 0.002 ETH on Robinhood Chain. Wallet is unlocked and disconnected from the site.
- Pick a symbol that is yours to use: not a brand, not another coin's name. Example: `ZTEST`.
- Hard refresh the page (Cmd+Shift+R), window about 1440 px wide, notifications off.
- Do not open the wallet's "show private key" screens or any `.env` file while recording.

## Recording scenes (one take)

1. **Open.** Go to `zerova-one.vercel.app`. Let the animated Z settle, move the pointer over it, click it once so it is rewritten.
2. **How it works.** Scroll slowly past "One painting, four states" (0%, 50%, 100%, Sealed) and "How a launch works". Labels marked EXAMPLE are illustrations.
3. **Gallery.** Scroll to the Gallery. It is empty because no coin has launched yet. Say that this take launches the first one.
4. **Contracts.** Scroll to Contracts. Show the Factory, Enso, Renderer and Treasury rows and the line "No external audit yet". Click the Factory link and show the code page on Blockscout, then come back.
5. **Connect.** Click Connect Wallet, choose your wallet in the list, approve. Show the short address in the header. If the button says Wrong network, click it and approve the switch to Robinhood Chain.
6. **Studio, step 1.** Click Launch a Coin. Type the symbol and click Write it.
7. **Studio, step 2.** Watch the 12 strokes write the symbol. Click Next: gesture.
8. **Gesture and pigment.** Click two or three gestures to show the brush changing, choose one, click Next: pigment. Pick a pigment, click Next: preview.
9. **Preview.** Click 0%, 50%, 100% and Complete, then Next: review.
10. **Review and sign.** Scroll the lines slowly: launch fee exactly 0.0005 ETH, the lines that are zero on purpose, the names warning. Tick the box (it says there is no external audit yet). Click Launch.
11. **Confirm.** The page simulates the launch first, then the wallet opens. Show it: 0.0005 ETH plus gas, to the ZEROVA factory. Confirm and wait.
12. **Live.** On "is live" show the painting read from the contract. Click the Token link and show it on Blockscout, then the Transaction link. Come back and close the flow.
13. **Gallery and coin page.** The new coin is in the Gallery (refresh runs every 30 seconds; reload if needed). Open it: the painting, its progress at 0/12, the Zero Standard checks.
14. **Collection.** Open the wallet menu, choose Collection. My Enso shows the new Enso with Seal disabled until 12/12. Switch to My Launches and show the uncollected fees (zero for now). Do not press Collect fees.
15. **Search.** Press Cmd+K, type the symbol, open the result.
16. **Disconnect.** Open the wallet menu, click Disconnect, and show the public view again.

## Words to avoid in the voice-over

No promises about price or returns. Say that strokes follow the market price and that the painting can lose strokes. Say that the contracts are not externally audited. Do not call the coin an opportunity of any kind.

## If something goes wrong

- Gallery or Contracts empty: RPC unreachable. Check the hosts line or turn on WARP, reload.
- Button says "Not enough ETH": the wallet needs 0.0005 ETH plus gas on Robinhood Chain.
- "Press launch again" message: the pool for that token address existed at another price. Press Launch again, each attempt uses a new address.
- Wallet does not open: unlock it, then click Launch again.
