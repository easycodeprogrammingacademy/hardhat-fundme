const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundme = await ethers.getContract("Fundme", deployer)
    console.log("Funding contract...")
    const tx = await fundme.fund({ value: ethers.parseEther("0.1") })
    await tx.wait(1)
    console.log("Funded!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
