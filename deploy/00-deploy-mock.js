const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
    networkConfig,
} = require("../helper.hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // Deploymock runs when we are deploying to localhost
    if (developmentChains.includes(network.name)) {
        // deploy mocks
        log("Local network detected! Deploying mocks...")
        const args = [DECIMALS, INITIAL_ANSWER]
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmation: network.config.waitConfirmation || 1,
        })
        log("-------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
