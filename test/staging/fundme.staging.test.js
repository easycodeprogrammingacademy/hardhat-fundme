const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper.hardhat.config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fundme Contract Staging Test", () => {
          let deployer, fundme, mockV3Aggregator
          let fundValue = ethers.parseEther("0.02")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundme = await ethers.getContract("Fundme", deployer)
          })

          it("Allows people to fund and withdraw", async () => {
              const contractBalanceBeforeFund =
                  await ethers.provider.getBalance(await fundme.getAddress())
              const txFund = await fundme.fund({ value: fundValue })
              await txFund.wait(1)
              const contractBalanceAfterFund = await ethers.provider.getBalance(
                  await fundme.getAddress(),
              )

              const txWithdraw = await fundme.withdraw()
              await txWithdraw.wait(1)
              const contractBalanceAfterWithdraw =
                  await ethers.provider.getBalance(await fundme.getAddress())

              assert.equal(
                  contractBalanceAfterFund.toString(),
                  (contractBalanceBeforeFund + fundValue).toString(),
              )
              assert.equal(contractBalanceAfterWithdraw.toString(), "0")
          })
      })
