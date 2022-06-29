// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./TRY.sol";

/**
 * @title Factory
 * @dev Factory Lottery deploy TRY contract
 */
contract Factory {

    address public factoryOperator; //lottery operator
    //modifier
    modifier onlyFactoryOperator {
        require(msg.sender == factoryOperator, "Only the factory operator can use this function");
        _;
    }

    address[] public deployedLotteries;

    uint public lotteriesCount = 0;

    //event to log factory actions
    event NewLotteryCreated(string eventLog, address newLotteryAddress);

    constructor() {

        factoryOperator = msg.sender;        

    }

    /**
    * @dev start new Lottery 
    */
    function createNewLottery(uint _K, uint _M)public onlyFactoryOperator returns(TRY instance){
        
        TRY tryInstance;

        if ( deployedLotteries.length == 0 ) {
            tryInstance = new TRY(_K, _M, factoryOperator);
            deployedLotteries.push(address(tryInstance));
            lotteriesCount ++;
        }
        else {
            address lastItem = deployedLotteries[deployedLotteries.length-1];

            require ( false == TRY(lastItem).checkLotteryActive(), "One active lottery Already exist, comeback next time");

            tryInstance = new TRY(_K, _M, factoryOperator);
            deployedLotteries.push(address(tryInstance));
            lotteriesCount ++;
            
            emit NewLotteryCreated("New Lottery has been created, enjoi with it", address(tryInstance));
        }
        return tryInstance;
    }
  
}
