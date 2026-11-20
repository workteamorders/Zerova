// Local end-to-end test of the ZEROVA contracts against the real Uniswap V3 bytecode (npm @uniswap/v3-core 1.0.1,
// @uniswap/v3-periphery 1.4.4, @uniswap/swap-router-contracts 1.3.1). Nothing here touches a network.
// Run from contracts/: npm install && npm test
import { VM } from '@ethereumjs/vm';
import { Common, Chain, Hardfork } from '@ethereumjs/common';
import { Block } from '@ethereumjs/block';
import { Address, Account, hexToBytes, bytesToHex } from '@ethereumjs/util';
import { Interface, AbiCoder, keccak256, getCreate2Address, getAddress } from 'ethers';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..', '..');

const UNI = path.join(ROOT, 'node_modules', '@uniswap') + '/';
const ART = (p) => JSON.parse(fs.readFileSync(UNI + p));
const uf = ART('v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json');
const up = ART('v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');
const un = ART('v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');
const ur = ART('v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');
const ur2 = ART('swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json');

const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Paris });
const vm = await VM.create({ common, evmOpts: { allowUnlimitedContractSize: true } });
const coder = AbiCoder.defaultAbiCoder();
let T = 1_800_000_000n, NUM = 1n;
const blk = () => Block.fromBlockData({ header: { timestamp: T, number: NUM, gasLimit: 1_000_000_000n } }, { common });
const A = (h) => Address.fromString(h);
const ADDR = (n) => '0x' + n.toString(16).padStart(40, '0');
const deployer = ADDR(0xd0), alice = ADDR(0xa1), bob = ADDR(0xb0), carol = ADDR(0xc0), treasury = ADDR(0x7e), mallory = ADDR(0x66);
for (const a of [deployer, alice, bob, carol, mallory]) await vm.stateManager.putAccount(A(a), new Account(0n, 10n ** 24n));

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ok  ', msg) } else { fail++; console.log('  FAIL', msg) } }

async function deploy(from, bytecode, abi, args = []) {
  const data = bytecode + (args.length ? new Interface(abi).encodeDeploy(args).slice(2) : '');
  const acc = await vm.stateManager.getAccount(A(from)); const n0 = acc.nonce;
  const r = await vm.evm.runCall({ caller: A(from), data: hexToBytes(data), gasLimit: 900_000_000n, block: blk() });
  const acc2 = await vm.stateManager.getAccount(A(from)); if (acc2.nonce === n0) { acc2.nonce = n0 + 1n; await vm.stateManager.putAccount(A(from), acc2) }
  if (!r.createdAddress || r.execResult.exceptionError) throw new Error('deploy failed ' + (r.execResult.exceptionError && r.execResult.exceptionError.error));
  return r.createdAddress.toString();
}
// send: state-changing call. Returns {ok, ret, gas, err}
async function send(from, to, iface, fn, args = [], value = 0n) {
  const r = await vm.evm.runCall({ caller: A(from), to: A(to), data: hexToBytes(iface.encodeFunctionData(fn, args)), value, gasLimit: 900_000_000n, block: blk() });
  const ret = bytesToHex(r.execResult.returnValue);
  if (r.execResult.exceptionError) return { ok: false, ret, err: errName(ret) || r.execResult.exceptionError.error, gas: r.execResult.executionGasUsed };
  return { ok: true, ret, gas: r.execResult.executionGasUsed, res: iface.decodeFunctionResult(fn, ret), logs: r.execResult.logs || [] };
}
async function call(to, iface, fn, args = []) { const r = await send(deployer, to, iface, fn, args); if (!r.ok) throw new Error(fn + ' reverted: ' + r.err); return r.res }
const ERRS = {};
function errName(ret) { if (!ret || ret.length < 10) return ''; const s = ret.slice(0, 10); if (ERRS[s]) return ERRS[s];
  if (s === '0x08c379a0') { try { return 'Error(' + coder.decode(['string'], '0x' + ret.slice(10))[0] + ')' } catch (e) { } } return s }
function regErrs(abi) { for (const f of new Interface(abi).fragments) if (f.type === 'error') ERRS[keccak256(Buffer.from(f.format('sighash'))).slice(0, 10)] = f.name }
function mine(sec) { T += BigInt(sec); NUM += 1n }

