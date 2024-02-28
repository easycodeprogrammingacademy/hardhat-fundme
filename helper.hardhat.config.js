const developmentChains = ["hardhat", "localhost"]
const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    31337: {
        name: "localhost",
    },
}
const DECIMALS = 8
const INITIAL_ANSWER = 300000000000
module.exports = { developmentChains, networkConfig, DECIMALS, INITIAL_ANSWER }
