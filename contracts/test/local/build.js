// Test build for test/local/run.mjs. Same sources; the Robinhood Chain addresses are swapped for the local
// deployments given as arguments. Usage: node test/local/build.js <WETH> <NPM> <V3_FACTORY> <ROUTER02>
const solc = require('solc'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const [, , WETH, NPM, V3F, R02] = process.argv;
const REAL = { WETH: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', NPM: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', V3F: '0x1f7d7550B1b028f7571E69A784071F0205FD2EfA', R02: '0xCaf681a66D020601342297493863E78C959E5cb2' };
const LOCAL = { WETH, NPM, V3F, R02 };
function swap(c) { for (const k of Object.keys(REAL)) c = c.split(REAL[k]).join(LOCAL[k]); return c.replace('block.chainid == 4663', 'block.chainid == 1') }
const files = ['src/ZerovaToken.sol', 'src/ZerovaFactory.sol', 'src/ZerovaEnso.sol', 'src/ZerovaRenderer.sol', 'src/ZerovaGlyphs.sol', 'src/interfaces/IUniswapV3.sol', 'test/Fork.t.sol', 'script/Deploy.s.sol', 'test/local/WETH9.sol'];
const sources = {};
for (const f of files) { let c = fs.readFileSync(path.join(ROOT, f), 'utf8'); if (f === 'src/ZerovaFactory.sol' || f === 'test/Fork.t.sol') { const a = c; c = swap(c); if (c === a) throw new Error('no address swapped in ' + f) } sources[f] = { content: c } }
function findImports(p) { for (const c of [path.join(ROOT, 'node_modules', p), path.join(ROOT, p)]) if (fs.existsSync(c)) return { contents: fs.readFileSync(c, 'utf8') }; return { error: 'not found ' + p } }
const input = { language: 'Solidity', sources, settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true, evmVersion: 'paris', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } } };
const out = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
let err = false; (out.errors || []).forEach(e => { if (e.severity === 'error') { err = true; console.error(e.formattedMessage) } }); if (err) process.exit(1);
const res = {}; for (const f of Object.keys(out.contracts)) for (const [n, c] of Object.entries(out.contracts[f])) if (c.evm.bytecode.object.length > 2) res[n] = { abi: c.abi, bytecode: '0x' + c.evm.bytecode.object };
fs.writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(res)); console.log('built', Object.keys(res).join(' '));