// ---------- Uniswap V3 + WETH ----------
const BUILD = (...a) => { execSync(['node', path.join(HERE, 'build.js'), ...a].join(' '), { cwd: ROOT, stdio: 'pipe' }); return JSON.parse(fs.readFileSync(path.join(HERE, 'out.json'))) };
const Z1 = '0x0000000000000000000000000000000000000001';
let B = BUILD(Z1, Z1, Z1, Z1);
const weth = await deploy(deployer, B.WETH9.bytecode, B.WETH9.abi);
const v3f = await deploy(deployer, uf.bytecode, uf.abi);
const npm = await deploy(deployer, un.bytecode, un.abi, [v3f, weth, ADDR(0xdead)]);
const router = await deploy(deployer, ur.bytecode, ur.abi, [v3f, weth]);
const router02 = await deploy(deployer, ur2.bytecode, ur2.abi, [ADDR(0xdead), v3f, npm, weth]);
const iW = new Interface(B.WETH9.abi), iF3 = new Interface(uf.abi), iP = new Interface(up.abi), iN = new Interface(un.abi), iR = new Interface(ur.abi);
console.log('uniswap: factory', v3f, 'npm', npm, 'router', router, 'weth', weth);

// ---------- ZEROVA built against those addresses ----------
B = BUILD(getAddress(weth), getAddress(npm), getAddress(v3f), getAddress(router02));
for (const n of ['ZerovaFactory', 'ZerovaEnso', 'ZerovaToken', 'ZerovaRenderer']) regErrs(B[n].abi);
regErrs(uf.abi); regErrs(up.abi);
const iZ = new Interface(B.ZerovaFactory.abi), iE = new Interface(B.ZerovaEnso.abi), iT = new Interface(B.ZerovaToken.abi);
const START = -200400, SQ0 = 3527495286400058447893961n, SQ1 = 1779478419032190703672274283612071n;
const renderer = await deploy(deployer, B.ZerovaRenderer.bytecode, B.ZerovaRenderer.abi);
const factory = await deploy(deployer, B.ZerovaFactory.bytecode, B.ZerovaFactory.abi, [treasury, START, SQ0, SQ1, renderer, 'ZEROVA Enso', 'ENSO']);
const enso = (await call(factory, iZ, 'enso'))[0];
console.log('zerova: factory', factory, 'enso', enso);
const FEE = 5n * 10n ** 14n, SUPPLY = 10n ** 27n;
const rnd = () => '0x' + Buffer.from(Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))).toString('hex');

console.log('\n1. Input checks');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'TIDE', 0, 0, rnd()], 0n)).err === 'BadFee', 'no fee reverts BadFee');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'TIDE', 0, 0, rnd()], FEE + 1n)).err === 'BadFee', 'fee too high reverts BadFee');
ok((await send(alice, factory, iZ, 'launch', [' Tide', 'TIDE', 0, 0, rnd()], FEE)).err === 'BadName', 'leading space reverts BadName');
ok((await send(alice, factory, iZ, 'launch', ['Ti<de', 'TIDE', 0, 0, rnd()], FEE)).err === 'BadName', 'bad char reverts BadName');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'tide', 0, 0, rnd()], FEE)).err === 'BadSymbol', 'lowercase symbol reverts BadSymbol');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'T', 0, 0, rnd()], FEE)).err === 'BadSymbol', '1-char symbol reverts BadSymbol');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'ABCDEFGHI', 0, 0, rnd()], FEE)).err === 'BadSymbol', '9-char symbol reverts BadSymbol');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'TIDE', 8, 0, rnd()], FEE)).err === 'BadChoice', 'gesture 8 reverts BadChoice');
ok((await send(alice, factory, iZ, 'launch', ['Tide', 'TIDE', 0, 6, rnd()], FEE)).err === 'BadChoice', 'pigment 6 reverts BadChoice');

