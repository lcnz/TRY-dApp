App = {
    web3Provider: null,
    contracts: {},
    account: 'x0x',
    activeLottery: 'x0x',

    init: async function() {
  
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
          App.web3Provider = window.ethereum;
          try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });;
          } catch (error) {
          // User denied account access...
          console.error("User denied account access")
          }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
          App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
      
      web3.eth.getCoinbase(function(err, account) {
          if(err == null) {
              App.account = account;
              $("#accountId").html("Your address: " + account);
          }
      });
      return App.initContract();
    },

    /* Upload the contract's abstractions */
    initContract: function() {

        // Load content's abstractions
        $.getJSON("TRY.json").done(function(c) {
            App.contracts.TRY = TruffleContract(c);
            App.contracts.TRY.setProvider(App.web3Provider);

        });

        // Load content's abstractions
        $.getJSON("Factory.json").done(function(c) {
            App.contracts.Factory = TruffleContract(c);
            App.contracts.Factory.setProvider(App.web3Provider);

            return App.initLotteryInstance();
        });
        
    },

    initLotteryInstance: function () {
      
      App.contracts.Factory.deployed().then(async (instance) => {
        var len = await instance.lotteriesCount(); 
        if ( len != 0 ) {
          //App.activeLottery = await instance.deployedLotteries(len - 1);
            instance.deployedLotteries(len - 1).then( (lotteryAddr) => {
            App.activeLottery = lotteryAddr;  
            return App.listenForEvents();
          }).catch( async (err) => {
            console.log(err);
          });
        }
        else {
          console.log("A lottery has not yet been deployed");
        }
      });
      
    }, 

    manageAsOperator: async function () {
        //check if coofntract is already deployed and in the address of the account is the same 
        //that deployed the contract if yes ok otherwise alert the user
        console.log("manage as operator ");
        var factoryInstance = null;
        var isDeployed = false;
        try {
            factoryInstance = await App.contracts.Factory.deployed();
            if( factoryInstance.deployedLotteries.length() != 0) {
              isDeployed = true;
            }
              
        } catch (error) {

            console.log(error);
        }
        if (!isDeployed) {
            window.location.href = "operator.html";
        }
        else {
            var factoryOp = await factoryInstance.factoryOperator();
            console.log("factory operator: "+ lotteryOp );
            if ( lotteryOp.toLowerCase() == App.account) {
                window.location.href = "operator.html";
            }
            else {
                alert("Enjoy the lottery as Gambler!!");
            }
        }
    },

    listenForEvents: function() {

        App.contracts.Factory.deployed().then(async (instance) => {
          instance.NewLotteryCreated().on('data', function (event) {
            console.log("Event New Lottery Created catched");
            var formatted = "Event: "+ event.returnValues.eventLog + ", New Lottery Address: " + event.returnValues.newLotteryAddress;
            console.log(formatted);
            alert(formatted);
            return App.initLotteryInstance();
          });
        });

        try {   
          App.contracts.TRY.at(App.activeLottery).then(async (instance) => {
      
              instance.LotteryStateChanged().on('data', function (event) {
                  console.log("Event Lottery State catched");
                  var formatted = "Event: "+ event.returnValues.eventLog;
                  console.log(formatted);
                  alert(formatted);
              });
              
              instance.RoundPhaseChanged().on('data', function (event) {
                  console.log("Event Round Phase catched");
                  var formatted = "Event: "+ event.returnValues.eventLog;
                  console.log(formatted);
                  alert(formatted);
                  
              });

              instance.ticketPurchased().on('data', function (event){
                  console.log("Event Ticket Purchased catched");
                  console.log(event);
                  var formatted = "Event: "+ event.returnValues.eventLog+", "+ "Numbers: " + event.returnValues.numbers + ", TX Caller: " + event.returnValues.caller;
                  console.log(formatted);
                  alert(formatted);
              });

              instance.luckyNumbersDrawn().on('data', function (event){
                  console.log("Event Numbers Drawn catched");
                  var formatted = "Event: "+ event.returnValues.eventLog+", "+ "Lucky Numbers: " + event.returnValues.lucky;
                  console.log(formatted);
                  alert(formatted);
              }); 

              instance.prizeAwarded().on('data', function (event){
                  console.log("Event Prize Awarded catched");
                  var formatted = "Event: "+ event.returnValues.eventLog+", "+ "Winner: " + event.returnValues.winner + ", Prize Id :" + event.returnValues.tokenId;
                  console.log(formatted);
                  alert(formatted);
              }); 

          });
        }
        catch (error) {
            console.log(error);
            console.log("Contract has not been deployed");
        }
    },

    buyLotteryTicket: function () {
        
        var num = $("#stdNumbers").val().split(",");
        var len = num.length;
        var powerB = $("#powerBall").val();

        if (isNaN(powerB) || (powerB < 1 || powerB > 26 )) {
            alert("Insert corret Powerball");
            return;
        }

        if ( num.length != 5 ) {
            alert("pick 5 digits");
            return;
        }

        for (var i = 0; i < num.length; i++) {
            if (isNaN(num[i])) {
                alert("only digits are allowed");
                return;
            }
        }

        for (var i = 0; i < num.length; i++) {
            if (num.indexOf(num[i]) !== num.lastIndexOf(num[i])) {
                alert("Array contains duplicates.");
                return;
            }
            console.log("Array doesn't contain duplicates.");
        }

        for (var i = 0; i < num.length; i++) { 
            if ( num[i] < 1 || num[i] > 69 ) {
                alert("Array not in Range");
                break;
            }
            console.log("Array in Range");
        }

        //all the checks are passed so is possible submit ticket
        num.push(powerB);
        console.log("numeri: "+ num);

        App.contracts.TRY.at(App.activeLottery).then(async(instance) =>{

            try {
                await instance.buy(num, {from: App.account, value: web3.utils.toWei("200000", "gwei")});
                console.log("transaction sent");
            }
            catch (err) {
                console.log(err);
                alert(err);
            }
            
        });
    },

    checkPrizeDescription: function () {

        var prizeId = $("#prizeId").val();

        if (isNaN(prizeId)) {
            alert("Insert Prize Id");
            return;
        }

        App.contracts.TRY.at(App.activeLottery).then(async (instance) => {
            try {
                var desc = await instance.checkPrizeDescription(prizeId);
                console.log("NFT PRIZE ID: "+prizeId +", Prize Description: " + desc);
                alert("NFT PRIZE ID: "+prizeId +", Prize Description: " + desc);
            }
            catch (err) {
                console.log(err)
                alert("prize not found");
            }
        });

    }

  };
  
// Call init whenever the window loads
$(function() {
    $(window).on('load', function () {
        App.init();
    });
});