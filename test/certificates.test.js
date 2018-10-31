/* eslint no-await-in-loop: off, max-len: off */
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

const CertificatesArtifact = artifacts.require('Certificates');
const IssuersArtifact = artifacts.require('Issuers');

const Issuers = require('../src/issuers');
const Certificates = require('../src/certificates');

const certificate = {
    name: 'Sam Smith',
    title: 'AWS Certified Developer',
    issuer: 'Amazon',
};

const revokedCertificate = {
    name: 'John Doe',
    title: 'Fake Developer',
    issuer: 'Amazon',
};

const nonExistingCertificate = {
    name: 'noname',
    doesnt: 'matter',
};

// Hash to be put on the blockchain
const certificateHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(certificate))
    .digest('hex');

const revokedCertificateHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(revokedCertificate))
    .digest('hex');

const nonExistingCertificateHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(nonExistingCertificate))
    .digest('hex');

describe('Certificates API', () => {
    let issuersApi,
        certificatesApi,
        certificates,
        issuers;

    const identities = {
        owner: keys[0],
        user: keys[1],
        issuer: keys[2],
        inactiveIssuer: keys[3],
        unauthorizedIssuer: keys[4],
    };

    before(async () => {
        Object.keys(identities).forEach(i => {
            web3.eth.accounts.wallet.add(identities[i].privateKey);
        });

        web3.eth.defaultAddress = identities.owner.address;

        CertificatesArtifact.setProvider(web3.currentProvider);
        IssuersArtifact.setProvider(web3.currentProvider);

        // Deploy certificates
        issuers = await IssuersArtifact.new({ from: identities.owner.address });
        certificates = await CertificatesArtifact.new(issuers.address, { from: identities.owner.address });

        // Create an instance of issuers api
        issuersApi = new Issuers(web3, issuers.abi, issuers.address);
        // Create an instance of certificates api
        certificatesApi = new Certificates(web3, certificates.abi, certificates.address);

        // Add an issuer to the issuers contract
        await issuersApi.addIssuer(identities.issuer.address, identities.owner.address);

        // Add and remove another issuer
        await issuersApi.addIssuer(identities.inactiveIssuer.address, identities.owner.address);
        await issuersApi.removeIssuer(identities.inactiveIssuer.address, identities.owner.address);
    });

    it('Place the user\'s certificate on the blockchain', async () => {
        await certificatesApi.addCertificate(identities.user.address, certificateHash, identities.issuer.address);

        // Retrieve the certificate index
        const index = await certificatesApi.getCertificateIndex(identities.user.address, certificateHash);

        assert.ok(index.toNumber() >= 0, 'Certificate not found');
    });

    it('Place and revoke another user\'s certificate on the blockchain', async () => {
        await certificatesApi.addCertificate(identities.user.address, revokedCertificateHash, identities.issuer.address);
        await certificatesApi.revokeCertificate(identities.user.address, revokedCertificateHash, identities.issuer.address);

        const meta = await certificatesApi.getCertificateMetadata(identities.user.address, revokedCertificateHash);

        // meta[0] - address; meta[1] - revoked status
        assert.ok(meta[1] === true);
    });

    it('Try to get an index of a non-existing certificate', async () => {
        try {
            await certificatesApi.getCertificateMetadata(identities.user.address, nonExistingCertificateHash);
            assert.fail();
        } catch (error) {
            // TODO: add a check for the error message -
            // should match the require message of the contract
            assert.ok(true);
        }
    });

    it('List all the certificates for the user', async () => {
        const count = await certificatesApi.getCertificateCount(identities.user.address, true);

        // we have added two certificates so far;
        // make sure we get the right count
        assert.ok(count.toNumber() === 2);
    });

    it('Get first certificate for the user', async () => {
        const cert = await certificatesApi.getCertificateAt(identities.user.address, 0);

        assert.equal(cert.hash, `0x${certificateHash}`, "Certificate hash doesn't match");
    });
});
