import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';

const PROXY = 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824';

/**
 * Downloads a file using the SOCKS5 proxy
 * @param {string} url - The URL to download from
 * @returns {Promise<Buffer>} - The downloaded file buffer
 */
async function downloadWithProxy(url) {
  const agent = new SocksProxyAgent(PROXY);
  const response = await fetch(url, { agent });
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export default downloadWithProxy;

