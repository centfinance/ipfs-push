import { query } from '../pools';
import { subgraphRequest } from '../../utils';

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/centfinance/cent-swap-kovan';

export const key = 'cent-exchange-kovan/pools';
// https://cloudflare-ipfs.com/ipns/cent-team-bucket.storage.fleek.co/cent-exchange-kovan/pools

export async function run() {
  const result = await subgraphRequest(subgraphUrl, query);
  return { pools: result._1.concat(result._2) };
}
