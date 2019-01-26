const truffleContract = require('truffle-contract');
const { abi } = require('path-protocol-artifacts/abi/PublicKeys.json');

const stringHelpers = require('./util/stringHelpers');

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

            const tx = await instance.addPublicKey(stringHelpers.ensure0x(publicKey), { from: sender });
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

            const pub = await instance.publicKeyStore(stringHelpers.ensureNo0x(addr));
            return pub;
        };
    }
}
module.exports = PublicKeys;
