// creates a keyStore that searches for keys in .near-credentials
// requires credentials stored locally by using a NEAR-CLI command: `near login` 
// https://docs.near.org/tools/cli#near-login

const nearAPI = require("near-api-js");
require("dotenv/config");

const { keyStores } = nearAPI;

// Key store dans ordinateur
const homedir = require("os").homedir();
// const CREDENTIALS_DIR = ".near-credentials";
// const credentialsPath = require("path").join(homedir, CREDENTIALS_DIR);
// const myKeyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

// Key store dans la mémoire
const myKeyStore = new keyStores.InMemoryKeyStore();

const { connect, KeyPair, utils } = nearAPI;

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



async function main () {

    // Compte principal
    await myKeyStore.setKey(
        "testnet",
        process.env.NEAR_ACCOUNT_ID,
        KeyPair.fromString(process.env.PRIVATE_KEY)
    );

    const myAccount = await nearGetAccount(process.env.NEAR_ACCOUNT_ID, myKeyStore);

    // const myTransaction = await myAccount.sendMoney(
    //     process.env.NEAR_ACCOUNT_ID,
    //     utils.format.parseNearAmount("0.1")
    // );


    // Nouveau compte
    const NewKeyPair = KeyPair.fromRandom('ed25519');

    const newPublicKey = NewKeyPair.getPublicKey();

    const implicit_user_id = Buffer.from(
        utils.PublicKey.fromString(newPublicKey.toString()).data
    ).toString("hex");

    await myKeyStore.setKey("testnet", implicit_user_id, NewKeyPair);

    const useraccount = await nearGetAccount(
        implicit_user_id,
        myKeyStore
    );

    // Si le compte n'existe pas on le crée
    try {
        await useraccount.state();
    } catch (e) {
        // If user account doens't exist, then create an implicit grinderyAccount via transaction
        if (e.type === "AccountDoesNotExist") {
            await myAccount.sendMoney(
                implicit_user_id,
                utils.format.parseNearAmount("1")
            );
            console.log("new account created with userID ", implicit_user_id);
        }
    }
}

// main()

console.log(homedir);