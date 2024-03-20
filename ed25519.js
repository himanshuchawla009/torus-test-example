const NodeManager = require("@toruslabs/fetch-node-details").default;
const TorusUtils = require("@toruslabs/torus.js").default;
const { generateIdToken } = require("./utils");
const { TORUS_SAPPHIRE_NETWORK } = require("@toruslabs/constants");

const TORUS_TEST_VERIFIER = "torus-test-health";

const torus = new TorusUtils({
  network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
  clientId: "YOUR_CLIENT_ID",
  enableOneKey: true,
  keyType: "ed25519"
});

TORUS_NODE_MANAGER = new NodeManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET });


async function login(
  userEmail
) {
  const token = generateIdToken(userEmail, "ES256");
    const verifierDetails = { verifier: TORUS_TEST_VERIFIER, verifierId: userEmail };
    const { torusNodeEndpoints, torusIndexes, torusNodePub } = await TORUS_NODE_MANAGER.getNodeDetails(verifierDetails);
    const result = await torus.retrieveShares(
      torusNodeEndpoints,
      torusIndexes,
      TORUS_TEST_VERIFIER,
      { verifier_id: userEmail },
      token,
      torusNodePub
  );

  // key will be returned as empty once mfa is enabled for this user
  return {
    key: result.finalKeyData.privKey,
    walletAddress: result.finalKeyData.walletAddress
  }
}

async function keyLookup(
    userEmail
  ) {
      const verifierDetails = { verifier: TORUS_TEST_VERIFIER, verifierId: userEmail };
      const { torusNodeEndpoints, torusNodePub } = await TORUS_NODE_MANAGER.getNodeDetails(verifierDetails);
      const result = await torus.getPublicAddress(
        torusNodeEndpoints,
        torusNodePub,
        verifierDetails
        
    );
  
    // key will be returned as empty once mfa is enabled for this user
    return {
      walletAddress: result.finalKeyData.walletAddress
    }
  }

(async ()=>{
  // it automatically registers user's when login is called for 
  // the first time with a unique email. 
  const testUser = "ed25519TestUserxyz"
  const keyLookupResult = await keyLookup(testUser)
  console.log("key lookup result", keyLookupResult)
  const loginResult = await login(testUser);
  console.log("login result", loginResult);

  if (keyLookupResult.walletAddress !== loginResult.walletAddress) {
    throw new Error("Something went wrong, keys are not matching , please report this bug")
  } 
  
})()