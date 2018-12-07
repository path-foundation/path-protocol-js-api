const truffleContract = require('truffle-contract');

const normalizeBytes = require('./util/normalizeBytes');

class Certificates {
    constructor(web3, abi, address) {
        let instance;
        let initialized;

        this.init = async () => {
            if (!initialized) {
                const contract = truffleContract({ abi });
                contract.setProvider(web3.currentProvider);
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

            const tx = await instance.addCertificate(userAddress, normalizeBytes(certificateHash), { from: sender });
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
            const index = await this.getCertificateIndex(userAddress, normalizeBytes(certificateHash));

            const tx = await instance.revokeCertificate(userAddress, index, { from: sender });
            return tx;
        };

        /**
         * Method returns an index of the certificate hash in the user's list of certificates
         * @param {*} userAddress User's address
         * @param {*} certificateHash Certificate hash
         */
        this.getCertificateIndex = async (userAddress, certificateHash) => {
            await this.init();

            const index = await instance.getCertificateIndex(userAddress, normalizeBytes(certificateHash));
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
         * @param {*} userAddress User's address
         * @param {*} certificateHash Certificate hash
         */
        this.getCertificateMetadata = async (userAddress, certificateHash) => {
            await this.init();

            const meta = await instance.getCertificateMetadata(userAddress, normalizeBytes(certificateHash));
            return meta;
        };

        /**
         * Method returns certificate data for a certificate at specified index in the user's list
         * @param {*} userAddress User's address
         * @param {*} index Certificate index in the list of user's certificates
         */
        this.getCertificateAt = async (userAddress, index) => {
            await this.init();

            const cert = await instance.getCertificateAt(userAddress, index);
            return cert;
        };
    }
}

module.exports = Certificates;
