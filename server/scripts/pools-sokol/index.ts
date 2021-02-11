import { query } from '../pools';
import { subgraphRequest } from '../../utils';

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/centfinance/cent-swap-sokol';

export const key = 'cent-exchange-xdai/pools';
// https://cloudflare-ipfs.com/ipns/cent-team-bucket.storage.fleek.co/cent-exchange-sokol/pools

export async function run() {
  const result = await subgraphRequest(subgraphUrl, query);
  return { pools: result._1.concat(result._2) };
}
