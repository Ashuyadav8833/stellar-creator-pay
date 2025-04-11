const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Replace these with YOUR keys from wallets.js
const creatorSecret = 'SBZZZYUSA7ILVGZFJW3GFQKEBUBQBEJDH666WM5WWQPS2XZTPUDGC6NL';
const fanSecret = 'SAMFB4FJI433G55WJWBXWFNKGSDC2TZVLC67RBU3NOKM7CIQKG6RRREZ';

const creatorKeypair = StellarSdk.Keypair.fromSecret(creatorSecret);
const fanKeypair = StellarSdk.Keypair.fromSecret(fanSecret);

async function issueArtistCoin() {
  // Load accounts
  const creatorAccount = await server.loadAccount(creatorKeypair.publicKey());
  const fanAccount = await server.loadAccount(fanKeypair.publicKey());

  // Define the ARTISTCOIN asset
  const artistCoin = new StellarSdk.Asset('ARTISTCOIN', creatorKeypair.publicKey());

  // Step 1: Fan establishes a trustline to accept ARTISTCOIN
  const trustTx = new StellarSdk.TransactionBuilder(fanAccount, {
    fee: StellarSdk.BASE_FEE, // Standard fee: 100 stroops (0.00001 XLM)
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: artistCoin,
      limit: '1000', // Max amount fan can hold
    }))
    .setTimeout(30)
    .build();

  trustTx.sign(fanKeypair);
  await server.submitTransaction(trustTx);
  console.log('Trustline established for ARTISTCOIN!');

  // Step 2: Creator sends 100 ARTISTCOIN to fan
  const paymentTx = new StellarSdk.TransactionBuilder(creatorAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: fanKeypair.publicKey(),
      asset: artistCoin,
      amount: '100', // Send 100 ARTISTCOIN
    }))
    .setTimeout(30)
    .build();

  paymentTx.sign(creatorKeypair);
  await server.submitTransaction(paymentTx);
  console.log('100 ARTISTCOIN sent to fan!');

  // Check fan’s balance
  const updatedFanAccount = await server.loadAccount(fanKeypair.publicKey());
  const artistCoinBalance = updatedFanAccount.balances.find(
    (b) => b.asset_code === 'ARTISTCOIN'
  );
  console.log('Fan’s ARTISTCOIN Balance:', artistCoinBalance.balance);
}

issueArtistCoin().catch((error) => console.error('Error:', error));