console.log('\n2. Launches in both token orders');
const L = {};
for (let k = 0; k < 40 && !(L[true] && L[false]); k++) {
  const r = await send(alice, factory, iZ, 'launch', ['Tide ' + k, 'T' + k, k % 8, k % 6, rnd()], FEE);
  if (!r.ok) { ok(false, 'launch reverted ' + r.err); break }
  const [id, token] = r.res; const isT0 = BigInt(token) < BigInt(weth);
  if (!L[isT0]) { L[isT0] = { id, token, gas: r.gas }; }
}
ok(!!L[true] && !!L[false], 'got a token0 launch and a token1 launch');
for (const isT0 of [true, false]) {
  const { id, token, gas } = L[isT0]; const tag = isT0 ? '[token0]' : '[token1]';
  const lo = (await call(factory, iZ, 'launchOf', [id]))[0]; const pool = lo.pool;
  const s0 = await call(pool, iP, 'slot0');
  ok(Number(s0.tick) === (isT0 ? START - 1 : -START), `${tag} pool tick ${s0.tick} as intended`);
  const pos = await call(npm, iN, 'positions', [lo.positionId]);
  ok(pos.liquidity > 0n, `${tag} position holds liquidity`);
  ok((await call(npm, iN, 'ownerOf', [lo.positionId]))[0].toLowerCase() === factory.toLowerCase(), `${tag} factory owns the position`);
  const left = (await call(token, iT, 'balanceOf', [factory]))[0];
  ok(left < SUPPLY / 100000n, `${tag} supply left in factory ${left} (below 0.001%)`);
  const inPool = (await call(token, iT, 'balanceOf', [pool]))[0];
  ok(inPool + left === SUPPLY, `${tag} the rest of the supply is in the pool`);
  ok((await call(token, iT, 'balanceOf', [alice]))[0] === 0n, `${tag} creator received no tokens`);
  const zs = await call(factory, iZ, 'zeroStandard', [token]);
  ok(zs.every(Boolean), `${tag} zeroStandard all true`);
  ok((await call(enso, iE, 'ownerOf', [id]))[0].toLowerCase() === alice, `${tag} Enso minted to the creator`);
  ok(Number((await call(enso, iE, 'strokes', [id]))[0]) === 0, `${tag} strokes 0 at launch`);
  ok(gas < 30_000_000n, `${tag} launch gas ${gas}`);
}
ok((await vm.stateManager.getAccount(A(factory))).balance > 0n, 'launch fees held by the factory');

console.log('\n3. Pool created in advance at another price (griefing)');
{
  const salt = rnd(); const count = (await call(factory, iZ, 'launchCount'))[0];
  const tokenInit = B.ZerovaToken.bytecode + new Interface(B.ZerovaToken.abi).encodeDeploy(['Grief', 'GRF', npm]).slice(2);
  const s2 = keccak256(coder.encode(['address', 'bytes32', 'uint256'], [bob, salt, count]));
  const predicted = getCreate2Address(factory, s2, keccak256(tokenInit));
  const [t0, t1] = BigInt(predicted) < BigInt(weth) ? [predicted, weth] : [weth, predicted];
  const cp = await send(mallory, v3f, iF3, 'createPool', [t0, t1, 10000]); const poolAddr = cp.res[0];
  await send(mallory, poolAddr, iP, 'initialize', [2n ** 96n]);
  const r1 = await send(bob, factory, iZ, 'launch', ['Grief', 'GRF', 0, 0, salt], FEE);
  ok(!r1.ok && r1.err === 'PoolPrice', 'launch to a pre-created pool reverts PoolPrice (' + r1.err + ')');
  const r2 = await send(bob, factory, iZ, 'launch', ['Grief', 'GRF', 0, 0, rnd()], FEE);
  ok(r2.ok, 'the same launch with a new salt succeeds');
  const r3 = await send(carol, factory, iZ, 'launch', ['Grief', 'GRF', 0, 0, salt], FEE);
  ok(r3.ok, 'another caller with the same salt gets a different address and succeeds');
}

console.log('\n4. Trading, wallet limit, strokes, seal');
async function freshLaunch(isT0) { for (let k = 0; k < 40; k++) { const r = await send(alice, factory, iZ, 'launch', ['Fresh', 'FRSH', 1, 2, rnd()], FEE);
    if (r.ok && (BigInt(r.res[1]) < BigInt(weth)) === isT0) return { id: r.res[0], token: r.res[1] } } throw new Error('no launch') }
