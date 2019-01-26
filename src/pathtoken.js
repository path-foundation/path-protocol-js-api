const truffleContract = require('truffle-contract');
const { abi } = require('path-protocol-artifacts/abi/PathToken.json');

class PathToken {
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
         * @description Get the balance of an address
         * @param {*} address Address to get balance of
         * @returns {bignumber} account balance
         */
        this.balanceOf = async (sender) => {
            await this.init();

            const balance = await instance.balanceOf(sender);
            return balance;
        };

        /**
         * @description Transfer tokens from sender account to a recipient
         * @param {address} sender - address of token sender
         * @param {address} receiver - address of token recipient
         * @param {bignumber} value - number of tokens to send
         * @returns transaction receipt
         */
        this.transfer = async (sender, receiver, value) => {
            await this.init();

            const tx = await instance.transfer(receiver, value, { from: sender });
            return tx;
        };

        /**
         * @description Approve spender to spend `value` tokens from `owner`
         * Teh transaction has to be sent by the `owner`
         */
        this.approve = async (owner, spender, value) => {
            await this.init();

            const tx = await instance.approve(spender, value, { from: owner });
            return tx;
        };

        /**
         * @description Function to check the amount of tokens that an owner allowed to a spender.
         * @param {address} owner - the address which owns the funds.
         * @param {address} spender - the address which will spend the funds.
         * @return {bignumber} the amount of tokens still available for the spender.
         */
        this.allowance = async (owner, spender) => {
            await this.init();

            const amount = await instance.allowance(owner, spender);
            return amount;
        };

        /**
         * /**
         * @description Transfer tokens from one address to another
         * @param {address} from - the address which you want to send tokens from
         * @param {address} to - the address which you want to transfer to
         * @param {bignumber} - the amount of tokens to be transferred
         * @param spender - address that initiates the transaction
         */
        this.transferFrom = async (from, to, value, spender) => {
            await this.init();

            const tx = await instance.transferFrom(from, to, value, { from: spender });
            return tx;
        };
    }
}

module.exports = PathToken;
