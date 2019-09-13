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
    ],
    hashedMsg: "259c99268998ec1ad242b9aa2f35ae82e1f02b0788128e8c3b2eb021a25730aa",
    signature: "1bcc6728ed7eedb93d2fae73699a4bc58e8518fe1f6c73e7fe2717c6c0daaeebb816ab86bdf17212a4b171e5c9464d89f3c4863cfe31c92c30717729b2ffabadc9"
};

const anotherKeyPair = {
    publicKey: "ak_tWZrf8ehmY7CyB1JAoBmWJEeThwWnDpU4NadUdzxVSbzDgKjP",
    secretKey: "7fa7934d142c8c1c944e1585ec700f671cbc71fb035dc9e54ee4fb880edfe8d974f58feba752ae0426ecbee3a31414d8e6b3335d64ec416f3e574e106c7e5412"
}

const anotherTokenOwnerInfo = {
    rootHash: "C157111DB92FAFB1EE7C78B93424BC6F6A35DFE14CECA121F8528D4E8360CB2C",
    ethAddr: "0x3963a38ee57d6F644895B7Ec95Bd88b578A966Cc".toUpperCase(),
    ethSecretKey: '0xcde1a2e323c11bee0423c08c204924514335a5a03c8a5e7c699d50d910341d01',
    tokens: "1028776552391213184",
    leafIndex: 27,
    siblings: ["8C8D76205A6D012DE4312921BE14FB2A434C50744DBD725FF508C45FB474325E",
        "07631079CE0D8E3C3D2AAAA742BE2E98F5033F74133CEC7D4A38D75CF069E735",
        "28BE0BDA3B3BF132B01012ECE971ED5468DDE5AF77B9F0800979F6B3EAB9A427",
        "6FAC74126B96DE7E0055437F54E6D2E827C66D3D276A6F85BA8BC4CD41672DB8",
        "A8D5C7ADBD530EC96F5F2286ADE61A88A5394F32EB12A3C5E348158295CA2FCB",
        "539A95A2444C822F882017FFD3BCC4FEA7D7A63D2D2EC308765D3AC703E86784"
    ],
    hashedMsg: "6f9d9941c009e57c5f03ed21311128963508c043139d08cd0d672de5b992a05a",
    signature: "1c7eda90e754baa9f6a9a0abd19a919fe166f91c0a63e29ad558aa3720cf737d781689107fc4e9fa14f53268bf75a03356758284a6aa46a0049b37b33945d2f018"
};

