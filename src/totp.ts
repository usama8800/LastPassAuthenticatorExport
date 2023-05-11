import console from "console";
import { existsSync, readFileSync } from "fs";
import { emptyDirSync } from "fs-extra";
import QRCode from 'qrcode';

interface Account {
  "accountID": string
  "lmiUserId": string
  "issuerName": string
  "originalIssuerName": string
  "userName": string
  "originalUserName": string
  "pushNotification": boolean,
  "secret": string
  "timeStep": number,
  "digits": number,
  "algorithm": string
}

function readJSONFile<T = any>(path: string): T {
  if (!existsSync(path)) {
    console.log('lastpass.json not found');
    process.exit(1);
  }
  const file = readFileSync(path, 'utf8');
  if (file === '') {
    console.log('lastpass.json empty');
    process.exit(1);
  }
  return JSON.parse(file) as T;
}

function getLabel(account: Account) {
  if (account.issuerName && account.userName) {
    return `${account.issuerName}:${account.userName}`
  } else {
    return `${account.userName}`
  }
}

function otpUrl(account: Account) {
  let url = `otpauth://totp/${getLabel(account)}?secret=${account.secret}`;
  if (account.algorithm)
    url += '&algorithm=' + account.algorithm;
  if (account.digits)
    url += '&digits=' + account.digits;
  if (account.timeStep)
    url += '&period=' + account.timeStep;
  return url;
}

function main() {
  const data: { accounts: Account[] } = readJSONFile('lastpass.json');
  if (!data.accounts) {
    console.log('Invalid lastpass.json file');
    process.exit(1);
  }
  emptyDirSync('qrs');
  for (let account of data.accounts) {
    const url = otpUrl(account);
    QRCode.toFile(`qrs/${account.issuerName || account.userName}.png`, url);
  }
}

main();
