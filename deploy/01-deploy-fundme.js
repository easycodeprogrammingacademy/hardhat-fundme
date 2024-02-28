const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper.hardhat.config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let aggregatorAddress
    if (developmentChains.includes(network.name)) {
        const aggregator = await ethers.getContract("MockV3Aggregator")
        aggregatorAddress = await aggregator.getAddress()
    } else {
        aggregatorAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }
    args = [aggregatorAddress]
    const fundme = await deploy("Fundme", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: network.config.waitConfirmation || 1,
    })

    log("-------------------------------------------------")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
