const assert = require('assert');
const Web3 = require('web3');
const Resolver = require('truffle-resolver');
const path = require('path');
const { generateAddressesFromSeed } = require('./util/keys');
const config = require('./config/config');

const artifacts = new Resolver({
    // Project directory
    working_directory: path.resolve(`${__dirname}/../`),
    // Artifacts directory
    contracts_build_directory: path.resolve(`${__dirname}/../node_modules/path-protocol-artifacts/abi`),
});

const web3 = new Web3('http://127.0.0.1:7545');

const keys = generateAddressesFromSeed(config.mnemonic, config.addressCount);

const IssuersArtifact = artifacts.require('Issuers');

// issuers.js module that we are testing
const Issuers = require('../src/issuers');

describe('Issuers API', () => {
    let issuersApi,
        issuers;

    const identities = {
        owner: keys[0],
        deputy: keys[1],
        issuer: keys[2],
    };

    before(async () => {
        Object.keys(identities).forEach(i => {
            web3.eth.accounts.wallet.add(identities[i].privateKey);
        });

        web3.eth.defaultAddress = identities.owner.address;

        IssuersArtifact.setProvider(web3.currentProvider);

        issuers = await IssuersArtifact.new({ from: identities.owner.address });

        // Instantiate certificates API
        issuersApi = new Issuers(web3, issuers.abi, issuers.address);
    });

    it('Adding an issuer', async () => {
        // add an issuer
        await issuersApi.addIssuer(identities.issuer.address, identities.owner.address);
        // check that teh issuer has been added
        const status = await issuersApi.getIssuerStatus(identities.issuer.address);
        assert.equal(status.toNumber(), issuersApi.issuerStatus.Active);
    });

    it('Removing an issuer', async () => {
        // remove an issuer
        await issuersApi.removeIssuer(identities.issuer.address, identities.owner.address);
        // check that the issuer has been added
        const status = await issuersApi.getIssuerStatus(identities.issuer.address);
        assert.equal(status.toNumber(), issuersApi.issuerStatus.Inactive);
    });
});
