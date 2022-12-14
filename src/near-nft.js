// creates a keyStore that searches for keys in .near-credentials
// requires credentials stored locally by using a NEAR-CLI command: `near login` 
// https://docs.near.org/tools/cli#near-login

const nearAPI = require("near-api-js");
require("dotenv/config");
const { v4: uuidv4 } = require('uuid');


const { keyStores } = nearAPI;

// Key store dans ordinateur
// const homedir = require("os").homedir();
// const CREDENTIALS_DIR = ".near-credentials";
// const credentialsPath = require("path").join(homedir, CREDENTIALS_DIR);
// const myKeyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

// Key store dans la mémoire
const myKeyStore = new keyStores.InMemoryKeyStore();

const { connect, KeyPair, utils, transactions } = nearAPI;

async function nearGetAccount(
    accountId,
    keyStore
  ) {
    const config = {
        networkId: "testnet",
        keyStore: keyStore, // first create a key store 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };
    const near = await connect({ ...config, keyStore, headers: {} });
    return await near.account(accountId);
  }


async function main() {

     // Compte principal
     await myKeyStore.setKey(
        "testnet",
        process.env.NEAR_ACCOUNT_ID,
        KeyPair.fromString(process.env.PRIVATE_KEY)
    );

    const myAccount = await nearGetAccount(process.env.NEAR_ACCOUNT_ID, myKeyStore);


    // Set arguments for NFT minting
    const args = {
        token_id: uuidv4(),
        metadata: {
        title: "mon nft",
        description: "ici une description pour mon nft",
        media: "https://www.photo-paysage.com/albums/userpics/10001/thumb_Coucher_de_soleil-Cotes-d-Armor.jpg",
        },
        receiver_id: "tcoratger.testnet",
    };

    // Sign and send the transaction using the user account
    const result = await myAccount.signAndSendTransaction({
        receiverId: "nft-cours.tcoratger.testnet",
        actions: [
        transactions.functionCall(
            "nft_mint",
            args,
            10000000000000,
            utils.format.parseNearAmount("0.1")
        ),
        ],
    });

    console.log("result", result);

    console.log("test account");



}

main();