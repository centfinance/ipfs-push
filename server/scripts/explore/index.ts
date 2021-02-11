import { subgraphRequest } from "../../utils";

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/centfinance/cent-swap-xdai';

export const key = 'cent-pool-management/registry';
// https://cloudflare-ipfs.com/ipns/cent-team-bucket.storage.fleek.co/cent-pool-management/registry

const stablecoin = [
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', // WETH
  '0x44fA8E6f47987339850636F88629646662444217', // DAI
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // USDC
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'  // STAKE
].map(address => address.toLowerCase());

const defi = [
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', // WETH
  '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
  '0x4537e328Bf7e4eFA29D05CAeA260D7fE26af9D74'  // UNI
].map(address => address.toLowerCase());

function getTags(pool) {
  const tags: string[] = [];

  let isDefi = true;
  pool.tokens.forEach(token => {
    if (!defi.includes(token.address)) isDefi = false;
  });
  if (isDefi) tags.push('defi');

  let isStablecoin = true;
  pool.tokens.forEach(token => {
    if (!stablecoin.includes(token.address)) isStablecoin = false;
  });
  if (isStablecoin) tags.push('stablecoin');

  if (!pool.finalized && !pool.crp) tags.push('private');

  if (pool.crp) tags.push('smart-pool');

  return tags;
}

export const query = Object.fromEntries(['_1', '_2'].map(q => {
  return [q, {
    __aliasFor: 'pools',
    __args: {
      first: 1000,
      skip: q === '_2' ? 1000 : 0,
      orderBy: 'liquidity',
      orderDirection: 'desc',
      where: {
        publicSwap: true,
        active: true,
        tokensCount_gt: 1
      },
    },
    id: true,
    finalized: true,
    crp: true,
    tokens: {
      address: true,
      symbol: true,
      name: true
    },
    tokensList: true,
    totalSwapVolume: true,
    swaps: {
      __args: {
        first: 1,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      },
      poolTotalSwapVolume: true
    }
  }]
}));

export async function run() {
  const ts = Math.round(new Date().getTime() / 1000);
  const tsYesterday = ts - 24 * 3600;
  query._1.swaps.__args['where'] = { timestamp_lt: tsYesterday };
  query._2.swaps.__args['where'] = { timestamp_lt: tsYesterday };
  const result = await subgraphRequest(subgraphUrl, query);
  let pools = result._1.concat(result._2);
  return {
    pools: pools
      .map(pool => {
        pool.volume = 0;
        const poolTotalSwapVolume =
          pool.swaps && pool.swaps[0] && pool.swaps[0].poolTotalSwapVolume
            ? parseFloat(pool.swaps[0].poolTotalSwapVolume)
            : 0;
        pool.volume = parseFloat(pool.totalSwapVolume) - poolTotalSwapVolume;
        pool.tags = getTags(pool);
        return pool;
      })
      // .filter(pool => pool.volume > 0)
      .map(pool => ({
        address: pool.id,
        tokens: pool.tokensList,
        volume: pool.volume,
        tags: pool.tags.length > 0 ? pool.tags : undefined
      }))
  };
}
