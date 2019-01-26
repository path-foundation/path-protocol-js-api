const assert = require('assert');
const Web3 = require('web3');
const Resolver = require('truffle-resolver');
const path = require('path');
const { generateAddressesFromSeed } = require('./util/keys');

const artifacts = new Resolver({
    // Project directory
    working_directory: path.resolve(`${__dirname}/../`),
    // Artifacts directory
    contracts_build_directory: path.resolve(`${__dirname}/../node_modules/path-protocol-artifacts/abi`),
});

const web3 = new Web3('http://127.0.0.1:7545');

const keys = generateAddressesFromSeed(process.env.TEST_MNEMONIC, 10);

const PathTokenArtifact = artifacts.require('PathToken');

// issuers.js module that we are testing
const PathTokenApi = require('../src/pathtoken');

describe('PathToken API', () => {
    let tokenApi,
        tokenContract;

    const identities = {
        account1: keys[0],
        account2: keys[1],
        account3: keys[2],
    };

    before(async () => {
        Object.keys(identities).forEach(i => {
            web3.eth.accounts.wallet.add(identities[i].privateKey);
        });

        PathTokenArtifact.setProvider(web3.currentProvider);

        tokenContract = await PathTokenArtifact.new({ from: identities.account1.address });

        // Instantiate issuers API
        tokenApi = new PathTokenApi(web3.currentProvider, tokenContract.address);
    });

    it('transfer tokens from account1 to account2', async () => {
        const account1balance1 = await tokenApi.balanceOf(identities.account1.address);
        const account2balance1 = await tokenApi.balanceOf(identities.account2.address);

        // we don't wanna add explicit dependency on BN because lazy.
        const BN = account1balance1.constructor;

        // transfer 125 path tokens from account1 to account 2
        await tokenApi.transfer(identities.account1.address, identities.account2.address, 125);

        const account1balance2 = await tokenApi.balanceOf(identities.account1.address);
        const account2balance2 = await tokenApi.balanceOf(identities.account2.address);

        assert.ok(account1balance1.sub(new BN(125)).eq(account1balance2));
        assert.ok(account2balance1.add(new BN(125)).eq(account2balance2));
    });

    it('transfer tokens from account1 to account3 by account2', async () => {
        const account1balance1 = await tokenApi.balanceOf(identities.account1.address);
        const account3balance1 = await tokenApi.balanceOf(identities.account3.address);

        const transferValue = 243;

        // approve account2 to transfer money from account1
        await tokenApi.approve(identities.account1.address, identities.account2.address, transferValue);

        const allowance = await tokenApi.allowance(identities.account1.address, identities.account2.address);

        // make sure the approved value has been allowed
        assert.ok(allowance.toNumber() === transferValue, `Allowance should be ${transferValue} tokens`);

        // Transfer tokens from account1 to account3 by account2
        await tokenApi.transferFrom(identities.account1.address,
            identities.account3.address,
            transferValue,
            identities.account2.address);

        const account1balance2 = await tokenApi.balanceOf(identities.account1.address);
        const account3balance2 = await tokenApi.balanceOf(identities.account3.address);

        // We don't want to add explicit dependency on BN because lazy.
        const BN = account1balance1.constructor;

        assert.ok(account1balance1.sub(new BN(transferValue)).eq(account1balance2), `Balance should decrease by ${transferValue}`);
        assert.ok(account3balance1.add(new BN(transferValue)).eq(account3balance2), `Balance should increase by ${transferValue}`);
    });
});
