/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */


const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Node = AeSDK.Node;
const crypto = AeSDK.Crypto;

const ethers = require('ethers');
const fs = require('fs');

const ONE_AE = 1000000000000000000;

const contractSource = fs.readFileSync('./contracts/TokenMigration.aes', 'utf8'); 

const network = {
    url: 'http://localhost:3001',
    internalUrl: 'http://localhost:3001/internal',
    networkId: "ae_devnet",
    compilerUrl: 'http://localhost:3080'
}

const keyPair = { 
    publicKey: "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
    secretKey: "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca" 
}

// const ethSecretKey = '0xcbae6bb63d6466f214d50e24c5c483834bd0cc52f78c69b0a467dc273c6c3a14'
const tokenOwnerInfo = {
    rootHash: "C157111DB92FAFB1EE7C78B93424BC6F6A35DFE14CECA121F8528D4E8360CB2C",
    ethAddr: "0xedc6942e1fbbbd8d592123c16e00d8058b396bf2".toUpperCase(),
    ethSecretKey: '0x808580ffc2548bb65ca62754c31a6e2faf1a27da4c52e40be0f24bb452f3bb4b',
    tokens: "896946881386313856",
    leafIndex: 17,
    siblings: [
        "D477BC2283558E13BD236EBC12F00BD41825E07F003CFD1C414EAA61323A9B30",
        "E03C0C82C6073966F29125656A189E477AEBCAB7D3F087492E6ADAA58775031D",
        "5EF94B5DE05D8CD99B7AC33D94767FC38A80FF9E935100DFA501A038953042E1",
        "27C8F150F0FF3C98E2E5449FD8CD0DF3F935D4009FE5CBBAECB67C01657A32B4",
        "A8D5C7ADBD530EC96F5F2286ADE61A88A5394F32EB12A3C5E348158295CA2FCB",
        "539A95A2444C822F882017FFD3BCC4FEA7D7A63D2D2EC308765D3AC703E86784"
    ].reverse(),
    hashedMsg: "8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0",
    signature: "1b49d246e634360b98e8fd3d44470efb86b1631dccedec50e19ebee925a31e506816a369f67ee8ab292af8b9fe447a69768d7ac76f96e617db29047b5760a41af5"
};

const anotherTokenOwnerInfo = {
    rootHash: "C157111DB92FAFB1EE7C78B93424BC6F6A35DFE14CECA121F8528D4E8360CB2C",
    ethAddr: "0x3963a38ee57d6F644895B7Ec95Bd88b578A966Cc".toUpperCase(),
    ethSecretKey: '0xcde1a2e323c11bee0423c08c204924514335a5a03c8a5e7c699d50d910341d01',
    tokens: "1028776552391213184",
    leafIndex: 27,
    siblings: [ "8C8D76205A6D012DE4312921BE14FB2A434C50744DBD725FF508C45FB474325E",
        "07631079CE0D8E3C3D2AAAA742BE2E98F5033F74133CEC7D4A38D75CF069E735",
        "28BE0BDA3B3BF132B01012ECE971ED5468DDE5AF77B9F0800979F6B3EAB9A427",
        "6FAC74126B96DE7E0055437F54E6D2E827C66D3D276A6F85BA8BC4CD41672DB8",
        "A8D5C7ADBD530EC96F5F2286ADE61A88A5394F32EB12A3C5E348158295CA2FCB",
        "539A95A2444C822F882017FFD3BCC4FEA7D7A63D2D2EC308765D3AC703E86784" ].reverse(),
    hashedMsg: "8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0",
    signature: "1c49693957d84bade7c3e402655cf92ed9e41f8592685d31c0f2e54c3f166fab1b31fd4e99c55179415190a5af780a166856f880d9caaeed3f7d4bdba7ae3bcd7d"
};

