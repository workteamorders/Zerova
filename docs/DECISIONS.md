# ZEROVA: DECISIONS

Tanggal catatan: 2026-11-18. Penyangkalan antarmuka di situs tidak menggantikan tinjauan hukum.

## 1. Keputusan pemilik (konteks, bukan fakta yang diverifikasi sesi ini)

- Launchpad di Robinhood Chain dengan kontrak sendiri di atas Uniswap V3; tidak berintegrasi dengan Pons.
  Alasan dari riset sesi sebelumnya: dokumentasi Pons menyebut launch berupa pool V3 berpasangan WETH dengan LP terkunci
  dan tidak mendokumentasikan fungsi create untuk pihak ketiga. Pada 2026-11-18 halaman https://docs.ponsfamily.com
  dibaca ulang: memang tidak ada API/SDK resmi dan tidak ada fungsi launch untuk integrator. Konsisten dengan alasan di atas.
- "Backend sama persis seperti Theorem" tidak mungkin di EVM; hanya POLA arsitektur situs yang dipakai ulang.
- Tidak ada: bagi hasil pemegang, reward, buyback, staking, whitelist, alokasi kreator/tim, pembelian awal, admin, proxy, upgrade.

## 2. Gerbang X: status per 2026-11-18

Batasan sesi ini yang memengaruhi hasil:
- Egress dari sandbox memblokir semua host RPC Robinhood Chain (HTTP 403 dari proxy pada CONNECT ke
  rpc.mainnet.chain.robinhood.com dan rpc.testnet.chain.robinhood.com). Tidak dicari jalan lain. Akibatnya TIDAK ADA
  pembacaan on-chain yang berhasil di sesi ini.
- Blockscout (robinhoodchain.blockscout.com/api/v2/...) tidak dapat diambil lewat WebFetch (client_error).
- forge, anvil, cast, pnpm, slither, aderyn TIDAK terpasang di shell perangkat (Linux VM; node v22.23.4, npm 10.9.9, python 3.10.12, git 2.34.1 ada).
  Menurut aturan kerja, forge tidak dipasang otomatis. ~/.foundry ada di Mac pemilik tetapi tidak terjangkau dari VM ini.

| Butir | Status | Bukti / catatan |
|---|---|---|
| a. Kode ada di tiap alamat (eth_getCode) | BELUM TERVERIFIKASI | RPC diblokir. |
| a. positionManager.factory() == V3 Factory | BELUM TERVERIFIKASI | idem |
| a. positionManager.WETH9() == WETH | BELUM TERVERIFIKASI | idem |
| a. feeAmountTickSpacing(10000) == 200 | BELUM TERVERIFIKASI | idem. Bila gagal: tingkat fee berikutnya, hitung ulang spacing, RANGE_TICKS, COMPLETE_TICKS. |
| a. Jenis router | Dokumen: SwapRouter02 | Halaman resmi Uniswap menaut ke @uniswap/swap-router-contracts v1.1.0 dan tidak mencantumkan SwapRouter lama. SwapRouter02 tidak punya deadline di struct; deadline lewat multicall(deadline, data[]). Konfirmasi on-chain tetap wajib. |
| a. QuoterV2, Multicall3 | Dokumen: QuoterV2 ada; Multicall3 tidak dicantumkan | Uniswap mencantumkan UniswapInterfaceMulticall 0x282a3c4d320cc7f0d5eaf56b8029e4b88338f0a3, bukan Multicall3. |
| Alamat mainnet V3 | Cocok dengan dokumentasi resmi Uniswap | developers.uniswap.org/docs/protocols/v3/deployments/v3-robinhood-chain-deployments (chainId 4663): Factory 0x1f7d7550...2EfA, NonfungiblePositionManager 0x73991a25...E0D3, SwapRouter02 0xcaf681a6...5cb2, QuoterV2 0x33e885eD...A9E7 sama dengan alamat dari dokumentasi Pons. Ini dokumentasi, bukan bukti on-chain. |
| Alamat WETH mainnet | Cocok di dua dokumentasi | 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73 tercantum di docs.robinhood.com/chain/contracts dan docs.ponsfamily.com. Halaman Robinhood tidak menyebut jaringannya; Uniswap tidak mencantumkan WETH. |
| Deployment resmi V3 lain / V4 | Dicatat | Uniswap melaporkan V2, V3, V4, UniswapX, UniversalRouter dan Permit2 aktif di chain 4663. Proyek tetap memakai V3. |
| Testnet (46630): V3 | TIDAK DITEMUKAN | Halaman resmi Uniswap hanya mendaftar mainnet; "No testnet deployment is listed". Jangan menyalin alamat mainnet. Per aturan keputusan: kontrak, spesifikasi, dan situs dikerjakan terhadap antarmuka + mock berlabel; V3 testnet harus diperiksa pemilik/di sesi dengan akses RPC. |
| Testnet WETH | KONFLIK DOKUMENTASI | Satu cuplikan pencarian atas docs.robinhood.com/chain/contracts menampilkan kolom "Robinhood Chain Testnet" dengan WETH 0x7943e237c7F95DA44E0301572D358911207852Fa; pengambilan penuh halaman yang sama menampilkan satu kolom dengan WETH 0x0Bd7D308... dan USDG 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168. Tidak dapat disimpulkan mana yang berlaku untuk jaringan mana. Diselesaikan hanya lewat pembacaan on-chain. |

