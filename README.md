# Material of the P2P and Blockchains Course

## Folders

- contracts: contains the smart contracts
- - DAppContract.sol: Contract used for TRY DApp
- - Migrations.sol: Truffle's
- - TryKitty.sol: Contract used to show how to test a contract during the class

- migrations: Truffle's migration scripts folder

- src: contains the DApp html, js, and css files

## Execute the DApp

WARNING: tested on Google Chrome

- Install the dependencies web3, truffle-contract, lite-server (see package.json) with ``npm install``
- Run ganache with ``ganache -p 7545 -b 12``
- Compile the contracts with ``truffle compile``
- Migrate the contracts with ``truffle migrate --reset development``
- - Be aware the contracts are migrated on ganache at port 7545 (check truffle-config.js)
- - run the lite server with  ``npm run dev``
- - Go to the browser, open Metamask, connect Metamask to ganache and to the DApp (there should be a button "connect to DApp"), and import an account by copying and pasting a ganache private key under "import account"
- - Play with the (limited) DApp and check out the transactions outcomes
