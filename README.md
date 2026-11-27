# ZEROVA

**The art launchpad on Robinhood Chain. Live on mainnet.**
Site: [zerova.tech](https://zerova.tech)

One token, one Enso, twelve strokes. Every coin launched on ZEROVA is an ERC-20 paired with an on-chain ERC-721 painting (an Enso) that is written in twelve strokes and follows the market price. Everything runs on top of Uniswap V3.

## Status

| | |
|---|---|
| Network | Robinhood Chain mainnet (chain ID 4663, `0x1237`) |
| Contracts | Deployed and in use on mainnet |
| Factory | `0x6ba4177da07d78fbec2676a7a315da4372eaa752` |
| Site | Production, served at `zerova.tech` |
| First launch | Made on mainnet and recorded in the demo video |

ZEROVA is production-ready. The contracts are final, the site is complete, and anyone can connect a wallet and launch a coin today.

## What makes it professional

- **Permissionless and ownerless.** No admin keys, no upgrade path, no pause, no blacklist, no tax. Selling and sending are never restricted.
- **Fixed supply.** 1,000,000,000 tokens per coin, all of it seeded into the pool at launch. The creator receives no tokens.
- **Locked liquidity.** The pool position is held by the factory and no function can withdraw or move it.
- **Immutable identity.** Name, symbol and painting cannot be changed after launch.
- **Transparent fees.** A launch costs exactly 0.0005 ETH plus gas. Creators receive 70% of collected pool fees, the treasury 30%.
- **Zero Standard checks.** Every launch is verified on-chain from its own page: launched here, code hash matches, supply fixed, position locked, fully seeded.
- **Tested.** 87 local tests against the real Uniswap V3 bytecode, plus fork tests against mainnet state.
- **Polished site.** Wallet discovery (EIP-6963), automatic switch to Robinhood Chain, a guided six-step studio, a live gallery, a collection view and fee collection for creators.

## Repository

| Path | Contents |
|---|---|
| `contracts/` | Solidity contracts (factory, token, Enso, renderer), tests, deploy script. See [`contracts/DEPLOY.md`](contracts/DEPLOY.md). |
| `design/concepts/sumi/` | The production site (single file, served by Vercel). |
| `docs/DEMO.md` | One-take demo script for a mainnet launch. |
| `docs/DECISIONS.md` | Research notes and design decisions. |
| `footage/` | Footage list for the intro video. |

## Run the tests

```bash
cd contracts
npm install
npm test                                              # local end-to-end, expect 87 passed
forge test --match-contract ForkTest \
  --fork-url https://rpc.mainnet.chain.robinhood.com  # read-only mainnet fork
```

## Notes

ZEROVA is an independent project. It is not affiliated with Robinhood. Nothing here is financial advice. The contracts are tested but have not had an external audit, and the site says so in plain words wherever it matters. Real ETH is at risk when you launch or trade.
