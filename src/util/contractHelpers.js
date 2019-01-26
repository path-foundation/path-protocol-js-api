module.exports = {
    /**
     * @param contract The contract to check the owner/deputy for
     * @param address The address to check against owner/deputy address
     * @param contractName The contract's name, for display in the error message
     */
    checkOwnerDeputy: async (contract, address, contractName) => {
        // Check if the sender is the contract owner or deputy -
        // no need to sendthe transaction and spend gas if the sender is invalid
        const owner = await contract.owner();

        if (address.toLowerCase() !== owner.toLowerCase()) {
            const deputy = await contract.deputy();

            if (address.toLowerCase() !== deputy.toLowerCase()) {
                throw new Error(`Address '${address}' is not allowed to add an issuer to the ${contractName} contract`);
            }
        }
    },
};
