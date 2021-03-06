const truffleContract = require('truffle-contract');
const { abi } = require('path-protocol-artifacts/abi/Certificates.json');

const { ensure0x } = require('./util/stringHelpers');

class Certificates {
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
         * Method adds the certificate hash to the user's list of certificates
         * @param certificateHash The certificate hash
         */
        this.addCertificate = async (userAddress, certificateHash, sender) => {
            await this.init();

            const tx = await instance.addCertificate(userAddress, ensure0x(certificateHash), { from: sender });
            return tx;
        };

        /**
         * @description Function revokes the certificate
         * Note: only the certificate issuer may revoke a certificate they have issued
         * @param {*} userAddress User's address
         * @param {*} certificateHash Certificate hash
         */
        this.revokeCertificate = async (userAddress, certificateHash, sender) => {
            await this.init();

            // First we need to retrieve the certificate index
            const index = await this.getCertificateIndex(userAddress, ensure0x(certificateHash));

            const tx = await instance.revokeCertificate(userAddress, index, { from: sender });
            return tx;
        };

        /**
         * Method returns an index of the certificate hash in the user's list of certificates
         * @param {*} userAddress User's address
         * @param {*} certificateHash Certificate hash
         * @returns {int} index certificate index in user's certificate array
         */
        this.getCertificateIndex = async (userAddress, certificateHash) => {
            await this.init();

            const index = await instance.getCertificateIndex(userAddress, ensure0x(certificateHash));
            return index;
        };

        /**
         * Method returns the number of certificates registered for the user;
         * Note: this number includes revoked certificates
         * @param {*} userAddress User's address
         * @param {*} includeRevoked Whether to include revoked certificates in the count
         */
        this.getCertificateCount = async (userAddress, includeRevoked) => {
            await this.init();

            const count = await instance.getCertificateCount(userAddress, includeRevoked);
            return count;
        };

        /**
         * Method returns a certificate's metadata (issuer, revoked status)
         * @param {address} userAddress User's address
         * @param {bytes} certificateHash Certificate hash
         * @returns {address} issuer certificate issuer
         * @returns {bool} revoked whether the certificate is active or revoked
         */
        this.getCertificateMetadata = async (userAddress, certificateHash) => {
            await this.init();

            const meta = await instance.getCertificateMetadata(userAddress, ensure0x(certificateHash));
            return { issuer: meta[0], revoked: meta[1] };
        };

        /**
         * Method returns certificate data for a certificate at specified index in the user's list
         * @param {*} userAddress User's address
         * @param {*} index Certificate index in the list of user's certificates
         */
        this.getCertificateHashAt = async (userAddress, index) => {
            await this.init();

            return instance.getCertificateAt(userAddress, index);
        };
    }
}

module.exports = Certificates;