describe('Token Migration', async function () {

    let client;
    let instance;
    let node;

    before(async function(){

        let randomKeyPair = await crypto.generateKeyPair();
        tokenOwnerInfo.aeAddress = randomKeyPair.publicKey;

        node = await Node({ url: network.url, internalUrl: network.internalUrl, forceCompatibility: true })
        client = await Universal({
            nodes: [ { name: 'ANY_NAME', instance: node } ],
            accounts: [AeSDK.MemoryAccount({
                keypair: keyPair
            })],
            nativeMode: false,
            networkId: network.networkId,
            compilerUrl: network.compilerUrl,
            forceCompatibility: true
        })

        instance = await client.getContractInstance(contractSource);
    })

    describe('Deploy', () => {
    
        it('Is deployment fulfilled', async () => {
            await assert.isFulfilled(instance.deploy([ "0xSomeRoot", 0 ]), 'Could not deploy the Token Migration Smart Contract');
        })
    
        it('Check deploy info result', async () => {
            const deployInfo = await instance.deploy([ "0xSomeRoot", 0 ]);

            let propsShouldHave = deployInfo.owner && deployInfo.transaction && deployInfo.address && deployInfo.createdAt && deployInfo.result && deployInfo.rawTx;
            
            assert.isOk(propsShouldHave, "Contract was not deployed correctly")
        })
    })

    describe('Init', () => {

        const migrationsCount = 91;

        before(async function() {
            await instance.deploy([ tokenOwnerInfo.rootHash, migrationsCount ]);
        })
    
        it('Root hash should be same as deployed one', async () => {

            let response = await instance.methods.root_hash();
            
            assert.isOk(tokenOwnerInfo.rootHash === response.decodedResult, "Root hash does not match")
        })

        it('Contract balance should be 0', async () => {

            let response = await instance.methods.balance();
            assert.isOk(0 == response.decodedResult, "Balance is not 0");
        })

        it('Migrations count should be 0', async () => {

            let response = await instance.methods.migrations_count();
            
            assert.isOk(migrationsCount === response.decodedResult, "Root hash does not match")
        })

        it('Should not have migrated ethereum address', async () => {

            for (let i = 0; i < 10; i++) {
                let randomWallet = ethers.Wallet.createRandom();
                let ethAddress = randomWallet.signingKey.address;

                let response = await instance.methods.is_migrated(ethAddress);
                
                assert.isOk(!response.decodedResult, "There is migrated ethereum address")
            }
        })
    })

    describe('Functionality', function() {
        let notOwnerInstance;

        beforeEach(async function() {
            this.timeout(50000);
            
            let response = await instance.deploy([ tokenOwnerInfo.rootHash, 0 ]);
            let contractAddress = response.address;

            let notOwnerKeyPair = await crypto.generateKeyPair();
            tokenOwnerInfo.aeAddress = notOwnerKeyPair.publicKey;

            await client.spend(2 * ONE_AE, notOwnerKeyPair.publicKey)

            let notOwnerClient = await Universal({
                nodes: [ { name: 'ANY_NAME', instance: node } ],
                accounts: [AeSDK.MemoryAccount({
                    keypair: notOwnerKeyPair
                })],
                nativeMode: false,
                networkId: network.networkId,
                compilerUrl: network.compilerUrl,
                forceCompatibility: true
            })

            notOwnerInstance = await notOwnerClient.getContractInstance(contractSource, { contractAddress: contractAddress });
        })

        it('Should successfully fund "deposit" contract. [PAYABLE] functionality, if not should throw exception', async () => {
            let deposit = 10 * 1000000000000000000; // N * 1 AE
            let depositRes = await instance.methods.deposit({ amount: deposit });
            assert.isOk(deposit == depositRes.decodedResult, "Mismatch between deposit balance");

            let contractBalanceResult = await instance.methods.balance();
            assert.isOk(deposit == contractBalanceResult.decodedResult, "Get balance returns invalid amount.");
        })
    
        it('Should successfully change root hash', async () => {

            const tempRootHash = 'some-root';

            await instance.methods.update_root(tempRootHash)
            let response = await instance.methods.root_hash();
            
            assert.isOk(tempRootHash === response.decodedResult, "Root hash does not match")
        })

        it('Should successfully change migrations count', async () => {

            const tempMigrationsCount = 53;

            await instance.methods.update_migrations_count(tempMigrationsCount)
            let response = await instance.methods.migrations_count();
            
            assert.isOk(tempMigrationsCount === response.decodedResult, "Root hash does not match")
        })

        it('[NEGATIVE] Not owner should not update migrations count', async () => {
            assert.isRejected(notOwnerInstance.methods.update_migrations_count(566), "Owner require")
        })

        it('[NEGATIVE] Not owner should not update root hash', async () => {
            assert.isRejected(notOwnerInstance.methods.update_root("566_root"), "Owner require")
        })
    })

    describe('Migration', function() {

        beforeEach(async function() {
            await instance.deploy([ tokenOwnerInfo.rootHash, 0 ]);
            
            let notOwnerKeyPair = await crypto.generateKeyPair();
            tokenOwnerInfo.aeAddress = notOwnerKeyPair.publicKey;
        })

        it('Should migrate tokens ', async () => {
            let deposit = 10 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            await instance.methods.migrate(
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress, 
                tokenOwnerInfo.leafIndex, 
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.ethAddr, 
                tokenOwnerInfo.ethAddr.substr(2), 
                tokenOwnerInfo.signature, 
                tokenOwnerInfo.hashedMsg);

            let response = await instance.methods.migrations_count()
            assert.isOk(1 == response.decodedResult, "Migrations count is invalid")         
        })

        // // should validate event data
        // it('Should migrate tokens ', async () => {
        //     let deposit = 10 * 1000000000000000000;
        //     await instance.methods.deposit({ amount: deposit })

        //     let response = await instance.methods.migrate(
        //         tokenOwnerInfo.tokens,
        //         tokenOwnerInfo.aeAddress, 
        //         tokenOwnerInfo.leafIndex, 
        //         tokenOwnerInfo.siblings,
        //         tokenOwnerInfo.ethAddr, 
        //         tokenOwnerInfo.ethAddr.substr(2), 
        //         tokenOwnerInfo.signature, 
        //         tokenOwnerInfo.hashedMsg);

        //     console.log(response.result.log);

        //     let response = await instance.methods.migrations_count()
        //     assert.isOk(1 == response.decodedResult, "Migrations count is invalid")         
        // })

        it('[Negative] Should not migrate tokens if contract have not been funded', async () => {
    

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Should not migrate tokens when contract is not funded")
            } catch (error) {
                assert.isOk(error.message.includes('out_of_gas'), "Should not migrate tokens when contract is not funded");
            }
        })


        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid ehtereum address', async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            const invalidEthAddr = '0x20b9BD8fBf8530E141e937D42F514305704bC4E2'.toUpperCase();

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    invalidEthAddr, 
                    invalidEthAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with invalid ethereum address")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Should not migrate tokens when invalid ethereum address is passed");
            }
        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid token amount', async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            try {
                await instance.methods.migrate(
                    123,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with invalid token amount")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Should not migrate tokens when invalid token amount is passed");
            }

        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid merkle tree siblings', async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            const invalidSiblings = [
                "A216AC75AE5818D78F6CCD35C34331EDE119CA5BA40089FA6B0AF98A652F1988",
                "4412DABEB9B4565C487AE17C1EE837D3804BC36EE1942F2A5B6C9C987DAC2C40",
                "AA2DBEBEA7A5C6B40ABF87D2C299218EFA12981C246A1D44F83D61C2B683A4CA",
                "BC2DBEBEA7A5C6B40ABF87D2C299218EFA12981C246A1D44F83D61C2B683A4CA",
                "DE1E73DC0453EBD5A68D45F85D5341DE9BE4AD8CC244D90022B1D1F7FE0657CC",
                "3AB5113A03BD541A704BFB24C1CE7BEFAF752DF088EF3C4BDEF7C936534E5647",
                "70886EF10DBDF2FDB2CF145EC37BEE95E31BF9DA8444C924F03FFB8EAA63EF98",
                "2FF80709DE5F2ED00142E2647E261A1CF934A0761CB8D14818199269B6E4ECB9",
            ]

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    invalidSiblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with invalid merkle tree siblings")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to generate same merkle tree root hash");
            }
        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid merkle tree leaf index', async () => {

            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    1, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with invalid merkle tree leaf index")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to generate same merkle tree root hash");
            } 
        })

        // // try to migrate same eth address twice
        it('[NEGATIVE] Should not migrate tokens twice', async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            await instance.methods.migrate(
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress, 
                tokenOwnerInfo.leafIndex, 
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.ethAddr, 
                tokenOwnerInfo.ethAddr.substr(2), 
                tokenOwnerInfo.signature, 
                tokenOwnerInfo.hashedMsg);

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with same ethereum address")
            } catch (error) {
                assert.isOk(error.message.includes('This account has already transferred its tokens'), "Error message is not that should be. Should not be able to migrate twice same ethereum address");
            }

            let response = await instance.methods.migrations_count()
            assert.isOk(1 == response.decodedResult, "Migrations count is invalid")
        })

        it('Should migrate tokens from different ethereum addresses', async () => {
            let deposit = 20 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            await instance.methods.migrate(
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress, 
                tokenOwnerInfo.leafIndex, 
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.ethAddr, 
                tokenOwnerInfo.ethAddr.substr(2), 
                tokenOwnerInfo.signature, 
                tokenOwnerInfo.hashedMsg);

            let randomKeyPair = await crypto.generateKeyPair();
            anotherTokenOwnerInfo.aeAddress = randomKeyPair.publicKey;

            await instance.methods.migrate(
                anotherTokenOwnerInfo.tokens,
                anotherTokenOwnerInfo.aeAddress, 
                anotherTokenOwnerInfo.leafIndex, 
                anotherTokenOwnerInfo.siblings,
                anotherTokenOwnerInfo.ethAddr, 
                anotherTokenOwnerInfo.ethAddr.substr(2), 
                anotherTokenOwnerInfo.signature, 
                anotherTokenOwnerInfo.hashedMsg);

            let response = await instance.methods.migrations_count();
            assert.isOk(2 == response.decodedResult, "Migrations count is invalid");

            response = await instance.methods.is_migrated(tokenOwnerInfo.ethAddr);
            assert.isOk(response.decodedResult, "Eth address should be migrated");

            response = await instance.methods.is_migrated(anotherTokenOwnerInfo.ethAddr);
            assert.isOk(response.decodedResult, "Eth address should be migrated");
        })

        // // negative pass invalid hashed msg
        it("[NEGATIVE] Should not migrate with invalid hashed message", async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    tokenOwnerInfo.signature, 
                    "AA52c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0")
    
                assert.isOk(false, "Migrated has been passed with invalid hashed message")
            } catch (error) {
                assert.isOk(error.message.includes('Mismatch between passed eth address and recovered one'), "Error message is not that should be. Should not be able to recover ethereum address");
            }
        })

        // // negative pass invalid signature
        it("[NEGATIVE] Should not migrate with invalid signature", async () => {
            let deposit = 5 * 1000000000000000000;
            await instance.methods.deposit({ amount: deposit })

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress, 
                    tokenOwnerInfo.leafIndex, 
                    tokenOwnerInfo.siblings,  
                    tokenOwnerInfo.ethAddr, 
                    tokenOwnerInfo.ethAddr.substr(2), 
                    "1b2ed7455938efdaa0709d8de24eba5b62dd2f035e82e7e46ff0a104972ec2266402663f8cbab895cc0791303c566c29b770d6730f077361b82d37b4c18987653e", 
                    tokenOwnerInfo.hashedMsg)
    
                assert.isOk(false, "Migrated has been passed with invalid signature")
            } catch (error) {
                assert.isOk(error.message.includes('Mismatch between passed eth address and recovered one'), "Error message is not that should be. Should not be able to recover ethereum address");
            }
        })
    })
})