const assert = require('assert');
const Web3 = require('web3');
const Resolver = require('truffle-resolver');
const path = require('path');
const { generateAddressesFromSeed } = require('./util/keys');
const { ensure0x } = require('../src/util/stringHelpers');

const artifacts = new Resolver({
    // Project directory
    working_directory: path.resolve(`${__dirname}/../`),
    // Artifacts directory
    contracts_build_directory: path.resolve(`${__dirname}/../node_modules/path-protocol-artifacts/abi`),
});

const web3 = new Web3('http://127.0.0.1:7545');

// Sender's address - first address in Ganache
const sender = generateAddressesFromSeed(process.env.TEST_MNEMONIC, 1)[0];

const PublicKeysArtifact = artifacts.require('PublicKeys');

// issuers.js module that we are testing
const PublicKeysApi = require('../src/pubkeys');

describe('PublicKeys API', () => {
    let pubkeysContract,
        pubkeysApi;

    before(async () => {
        web3.eth.defaultAddress = sender.address;

        PublicKeysArtifact.setProvider(web3.currentProvider);

        pubkeysContract = await PublicKeysArtifact.new({ from: sender.address });

        // Instantiate issuers API
        pubkeysApi = new PublicKeysApi(web3.currentProvider, pubkeysContract.address);
    });

    it('Adding a public key', async () => {
        // add an issuer
        await pubkeysApi.addPublicKey(sender.publicKey, sender.address);

        // check that the issuer has been added
        const publicKey = await pubkeysApi.getPublicKey(sender.address);

        assert.equal(publicKey, ensure0x(sender.publicKey));
    });
});
