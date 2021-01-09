import { subgraphRequest } from '../../utils';

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/centfinance/cent-swap-kovan';

export const key = 'cent-exchange-kovan/pools';
// https://cloudflare-ipfs.com/ipns/cent-team-bucket.storage.fleek.co/cent-exchange/pools

export const query = Object.fromEntries(['_1', '_2'].map(q => {
  return [q, {
    __aliasFor: 'pools',
    __args: {
      first: 1000,
      skip: q === '_2' ? 1000 : 0,
      where: {
        publicSwap: true,
        active: true,
        tokensCount_gt: 1
      }
    },
    id: true,
    swapFee: true,
    totalWeight: true,
    tokens: {
      address: true,
      balance: true,
      decimals: true,
      denormWeight: true
    },
    tokensList: true
  }]
}));

export async function run() {
  const result = await subgraphRequest(subgraphUrl, query);
  return { pools: result._1.concat(result._2) };
}
