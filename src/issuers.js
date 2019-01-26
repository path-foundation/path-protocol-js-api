const truffleContract = require('truffle-contract');
const { abi } = require('path-protocol-artifacts/abi/Issuers.json');

const contractUtil = require('./util/contractUtil');

class Issuers {
    constructor(web3provider, address) {
        let instance;
        let initialized;

        // Issuer status, matches values in Issuers conract
        this.issuerStatus = {
            None: 0,
            Active: 1,
            Inactive: 2,
        };

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
         * @description Add an issuer to the Issuers contract;
         * any issuer who wants to submit certificates has to be added to The issuers contract
         * @param {*} issuer Issuer's address
         * @param {*} sender The address of the tx sender; it has to be the contract owner or deputy
         */
        this.addIssuer = async (issuer, sender) => {
            await this.init();

            // Check if the sender is the contract owner or deputy -
            // no need to sendthe transaction and spend gas if the sender is invalid
            await contractUtil.checkOwnerDeputy(instance, sender, 'Issuer');

            const tx = await instance.addIssuer(issuer, { from: sender });
            return tx;
        };
        /**
         * @description Remove an issuer from the Issuers contract;
         * The issuer's status changes to Inactive;
         * The issuer is no longer able to submit certificates
         * @param {*} issuer Issuer's address
         * @param {*} sender The address of the tx sender; it has to be the contract owner or deputy
         */
        this.removeIssuer = async (issuer, sender) => {
            await this.init();

            // Check if the sender is the contract owner or deputy -
            // no need to sendthe transaction and spend gas if the sender is invalid
            await contractUtil.checkOwnerDeputy(instance, sender, 'Issuer');

            const tx = await instance.removeIssuer(issuer, { from: sender });
            return tx;
        };
        /**
         * Method returns the status of the provided issuer
         * @param {*} issuer Issuer's address
         */
        this.getIssuerStatus = async (issuer) => {
            await this.init();

            const status = await instance.getIssuerStatus(issuer);
            return status;
        };
    }
}

module.exports = Issuers;
