const truffleContract = require('truffle-contract');

// const normalizeBytes = require('./util/normalizeBytes');

class Escrow {
    constructor(web3, abi, address) {
        let instance;
        let initialized;

        // Corresponds to RequestStatus enum in escrow contracts
        this.RequestStatus = {
            None: 0,
            // Initial status of a request
            Initial: 1,
            // Request approved by the user, at this step an IPFS locator is included in the request
            UserCompleted: 2,
            // Request is denied by the user, at this point Seeker's deposit becomes refundable
            UserDenied: 3,
            // Certificate is received by the Seeker and successfully verified against the certificate hash
            SeekerCompleted: 4,
            // Certificate is received by the Seeker, but the hash doesnt match;
            // TODO: some remediation action is needed here
            SeekerFailed: 5,
            // Request is cancelled by the Seeker - only possible if the request status is Initial
            SeekerCancelled: 6,
        };

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
         * @description Seeker can call this method to transfer extra PATh tokens to the escrow contract
         * for future requests. Transferring a bulk of tokens at once costs less gas
         * than transferring tokens wiht each request.
         * These tokens will be stored in escrow's "bank" and will be used towards seeker's future requests.
         * A seeker can withdraw the tokens they deposited (less tokens used) at any time
         * @example Seeker knows that they will be doing lots of requests and want to preload
         * their escrow account with 1000 tokens. First, they need to call token.approve() to
         * appprove the contract to withdraw 1000 tokens from teh seeker account.
         * Then, seeker calls escrow.increaseAvailableBalance to deposit their tokens to the escrow.
         */
        this.increaseAvailableBalance = async (seeker, amount) => {
            await this.init();

            const tx = await instance.increaseAvailableBalance(amount, { from: seeker });
            return tx;
        };

        this.refundAvailableBalance = async (seeker) => {
            await this.init();

            const tx = await instance.refundAvailableBalance({ from: seeker });
            return tx;
        };

        this.getAvailableBalance = async (seeker) => {
            await this.init();

            const amount = await instance.seekerAvailableBalance(seeker);
            return amount;
        };

        this.getInflightBalance = async (seeker) => {
            await this.init();

            const amount = await instance.seekerInflightBalance(seeker);
            return amount;
        };

        this.submitRequest = async (seeker, user, hash) => {
            await this.init();

            const tx = await instance.submitRequest(user, hash, { from: seeker });
            return tx;
        };
    }
}

module.exports = Escrow;
