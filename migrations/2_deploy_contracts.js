var Factory = artifacts.require("./Factory.sol");

module.exports = function(deployer) {

  deployer.deploy(Factory, 4, 4);
};
