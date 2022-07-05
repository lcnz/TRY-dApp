# Final Project - P2P Systems and Blockchains

## Execute the DApp

- Install ganache ``npm install ganache --global``
- cd ./TRY_dApp
- Install the dependencies web3, truffle-contract, lite-server (see package.json) with ``npm install``
- Run ganache with ``ganache -p 7545 -b 12``
- Compile the contracts with ``truffle compile``
- Migrate the contracts with ``truffle migrate --reset development``
- - Be aware the contracts are migrated on ganache at port 7545 (check truffle-config.js)
- - Go to the browser, open Metamask, connect Metamask to ganache and to the DApp, and import an account by copying and pasting a ganache private key under "import account"
- - run the lite server with  ``npm run dev``
- - Play with the DApp
- -IMPORTANT: in case of account change perform page refresh. if you run the test with two different pages and two different accounts before launching each action, check whether the account set up in Metamask is the correct one, if it is not, select it before launching the action.

