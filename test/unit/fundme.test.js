const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper.hardhat.config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fundme Contract Unit Test", () => {
          let deployer, fundme, mockV3Aggregator
          let fundValue = ethers.parseEther("1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundme = await ethers.getContract("Fundme", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              )
          })

          describe("Constructor", () => {
              it("Sets the aggregator and owner address correctly", async () => {
                  const ownerAddressFromContract = await fundme.getOwner()
                  const aggregatorAddressFromContract =
                      await fundme.getPriceFeed()
                  assert.equal(ownerAddressFromContract, deployer)
                  assert.equal(
                      aggregatorAddressFromContract,
                      await mockV3Aggregator.getAddress(),
                  )
              })
          })

          describe("Fund", () => {
              it("Reverts if don't send enough fund", async () => {
                  await expect(fundme.fund()).to.be.revertedWith(
                      "You need to send more ETH!",
                  )
              })

              it("Updates the funders array", async () => {
                  await fundme.fund({ value: fundValue })
                  const funder = await fundme.getFunder(0)
                  assert.equal(funder, deployer)
              })

              it("Updates funder's fund amount correctly", async () => {
                  await fundme.fund({ value: fundValue })
                  const amount = await fundme.getAddressToAmountFunded(deployer)
                  assert.equal(amount.toString(), fundValue.toString())
              })
          })

          describe("Withdraw", () => {
              beforeEach(async () => {
                  await fundme.fund({ value: fundValue })
              })

              it("Revert if not owner is trying to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundmeuser = await ethers.getContract(
                      "Fundme",
                      accounts[1],
                  )
                  await expect(
                      fundmeuser.withdraw(),
                  ).to.be.revertedWithCustomError(fundme, "NotOwner")
              })

              it("Reset addressToAmountFunded mapping after withdraw", async () => {
                  await fundme.withdraw()
                  const amountFunded =
                      await fundme.getAddressToAmountFunded(deployer)
                  assert.equal(amountFunded.toString(), "0")
              })

              it("Reset funders list after withdraw", async () => {
                  await fundme.withdraw()
                  await expect(fundme.getFunder(0)).to.be.reverted
              })

              it("Balance of contract is zero after withdraw", async () => {
                  await fundme.withdraw()
                  const fundmeBalance = await ethers.provider.getBalance(
                      await fundme.getAddress(),
                  )
                  assert.equal(fundmeBalance.toString(), "0")
              })

              it("Balance is transfered to owner successfully", async () => {
                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundme.getAddress(),
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const tx = await fundme.withdraw()
                  const txReceipt = await tx.wait(1)

                  const { gasUsed, gasPrice } = txReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  assert.equal(
                      startingContractBalance +
                          startingDeployerBalance -
                          gasCost,
                      endingDeployerBalance,
                  )
              })

              it("Withdrawal works when there are multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let index = 1; index < 10; index++) {
                      const fundmeContract = await ethers.getContract(
                          "Fundme",
                          accounts[index],
                      )
                      await fundmeContract.fund({ value: fundValue })
                  }

                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundme.getAddress(),
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const tx = await fundme.withdraw()
                  const txReceipt = await tx.wait(1)

                  const { gasUsed, gasPrice } = txReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  assert.equal(
                      startingContractBalance +
                          startingDeployerBalance -
                          gasCost,
                      endingDeployerBalance,
                  )
              })
          })
      })
