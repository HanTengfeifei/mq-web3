import * as sha from 'js-sha3';
import { Request } from '../core/request';
import { GenerateEd25519KeyPair, getCurrentDate, selectUrl } from '../utils';
import { savePublicKeyRequest } from '../api';
export class Register {
  appKey;

  constructor(appKey) {
    this.appKey = appKey || '';
  }
  static getEthAccount = async () => {
    let res = {
      address: '',
      balance: 0,
      shortAddress: '',
    };
    let reqParams = {
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    };
    // @ts-ignore
    const requestPermissionsRes = await wallet.request(reqParams).catch((e) => {
      console.log(e, 'e');
    });

    if (!requestPermissionsRes) {
      return res;
    }

    try {
      //@ts-ignore
      let address = await wallet.request({
        method: 'eth_accounts',
      });
      if (address && address.length > 0) {
        res.address = address[0];
        const strLength = address[0].length;
        res.shortAddress =
          address[0].substring(0, 5) + '...' + address[0].substring(strLength - 4, strLength);

        //@ts-ignore
        let balance = await wallet.request({
          method: 'eth_getBalance',
          params: [address[0], 'latest'],
        });
        if (balance) {
          let realMoney = balance.toString(10);
          res.balance = realMoney / 1000000000000000000;
        }
      }
    } catch (err) {
      console.log(err);
    }
    return res;
  };

  static signMetaMask = async (domainUrl, connectUrl) => {
    new Request(selectUrl('http', connectUrl));

    const { address } = await Register.getEthAccount();
    const { PrivateKey, PublicKey } = await GenerateEd25519KeyPair();
    const userid = `user:${PublicKey}`;
    const timestamp = Date.now();
    const wallet_type = 'eth';
    const NonceContent = sha.sha3_224(
      userid + address + wallet_type + PublicKey + timestamp.toString(),
    );
    // const NonceContent = userid + address + wallet_type + PublicKey + timestamp.toString();

    let signContent = `Web3MQ wants you to sign in with your Ethereum account:
    ${address}
    For Web3MQ registration
    URI: ${domainUrl}
    Version: 1
    Nonce: ${NonceContent}
    Issued At: ${getCurrentDate()}`;

    // @ts-ignore metamask signature
    const signature = await wallet.request({
      method: 'personal_sign',
      params: [signContent, address, 'web3mq'],
    });

    let payload = {
      userid: userid,
      pubkey: PublicKey,
      metamask_signature: signature,
      sign_content: signContent,
      wallet_address: address,
      wallet_type: 'eth',
      timestamp: timestamp,
      app_key: this.appKey,
    };
    console.log(payload, PrivateKey);
    let restest = null;
    try {
      restest = await savePublicKeyRequest(payload);
    } catch (e) {}

    // return { PrivateKey, PublicKey };
    return restest;
  };
}
