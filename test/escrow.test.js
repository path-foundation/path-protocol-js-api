const assert = require('assert');
const Web3 = require('web3');
const Resolver = require('truffle-resolver');
const path = require('path');
const crypto = require('crypto');
const { generateAddressesFromSeed } = require('./util/keys');

const artifacts = new Resolver({
    // Project directory
    working_directory: path.resolve(`${__dirname}/../`),
    // Artifacts directory
    contracts_build_directory: path.resolve(`${__dirname}/../node_modules/path-protocol-artifacts/abi`),
});

const web3 = new Web3('http://127.0.0.1:7545');

const keys = generateAddressesFromSeed(process.env.TEST_MNEMONIC, 10);

const EscrowArtifact = artifacts.require('Escrow');
const PathTokenArtifact = artifacts.require('PathToken');
const CertificatesArtifact = artifacts.require('Certificates');
const PublicKeysArtifact = artifacts.require('PublicKeys');
const IssuersArtifact = artifacts.require('Issuers');

// escrow.js module that we are testing
const TokenApi = require('../src/pathtoken');
const EscrowApi = require('../src/escrow');
const IssuersApi = require('../src/issuers');
const CertificatesApi = require('../src/certificates');

// Test certificate
const certificate = {
    name: 'Sam Smith',
    title: 'AWS Certified Developer',
    issuer: 'Amazon',
};

// Test cert hash
const certificateHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(certificate))
    .digest('hex');

describe('Escrow API', () => {
    let tokenApi,
        escrowApi,
        issuersApi,
        certificatesApi;

    const identities = {
        owner: keys[0],
        user: keys[1],
        issuer: keys[2],
        seeker: keys[3],
    };

    before(async () => {
        Object.keys(identities).forEach(i => {
            web3.eth.accounts.wallet.add(identities[i].privateKey);
        });

        web3.eth.defaultAddress = identities.owner.address;

        EscrowArtifact.setProvider(web3.currentProvider);
        PathTokenArtifact.setProvider(web3.currentProvider);
        CertificatesArtifact.setProvider(web3.currentProvider);
        PublicKeysArtifact.setProvider(web3.currentProvider);
        IssuersArtifact.setProvider(web3.currentProvider);

        // Deploy contracts
        const pubkeysContract = await PublicKeysArtifact.new({ from: identities.owner.address });
        const issuersContract = await IssuersArtifact.new({ from: identities.owner.address });
        const tokenContract = await PathTokenArtifact.new({ from: identities.owner.address });

        const certContract = await CertificatesArtifact.new(
            issuersContract.address,
            { from: identities.owner.address }
        );
        const escrowContract = await EscrowArtifact.new(
            tokenContract.address,
            certContract.address,
            pubkeysContract.address,
            { from: identities.owner.address }
        );

        // Instantiate API's
        tokenApi = new TokenApi(web3.currentProvider, tokenContract.address);
        escrowApi = new EscrowApi(web3.currentProvider, escrowContract.address);
        issuersApi = new IssuersApi(web3.currentProvider, issuersContract.address);
        certificatesApi = new CertificatesApi(web3.currentProvider, certContract.address);

        // *** Set things up
        // Whitelist test issuer
        await issuersApi.addIssuer(identities.issuer.address, identities.owner.address);
        // Add a user certificate hash by the whitelisted issuer
        await certificatesApi.addCertificate(identities.user.address, certificateHash, identities.issuer.address);
    });

    it('Seeker increases their available balance in the escrow bank and then refunds it', async () => {
        const amount = 100 * (10 ** 6);

        // Owner transfer <amount> tokens to seeker so he has money
        await tokenApi.transfer(identities.owner.address, identities.seeker.address, amount);

        // Seeker approves withdrawl of funds by escrow contract address
        await tokenApi.approve(identities.seeker.address, escrowApi.address(), amount);
        // Make sure the approval worked
        const allowance = await tokenApi.allowance(identities.seeker.address, escrowApi.address());

        assert.equal(allowance.toNumber(), amount);

        // Increase available balance
        await escrowApi.increaseAvailableBalance(identities.seeker.address, amount);

        // Assert
        const balance = await escrowApi.getAvailableBalance(identities.seeker.address);
        assert.equal(balance.toNumber(), amount, 'Available balance should be 100*10^6');

        // Refund available balance
        const prevBalance = await tokenApi.balanceOf(identities.seeker.address);
        await escrowApi.refundAvailableBalance(identities.seeker.address);
        const newBalance = await tokenApi.balanceOf(identities.seeker.address);
        const escrowBalance = await escrowApi.getAvailableBalance(identities.seeker.address);

        assert.equal(escrowBalance.toNumber(), 0, 'Escrow balance should be zero');
        assert.equal(newBalance.sub(prevBalance).toNumber(), amount);
    });

    it('Seeker submits a request for certificate', async () => {

    });
});
