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
          console.log("lotteryaddr ->" + lotteryAddr);
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

  createNewLottery: function () {

    //save the state of the lottery, to serialize and use later
    
    var _K = $("#paramK").val();
    var _M = $("#paramM").val();

    console.log("value k :"+ _K);

    if ( !isNaN(_K) && !isNaN(_M)){

      App.contracts.Factory.deployed().then(async(instance) => {
        
        instance.createNewLottery(_K, _M, {from: App.account}).then( (tryInstance) => {
          App.activeLottery = tryInstance.address;
        }).catch( (err) => {
          console.log(err);
          alert(err);
        });
        
      });
    }
    else {
      alert("Must input numbers");
    }
  },

  listenForEvents: function() {

    App.contracts.Factory.deployed().then(async (instance) => {
      instance.NewLotteryCreated().on('data', function (event) {
        var ms = Date.now();
        console.log("Event New Lottery Created catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog + ", New Lottery Address: " + event.returnValues.newLotteryAddress;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      });
    });


    App.contracts.TRY.at(App.activeLottery).then(async (instance) => {

      instance.LotteryStateChanged().on('data', function (event) {
        var ms = Date.now();
        console.log("Event Lottery State catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      });

      instance.RoundPhaseChanged().on('data', function (event) {
        var ms = Date.now();
        console.log("Event Round Phase catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      });

      instance.Log().on('data', function (event) {
        var ms = Date.now();
        console.log("Event Log catched ");
        console.log(event);
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog+", "+ "TX Caller: " + event.returnValues.caller;
        console.log(formatted);
        // If event has parameters: event.returnValues.valueName
        $("#monitor").append("<br/>"+formatted);
      });

      instance.ticketPurchased().on('data', function (event){
        var ms = Date.now();
        console.log("Event Ticket Purchased catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog+", "+ "Numbers: " + event.returnValues.numbers + ", TX Caller: " + event.returnValues.caller;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      });

      instance.luckyNumbersDrawn().on('data', function (event){
        var ms = Date.now();
        console.log("Event Numbers Drawn catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog+", "+ "Lucky Numbers: " + event.returnValues.lucky;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      }); 

      instance.prizeAwarded().on('data', function (event){
        var ms = Date.now();
        console.log("Event Prize Awarded catched");
        var formatted = "> "+"timestamp: "+ ms + ", Event: "+ event.returnValues.eventLog+", "+ "Winner: " + event.returnValues.winner + ", Prize Id :" + event.returnValues.tokenId;
        console.log(formatted);
        $("#monitor").append("<br/>"+formatted);
      });

    }).catch( async (err) => {
      console.log(err);
    });
  },

  startNewRound: function() {

    App.contracts.TRY.at(App.activeLottery).then(async(instance) => {

      instance.startNewRound({from: App.account}).then( (res) => {
        console.log(res);
        console.log("new round fired");
      }).catch((err) => {
        alert(err);
      });
    }).catch(async(err) => {
      console.log(err);
      alert("First of all, create a new lottery");
    });
    
  },

  drawNumbers: function() {

    App.contracts.TRY.at(App.activeLottery).then(async(instance) => {

      try{
        await instance.drawNumbers({from: App.account});
        console.log("Draw Numbers fired");
      }
      catch (error) {
        alert(error);
      }

    });
    
  },

  closeLottery: function() {

    App.contracts.TRY.at(App.activeLottery).then(async(instance) => {

      try{
        await instance.closeLottery({from: App.account});
        console.log("Close Lottery fired");
      }
      catch (error) {
        alert(error);
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