for (const isT0 of [true, false]) {
  const { id, token } = await freshLaunch(isT0); const tag = isT0 ? '[token0]' : '[token1]';
  const lo = (await call(factory, iZ, 'launchOf', [id]))[0]; const pool = lo.pool;
  // launches happen at T; the wallet limit window is 600 s from token creation
  const buy = (who, eth) => send(who, router, iR, 'exactInputSingle', [{ tokenIn: weth, tokenOut: token, fee: 10000, recipient: who, deadline: T + 1000n, amountIn: eth, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n }], eth);
  mine(5);
  const b1 = await buy(bob, 10n ** 16n);
  ok(b1.ok, `${tag} small buy (0.01 ETH) works`);
  const bal1 = (await call(token, iT, 'balanceOf', [bob]))[0];
  ok(bal1 > 0n && bal1 < SUPPLY / 50n, `${tag} buyer got ${Number(bal1 / 10n ** 18n).toLocaleString()} tokens`);
  const b2 = await buy(carol, 5n * 10n ** 17n);
  ok(!b2.ok && /WalletLimit|Error/.test(b2.err), `${tag} buying past 2% in the first 10 minutes reverts (${b2.err})`);
  mine(600);
  const b3 = await buy(carol, 5n * 10n ** 17n);
  ok(b3.ok, `${tag} the same buy works after 10 minutes`);
  ok((await call(token, iT, 'balanceOf', [carol]))[0] > SUPPLY / 50n, `${tag} carol now holds more than 2%`);
  const st1 = Number((await call(enso, iE, 'strokes', [id]))[0]);
  ok(st1 > 0, `${tag} strokes after buys: ${st1}`);
  const sealEarly = await send(bob, enso, iE, 'seal', [id]);
  ok(!sealEarly.ok && sealEarly.err === 'NotComplete', `${tag} seal before completion reverts NotComplete`);
  // push the price to completion
  const b4 = await buy(carol, 60n * 10n ** 18n); ok(b4.ok, `${tag} large buy to completion`);
  const st2 = Number((await call(enso, iE, 'strokes', [id]))[0]); ok(st2 === 12, `${tag} strokes ${st2} of 12`);
  const sealNow = await send(bob, enso, iE, 'seal', [id]);
  ok(!sealNow.ok, `${tag} seal right after the jump reverts (10-minute average not there yet: ${sealNow.err})`);
  mine(601); await buy(bob, 10n ** 12n);
  const sealOk = await send(bob, enso, iE, 'seal', [id]);
  ok(sealOk.ok, `${tag} seal works after 10 minutes at completion`);
  ok((await send(bob, enso, iE, 'seal', [id])).err === 'AlreadySealed', `${tag} sealing twice reverts AlreadySealed`);
  const uri = (await call(enso, iE, 'tokenURI', [id]))[0];
  const j = JSON.parse(Buffer.from(uri.split(',')[1], 'base64').toString());
  const svg = Buffer.from(j.image.split(',')[1], 'base64').toString();
  ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && JSON.stringify(j.attributes).includes('Sealed'), `${tag} tokenURI is valid JSON with an SVG, sealed attribute present`);
  // sell back: price falls, strokes come off, seal stays
  const cb = (await call(token, iT, 'balanceOf', [carol]))[0];
  await send(carol, token, iT, 'approve', [router, cb]);
  const s1 = await send(carol, router, iR, 'exactInputSingle', [{ tokenIn: token, tokenOut: weth, fee: 10000, recipient: carol, deadline: T + 1000n, amountIn: cb, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n }]);
  ok(s1.ok, `${tag} selling works`);
  const st3 = Number((await call(enso, iE, 'strokes', [id]))[0]);
  ok(st3 < 12, `${tag} strokes after the sell: ${st3}`);
  ok((await call(enso, iE, 'info', [id])).sealed_ === true, `${tag} seal stays after the price falls`);

  console.log(`\n5. ${tag} pool fees`);
  const wb = async (a) => (await call(weth, iW, 'balanceOf', [a]))[0], tb = async (a) => (await call(token, iT, 'balanceOf', [a]))[0];
  const c0 = [await wb(alice), await tb(alice)], t0 = [await wb(treasury), await tb(treasury)];
  const cf = await send(mallory, factory, iZ, 'collectFees', [id]);
  ok(cf.ok, `${tag} anyone can call collectFees`);
  const dw = (await wb(alice)) - c0[0], dt = (await tb(alice)) - c0[1], tw = (await wb(treasury)) - t0[0], tt = (await tb(treasury)) - t0[1];
  ok(dw > 0n && dt > 0n, `${tag} creator received ${Number(dw) / 1e18} WETH and ${Number(dt / 10n ** 18n).toLocaleString()} tokens`);
  ok(dw * 3n / 7n - tw <= 1n && tw - dw * 3n / 7n <= 1n && (dt * 3n / 7n - tt) * 1000000n / (dt + 1n) <= 1n, `${tag} split is 70 / 30`);
  ok((await call(npm, iN, 'positions', [lo.positionId])).liquidity > 0n, `${tag} position liquidity untouched by collecting`);
}

