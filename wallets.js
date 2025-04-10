const StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');

// Use Horizon.Server instead of just Server
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Generate keypairs
const creatorKeypair = StellarSdk.Keypair.random();
const fanKeypair = StellarSdk.Keypair.random();

async function fundAccounts() {
  // Log the keys
  console.log('Creator Public Key:', creatorKeypair.publicKey());
  console.log('Creator Secret Key:', creatorKeypair.secret());
  console.log('Fan Public Key:', fanKeypair.publicKey());
  console.log('Fan Secret Key:', fanKeypair.secret());

  // Fund both accounts using Friendbot
  const friendbotUrlCreator = `https://friendbot.stellar.org?addr=${creatorKeypair.publicKey()}`;
  const friendbotUrlFan = `https://friendbot.stellar.org?addr=${fanKeypair.publicKey()}`;

  await fetch(friendbotUrlCreator);
  await fetch(friendbotUrlFan);

  // Check balances
  const creatorAccount = await server.loadAccount(creatorKeypair.publicKey());
  const fanAccount = await server.loadAccount(fanKeypair.publicKey());

  console.log('Creator Balance:', creatorAccount.balances[0].balance, 'XLM');
  console.log('Fan Balance:', fanAccount.balances[0].balance, 'XLM');
}

fundAccounts().catch((error) => console.error('Error:', error));