describe('Token Migration', async function () {

    let client;
    let instance;
    let node;
    let notFundedInstance;

    before(async function () {

        let randomKeyPair = await crypto.generateKeyPair();
        tokenOwnerInfo.aeAddress = randomKeyPair.publicKey;

        const UniversalFate = Universal.compose({
            props: {
                compilerOptions: {
                    backend: 'fate'
                },
                vmVersion: 5,
                abiVersion: 3
            }
        })

        node = await Node({
            url: network.url,
            internalUrl: network.internalUrl,
            forceCompatibility: true
        })
        client = await UniversalFate({
            nodes: [{
                name: 'ANY_NAME',
                instance: node
            }],
            accounts: [AeSDK.MemoryAccount({
                keypair: keyPair
            })],
            nativeMode: false,
            networkId: network.networkId,
            compilerUrl: network.compilerUrl,
            forceCompatibility: true,

        })

        instance = await client.getContractInstance(contractSource, {
            backend: 'fate',
            vmVersion: 5,
            abiVersion: 3
        });
        notFundedInstance = await client.getContractInstance(contractSource);
    })

    describe('Deploy', () => {

        it('Is deployment fulfilled', async () => {

            await assert.isFulfilled(instance.deploy(["0xSomeRoot", 0], {
                amount: 10 * 1000000000000000000,
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            }))

        })

        it('Check deploy info result', async () => {
            const deployInfo = await instance.deploy(["0xSomeRoot", 0], {
                amount: 10 * 1000000000000000000,
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            let propsShouldHave = deployInfo.owner && deployInfo.transaction && deployInfo.address && deployInfo.createdAt && deployInfo.result && deployInfo.rawTx;

            assert.isOk(propsShouldHave, "Contract was not deployed correctly")
        })
    })

    describe('Init', () => {

        const migrationsCount = 91;

        before(async function () {
            await instance.deploy([tokenOwnerInfo.rootHash, migrationsCount], {
                amount: 10 * 1000000000000000000,
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
        })

        it.only('Root hash should be same as deployed one', async () => {

            let response = await instance.call("root_hash", [], {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            // let response = await instance.methods.root_hash({
            //     backend: 'fate',
            //     vmVersion: 5,
            //     abiVersion: 3
            // });
            console.log(response)
            assert.isOk(tokenOwnerInfo.rootHash === response.decodedResult, "Root hash does not match")
        })

        it('Contract balance should be 0', async () => {

            await notFundedInstance.deploy([tokenOwnerInfo.rootHash, 0], {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            let response = await notFundedInstance.methods.balance({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            assert.isOk(0 == response.decodedResult, "Balance is not 0");
        })

        it('Migrations count should be 0', async () => {

            let response = await instance.methods.migrations_count({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            assert.isOk(migrationsCount === response.decodedResult, "Root hash does not match")
        })

        it('Should not have migrated ethereum address', async () => {

            for (let i = 0; i < 10; i++) {
                let randomWallet = ethers.Wallet.createRandom();
                let ethAddress = randomWallet.signingKey.address;

                let response = await instance.methods.is_migrated(ethAddress, {
                    backend: 'fate',
                    vmVersion: 5,
                    abiVersion: 3
                });

                assert.isOk(!response.decodedResult, "There is migrated ethereum address")
            }
        })
    })

    describe('Functionality', function () {
        let notOwnerInstance;

        beforeEach(async function () {
            this.timeout(50000);

            let response = await instance.deploy([tokenOwnerInfo.rootHash, 0], {
                amount: 10 * 1000000000000000000,
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            let contractAddress = response.address;

            let notOwnerKeyPair = await crypto.generateKeyPair();
            tokenOwnerInfo.aeAddress = notOwnerKeyPair.publicKey;

            await client.spend(2 * ONE_AE, notOwnerKeyPair.publicKey)

            let notOwnerClient = await Universal({
                nodes: [{
                    name: 'ANY_NAME',
                    instance: node
                }],
                accounts: [AeSDK.MemoryAccount({
                    keypair: notOwnerKeyPair
                })],
                nativeMode: false,
                networkId: network.networkId,
                compilerUrl: network.compilerUrl,
                forceCompatibility: true
            })

            notOwnerInstance = await notOwnerClient.getContractInstance(contractSource, {
                contractAddress: contractAddress
            });
        })

        it('Should successfully fund "deposit" contract. [PAYABLE] functionality, if not should throw exception', async () => {
            let deposit = 10000000000000000000
            let contractBalanceResult = await instance.methods.balance({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            assert.isOk(deposit == contractBalanceResult.decodedResult, "Get balance returns invalid amount.");
        })
        //Skiping for now, if we all agree to remove the func I will also remove the tests
        xit('Should successfully change root hash', async () => {

            const tempRootHash = 'some-root';

            await instance.methods.update_root(tempRootHash, {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            })
            let response = await instance.methods.root_hash({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            assert.isOk(tempRootHash === response.decodedResult, "Root hash does not match")
        })
        //Skiping for now, if we all agree to remove the func I will also remove the tests
        xit('[NEGATIVE] Not owner should not update root hash', async () => {
            assert.isRejected(notOwnerInstance.methods.update_root("566_root", {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            }), "Owner require")
        })
    })

    describe('Migration', function () {

        beforeEach(async function () {
            await instance.deploy([tokenOwnerInfo.rootHash, 0], {
                amount: 10 * 1000000000000000000,
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            let notOwnerKeyPair = await crypto.generateKeyPair();
            tokenOwnerInfo.aeAddress = 'ak_2nz23cBQyQXKrCjUJ7UgiDoN9Fq8Co9m5zM99iYg9XMQtToWZi';
        })

        it.only('Should migrate tokens ', async () => {

            let migrate = await instance.call("migrate", [
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress,
                tokenOwnerInfo.leafIndex,
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.signature
            ], {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            // let migrate = await instance.methods.migrate(
            //     tokenOwnerInfo.tokens,
            //     tokenOwnerInfo.aeAddress,
            //     tokenOwnerInfo.leafIndex,
            //     tokenOwnerInfo.siblings,
            //     tokenOwnerInfo.signature, {
            //         backend: 'fate',
            //         vmVersion: 5,
            //         abiVersion: 3
            //     });

            // let response = await instance.methods.migrations_count({
            //     backend: 'fate',
            //     vmVersion: 5,
            //     abiVersion: 3
            // })

            let response = await instance.call("migrations_count", [], {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            })
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
            await notFundedInstance.deploy([tokenOwnerInfo.rootHash, 0], {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });

            try {
                await notFundedInstance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress,
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    });


                assert.isOk(false, "Should not migrate tokens when contract is not funded")
            } catch (error) {
                assert.isOk(error.message.includes('Error in spend: insufficient_funds'), "Should not migrate tokens when contract is not funded");
            }
        })


        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid signature, eth address is not in root', async () => {

            const invalidSignature = '2c43985fce5182c64f32e37cc452d0b869f1a3c1d6fae5624ed50d7cb3e011d062f92077b166c7551925bb39ce698b5c570538739a30ae6b3e8153092acca0c71c'

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress,
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    invalidSignature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid ethereum address")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Should not migrate tokens when invalid ethereum address is passed");
            }
        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid token amount', async () => {

            try {
                await instance.methods.migrate(
                    123,
                    tokenOwnerInfo.aeAddress,
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid token amount")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Should not migrate tokens when invalid token amount is passed");
            }

        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid merkle tree siblings', async () => {

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
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid merkle tree siblings")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to generate same merkle tree root hash");
            }
        })

        it('[NEGATIVE] Should not reproduce same merkle tree root hash with invalid merkle tree leaf index', async () => {

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress,
                    1,
                    tokenOwnerInfo.siblings,
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid merkle tree leaf index")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to generate same merkle tree root hash");
            }
        })

        // // try to migrate same eth address twice
        it('[NEGATIVE] Should not migrate tokens twice', async () => {

            await instance.methods.migrate(
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress,
                tokenOwnerInfo.leafIndex,
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.signature, {
                    backend: 'fate',
                    vmVersion: 5,
                    abiVersion: 3
                });

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress,
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with same ethereum address")
            } catch (error) {
                assert.isOk(error.message.includes('This account has already transferred its tokens'), "Error message is not that should be. Should not be able to migrate twice same ethereum address");
            }

            let response = await instance.methods.migrations_count({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            })
            assert.isOk(1 == response.decodedResult, "Migrations count is invalid")
        })

        it('Should migrate tokens from different ethereum addresses', async () => {

            await instance.methods.migrate(
                tokenOwnerInfo.tokens,
                tokenOwnerInfo.aeAddress,
                tokenOwnerInfo.leafIndex,
                tokenOwnerInfo.siblings,
                tokenOwnerInfo.signature, {
                    backend: 'fate',
                    vmVersion: 5,
                    abiVersion: 3
                });

            let randomKeyPair = await crypto.generateKeyPair();
            anotherTokenOwnerInfo.aeAddress = randomKeyPair.publicKey;

            await instance.methods.migrate(
                anotherTokenOwnerInfo.tokens,
                anotherKeyPair.publicKey,
                anotherTokenOwnerInfo.leafIndex,
                anotherTokenOwnerInfo.siblings,
                anotherTokenOwnerInfo.signature, {
                    backend: 'fate',
                    vmVersion: 5,
                    abiVersion: 3
                });

            let response = await instance.methods.migrations_count({
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            assert.isOk(2 == response.decodedResult, "Migrations count is invalid");

            response = await instance.methods.is_migrated(tokenOwnerInfo.ethAddr, {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            assert.isOk(response.decodedResult, "Eth address should be migrated");

            response = await instance.methods.is_migrated(anotherTokenOwnerInfo.ethAddr, {
                backend: 'fate',
                vmVersion: 5,
                abiVersion: 3
            });
            assert.isOk(response.decodedResult, "Eth address should be migrated");
        })

        // // negative pass invalid hashed msg
        it("[NEGATIVE] Should not migrate with invalid aeternity address", async () => {

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    "ak_ZLqPe9J2qenismR9FoJ93zJs8To91LQH9iVb2X4HRkRKMpxXt",
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    tokenOwnerInfo.signature, {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid hashed message")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to recover ethereum address");
            }
        })

        // // negative pass invalid signature
        it("[NEGATIVE] Should not migrate with invalid signature", async () => {

            try {
                await instance.methods.migrate(
                    tokenOwnerInfo.tokens,
                    tokenOwnerInfo.aeAddress,
                    tokenOwnerInfo.leafIndex,
                    tokenOwnerInfo.siblings,
                    "1b2ed7455938efdaa0709d8de24eba5b62dd2f035e82e7e46ff0a104972ec2266402663f8cbab895cc0791303c566c29b770d6730f077361b82d37b4c18987653e", {
                        backend: 'fate',
                        vmVersion: 5,
                        abiVersion: 3
                    })

                assert.isOk(false, "Migrated has been passed with invalid signature")
            } catch (error) {
                assert.isOk(error.message.includes('From provided data, cannot be generated same root'), "Error message is not that should be. Should not be able to recover ethereum address");
            }
        })
    })
})