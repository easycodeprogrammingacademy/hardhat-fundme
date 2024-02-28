// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getEthToUsdPrice(
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        uint8 decimals = dataFeed.decimals();
        (, int256 answer, , , ) = dataFeed.latestRoundData();
        return uint256(answer) * (10 ** (18 - decimals));
    }

    function convertEthToUsd(
        uint256 ethAmount,
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        uint256 currentEthPrice = getEthToUsdPrice(dataFeed);
        return (ethAmount * currentEthPrice) / 1e18;
    }
}