b. Parameter chain:
- Chain ID mainnet 4663 (0x1237), testnet 46630: konsisten di dokumentasi Bitquery, Chainstack, Alchemy, OrbitFlare, GetBlock, BitGo dan QuickNode. Alchemy menaut ke dokumentasi resmi sebagai sumbernya; halaman resmi Robinhood yang berhasil dibaca tidak memuat angkanya langsung (halaman /chain/connecting belum dibaca).
- RPC publik: https://rpc.mainnet.chain.robinhood.com dan https://rpc.testnet.chain.robinhood.com (terbatas laju, tidak dianjurkan untuk produksi; Alchemy direkomendasikan Robinhood).
- Explorer: testnet explorer.testnet.chain.robinhood.com (konsisten). MAINNET: robinhoodchain.blockscout.com (Bitquery, Pons, OrbitFlare, QuickNode) vs robinscan.io (Chainstack). SELISIH; situs memakai robinhoodchain.blockscout.com sebagai default via config sampai pemilik memutuskan.
- Flag verifikasi forge testnet (dokumentasi resmi): --verifier-url https://explorer.testnet.chain.robinhood.com/api/ . Untuk mainnet: BELUM DIVERIFIKASI.
- Stack: Arbitrum Orbit/Nitro, gas ETH. Urutan transaksi first-come first-served di sequencer; tidak ada priority gas auction.
- block.number mengembalikan PERKIRAAN nomor blok L1, bukan blok L2 (docs.robinhood.com/chain/differences-from-ethereum). Kontrak ZEROVA tidak boleh memakai block.number; hanya block.timestamp.
- block.timestamp: halaman resmi tersebut TIDAK membahasnya. Semantik waktu dinding di Robinhood Chain BELUM DIVERIFIKASI (Fakta 6). Konsekuensi: LIMIT_WINDOW tetap dianggap bergantung pada asumsi ini sampai diuji di testnet.
- Batas ukuran kontrak: kode 96 KB, init code 192 KB (dokumentasi resmi). Batas ini jauh di atas 24 KB Ethereum; tetap target Renderer sederhana.
- Sequencer mengecualikan transaksi yang terkait alamat bersanksi (dokumentasi resmi); dicatat sebagai risiko antarmuka/hukum.
- Versi EVM (PUSH0), batas gas eth_call, Multicall3: BELUM DIVERIFIKASI. Keputusan sementara: evm_version konservatif ("paris") sampai diuji.

c. Tampilan di explorer/marketplace: BELUM DIVERIFIKASI (butuh peluncuran uji; tidak boleh menyiarkan transaksi dari sesi ini). Cadangan visual tanpa teks bebas tetap disiapkan sesuai spesifikasi.
d. Pustaka: belum dikunci; belum ada kode. Lisensi V3 core: BUSL-1.1 dengan Change License GPL-2.0-or-later pada Change Date "paling awal 2023-04-01 atau tanggal di v3-core-license-date.uniswap.eth" (LICENSE repo, dibaca 2026-11-18); halaman itu tidak menyatakan apakah Change Date sudah lewat dan tanggal ENS-nya tidak dibaca. Keputusan: hanya MEMANGGIL kontrak yang sudah dideploy; antarmuka V3 ditulis sendiri (minimal) dan matematika tick ditulis ulang sendiri, bukan disalin; periksa ulang sebelum menyalin berkas V3 apa pun.
e. Fork anvil: TIDAK DAPAT DIUJI (RPC diblokir dan anvil tidak terpasang). Cadangan: uji dengan mock V3 berlabel; semua yang hanya diuji dengan mock dilaporkan terpisah.

Aturan keputusan diterapkan: V3 mainnet tercantum resmi sehingga desain TIDAK diganti; V3 testnet tidak tercantum sehingga pengujian terhadap V3 asli di testnet belum tersedia dan tidak diasumsikan.

## 3. Hosting
Cloudflare Pages Free: 500 build/bulan, 20.000 file/situs, aset maks 25 MiB, panggilan Functions dihitung ke kuota Workers (halaman limits tidak memberi angka harian Free dan tidak menyebut penggunaan komersial). Syarat layanan Cloudflare BELUM DIBACA; pemilik wajib membaca sebelum produksi. Vercel Hobby tidak dipakai (larangan penggunaan komersial).

## 4. Merek
ZEROVA hanya boleh ada di config/brand.ts. Registri pihak ketiga melaporkan merek terdaftar bernama sama (Reg #7312420, Class 9, belum dikonfirmasi ke USPTO). Tidak ada penilaian aman/tidak aman. Daftar langkah manual pemilik: izin penggunaan nama oleh konsultan merek dan satu nama cadangan.

## 5. Aturan kunci dan siaran
Sesi ini tidak memegang kunci dan tidak menyiarkan transaksi. Tidak ada transaksi yang dikirim; pembacaan RPC bahkan tidak tersambung.

## 6. Sumber yang dibaca
- docs.ponsfamily.com; developers.uniswap.org (V3 Robinhood Chain deployments); docs.robinhood.com/chain (index, contracts, protocol-contracts, differences-from-ethereum, deploy-smart-contracts); docs.bitquery.io (chain ID); github.com/Uniswap/v3-core LICENSE; developers.cloudflare.com/pages/platform/limits.

## Owner override of visual rules (2026-11-20)

The owner chose the "Sumi" home page from a reference image and asked for it to match exactly, including elements the original spec forbids:

- red sun discs and misty mountains (spec: no kitsch "zen" such as mountains or sun),
- a kanji seal 円 (spec: no pseudo-kanji or fake calligraphy; 円 is a real character, used as decoration),
- numbered sections "01 / 02 / 03" (spec: do not copy the Quanta Pools look, including numbered sections).

The owner was told these conflict with the spec and chose to use them anyway. These three rules no longer apply to the home page. All other spec rules stand, including the banned-copy list and the footer disclaimers.

Also decided: the hero shows a brand ink circle (black and red); each coin's own painting is its symbol written in 12 strokes (option B).