console.log('\n6. Launch fees');
const fb = (await vm.stateManager.getAccount(A(factory))).balance, tb0 = (await vm.stateManager.getAccount(A(treasury)) || new Account()).balance;
const wl = await send(mallory, factory, iZ, 'withdrawLaunchFees');
ok(wl.ok, 'anyone can call withdrawLaunchFees');
const tb1 = (await vm.stateManager.getAccount(A(treasury))).balance;
ok(tb1 - tb0 === fb && fb === FEE * (await call(factory, iZ, 'launchCount'))[0], `treasury received ${Number(fb) / 1e18} ETH, exactly the fee of every launch`);

console.log('\n7. Factory and token cannot be changed');
ok((await send(mallory, L[true].token, iT, 'setPool', [mallory])).err === 'OnlyFactory', 'setPool cannot be called again');
ok((await send(mallory, enso, iE, 'mint', [mallory, 999, L[true].token, mallory, true, 0, 0, 1])).err === 'OnlyFactory', 'Enso mint is factory-only');
const fnames = new Interface(B.ZerovaFactory.abi).fragments.filter(f => f.type === 'function' && f.stateMutability !== 'view' && f.stateMutability !== 'pure').map(f => f.name).sort();
ok(JSON.stringify(fnames) === JSON.stringify(['collectFees', 'launch', 'withdrawLaunchFees']), 'factory state-changing functions: ' + fnames.join(', '));

console.log('\n8. Seal on a very busy pool (more than 64 trading blocks in 10 minutes)');
{
  mine(700); const { id, token } = await freshLaunch(true); mine(601);
  const buy = (who, eth) => send(who, router, iR, 'exactInputSingle', [{ tokenIn: weth, tokenOut: token, fee: 10000, recipient: who, deadline: T + 100000n, amountIn: eth, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n }], eth);
  ok((await buy(carol, 60n * 10n ** 18n)).ok, 'push to completion');
  let okc = 0; for (let i = 0; i < 70; i++) { mine(5); if ((await buy(bob, 2n * 10n ** 16n)).ok) okc++ }
  ok(okc === 70, '70 trades in 70 blocks, 5 seconds apart');
  const r = await send(bob, enso, iE, 'seal', [id]);
  ok(!r.ok, 'seal reverts while the 64-slot price history covers less than 10 minutes (' + r.err + ')');
  mine(620); await buy(bob, 10n ** 12n);
  const r2 = await send(bob, enso, iE, 'seal', [id]);
  ok(r2.ok, 'seal works after 10 calmer minutes (' + (r2.err || 'ok') + ')');
}

console.log('\n9. test/Fork.t.sol run locally (the same checks the fork run does on mainnet)');
{
  await vm.stateManager.putContractCode(A('0x7109709ECfa91a80626fF3989D68f67F5b1DD12D'), hexToBytes('0x00'));
  const iFT = new Interface(B.ForkTest.abi);
  for (const t of ['test_chainFacts', 'test_launchBothOrders', 'test_tradeAndCollect']) {
    const ft = await deploy(deployer, B.ForkTest.bytecode, B.ForkTest.abi);
    await vm.stateManager.putAccount(A(ft), new Account(0n, 10n ** 21n));
    const su = await send(deployer, ft, iFT, 'setUp');
    const r = su.ok ? await send(deployer, ft, iFT, t) : su;
    ok(r.ok, `ForkTest.${t}` + (r.ok ? '' : ' reverted: ' + r.err));
  }
  ok(!!B.Deploy, 'script/Deploy.s.sol compiles');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
