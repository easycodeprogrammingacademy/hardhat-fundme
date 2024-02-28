// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error NotOwner();

contract Fundme {
    using PriceConverter for uint256;

    mapping(address => uint256) private addressToAmountFunded;
    address[] private funders;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // require(convertEthToUsd(msg.value) >= MINIMUM_USD, "You need to send more ETH!");
        require(
            msg.value.convertEthToUsd(s_priceFeed) >= MINIMUM_USD,
            "You need to send more ETH!"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function withdraw() public onlyOwner {
        for (uint256 index = 0; index < funders.length; index++) {
            addressToAmountFunded[funders[index]] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Withdraw Failed!!");
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
