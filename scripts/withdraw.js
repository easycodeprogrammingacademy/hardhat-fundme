const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundme = await ethers.getContract("Fundme", deployer)
    console.log("Withdrawing fund...")
    const tx = await fundme.withdraw()
    await tx.wait(1)
    console.log("Withdraw successfully!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
