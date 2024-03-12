const NodeManager = require("@toruslabs/fetch-node-details").default;
const TorusUtils = require("@toruslabs/torus.js").default;
const { generateIdToken } = require("./utils");
const { TORUS_SAPPHIRE_NETWORK } = require("@toruslabs/constants");

const TORUS_TEST_VERIFIER = "torus-test-health";

const torus = new TorusUtils({
  network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_MAINNET,
  clientId: "YOUR_CLIENT_ID",
  enableOneKey: true,
});

TORUS_NODE_MANAGER = new NodeManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_MAINNET });


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
    key: result.finalKeyData.privKey
  }
}

(async ()=>{
  // it automatically registers user's when login is called for 
  // the first time with a unique email. 
  const keyObj = await Promise.all([
    login("xyz1@example.com"),
    login("xyz2@example.com"),
    login("xyz3@example.com"),
    login("xyz4@example.com"),
    login("xyz5@example.com")
  ])
  
  console.log("keyObj", keyObj);
})()