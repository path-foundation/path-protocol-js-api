const truffleContract = require('truffle-contract');
const { abi } = require('path-protocol-artifacts/abi/PublicKeys.json');

const { ensure0x, ensureNo0x } = require('./util/stringHelpers');

class PublicKeys {
    constructor(web3provider, address) {
        let instance;
        let initialized;

        this.init = async () => {
            if (!initialized) {
                const contract = truffleContract({ abi });
                contract.setProvider(web3provider);
                instance = await contract.at(address);
                initialized = true;
            }
        };

        this.address = () => address;

        /**
         * @description Add the sender's public key to the public key store;
         * @param {*} publicKey Sender's public key
         * @param {*} [sender] The address of the tx sender
         */
        this.addPublicKey = async (publicKey, sender) => {
            await this.init();

            const tx = await instance.addPublicKey(ensure0x(publicKey), { from: sender });
            return tx;
        };

        /**
         * @description Get the public key for an address
         * @param {string} [addr] The address of the tx sender
         * @returns {string} pk Public key for the provided address,
         * or 0x0 if it hasn't been previously saved using addPublicKey
         */
        this.getPublicKey = async (addr) => {
            await this.init();

            // When passing address type, need to remove 0x
            const pub = await instance.publicKeyStore(ensureNo0x(addr));
            // We return public key without 0x
            return ensureNo0x(pub);
        };
    }
}
module.exports = PublicKeys;
