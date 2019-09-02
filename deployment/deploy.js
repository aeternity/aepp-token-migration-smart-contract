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
const Deployer = require('aeproject-lib').Deployer;

const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Node = AeSDK.Node;
// const toBytes = AeSDK.Bytes.toBytes;

const ethers = require('ethers');
const fs = require('fs');

const deploy = async (network, privateKey, compiler, networkId) => {
    //let deployer = new Deployer(network, privateKey, compiler, networkId)

    let net = {};
    net.url = 'http://localhost:3001';
    net.internalUrl = net.url +'/internal';
    net.networkId = "ae_devnet";
    net.compilerUrl = 'http://localhost:3080';

    const contractSource = fs.readFileSync('./contracts/TokenMigration.aes', 'utf8'); 
    // const contractSource = fs.readFileSync('./contracts/test.aes', 'utf8'); 
    // const contractSource = fs.readFileSync('./cont/test.aes', 'utf8'); 

    let moneyKeyPair = { 
        publicKey: "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
        secretKey: "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca" 
    }


    // let keyPair = await crypto.generateKeyPair();
    // console.log(keyPair);
    // console.log(Node);

    const node = await Node({ url: net.url, internalUrl: net.internalUrl, forceCompatibility: true })
    const client = await Universal({
        // url: net.url,
        // internalUrl: net.url + '/internal',
        // keypair: moneyKeyPair,
        nodes: [ { name: 'ANY_NAME', instance: node } ],
        accounts: [AeSDK.MemoryAccount({
            keypair: moneyKeyPair
        })],
        nativeMode: true,
        networkId: net.networkId,
        compilerUrl: net.compilerUrl,
        forceCompatibility: true
    })

    const instance = await client.getContractInstance(contractSource);

    const rootHash = "74DF616B0BA7F0159B65617598A20244125BD887257C7C24F063B658EEE6370D";

    // eth address that would sign message (token's owner)
    const secretKey = '0x7d7ad7b1d16adb8b0312e60dff582e23616a307980de2ed90e76fb533817a1f1'

    const ethAddr = "0xbc7cc79364ed7177d1673c15233db60adcd61e11".toUpperCase();
    const tokens = "983047905794141508861952"
    const leafIndex = 10;

     // !!! PS !!! =>> siblings should be passed in REVERSE order
     const siblings = [
        "7B5B82FD4EAFB8C98F35CE4E758FB39001BF5308E6122F9F65646F6192EA4395",
        "F47D91E3E55C91B0044909ED0FD8E270BA88E932EF699562D1270F93092075D6",
        "4C35F853AA3ED9F89CA14E35F8EE4208E62011549943FA71A3C58AE1A35A5B35",
        "6A2BAF8A38980AADB210D0438D763D1A63851848971E4E1657E4E96AC4FA644C"
        // "3AB5113A03BD541A704BFB24C1CE7BEFAF752DF088EF3C4BDEF7C936534E5647",
        // "70886EF10DBDF2FDB2CF145EC37BEE95E31BF9DA8444C924F03FFB8EAA63EF98",
        // "2FF80709DE5F2ED00142E2647E261A1CF934A0761CB8D14818199269B6E4ECB9",
        // "89C68E07F6887E0A9FB6F553A18752C6FB5F28ADAFE7E983B0B8342C93E136F2",
        // "62D2E1270D2BD08C51DA2E4A197540658553ACDB767B16AC55F28334C84C5553",
        // "A51C2763E3BA7671B9C8868E429FA52916E7FB34A41B471CBBE42703421F1307",
        // "C345D339283E1D15B77106B3D3C58C5980B37D4A69414EA634ECADC2CC889778",
        // "C74DEC9F3A5556F51D69201CC5C61B3BEE21E04451EEAE1E8590D6CE916FA431"
    ]

    let aeAddress = 'ak_zPoY7cSHy2wBKFsdWJGXM7LnSjVt6cn1TWBDdRBUMC7Tur2NQ';

    // console.log("==> ==> ==>");
    let result = await instance.deploy([ rootHash, 0 ])
    console.log("==> Contract was deployed to: ", result.address);

    // return

    let i = 0;
    const maxIteration = 1;

    while (i < maxIteration) {

        let signedInfo = await ethSignature(secretKey);

        // [DEVELOP] check root hash
        // let isValid = await instance.methods.containedInTree(ethAddr, tokens, leafIndex, siblings.reverse());
        // console.log("is valid:", isValid.decodedResult);

        // [DEVELOP] get signer from signature
        // let getSigner = await instance.methods.getSigner(signedInfo.hashedMSg, signedInfo.signature)
        // console.log('signer addr:    >> ', signedInfo.address, ' <<');
        // console.log('recovered addr: >> ', getSigner.decodedResult, ' <<');

        console.log(ethAddr.substr(2))

        // let migrateRes = await instance.methods.migrate(tokens, aeAddress, leafIndex, siblings.reverse(), ethAddr, ethAddr.substr(2), signedInfo.signature, signedInfo.hashedMSg)
        let migrateRes = await instance.methods.migrate(
            "983047905794141508861952", 
            "ak_zPoY7cSHy2wBKFsdWJGXM7LnSjVt6cn1TWBDdRBUMC7Tur2NQ", 
            10, 
            ["6A2BAF8A38980AADB210D0438D763D1A63851848971E4E1657E4E96AC4FA644C","4C35F853AA3ED9F89CA14E35F8EE4208E62011549943FA71A3C58AE1A35A5B35","F47D91E3E55C91B0044909ED0FD8E270BA88E932EF699562D1270F93092075D6","7B5B82FD4EAFB8C98F35CE4E758FB39001BF5308E6122F9F65646F6192EA4395"], 
            "0XBC7CC79364ED7177D1673C15233DB60ADCD61E11", 
            "0XBC7CC79364ED7177D1673C15233DB60ADCD61E11".substr(2), 
            "1c2222b0291e085c2c0d49116f5c912888ad861a75f4a4d1406b2d10f8d1881ed11e436f84f0ea19fe05052d64a9eff4f90bb722af3898bc639202193c83091da1", 
            "8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0")
        
            // console.log("Migration info:", migrateRes)

        i++
    }

    async function ethSignature(secretKey){
        // WORKING EXAMPLE
        let wallet;
        if(!secretKey) {
            wallet = ethers.Wallet.createRandom();
        } else {
            wallet = new ethers.Wallet(secretKey);
        }

        const privateKey = wallet.signingKey.privateKey;
        const publicKey = wallet.signingKey.publicKey;
        const address = wallet.signingKey.address;

        console.log();
        console.log('--------- START -----------');
        console.log('address:', address);
        console.log('privateKey:', privateKey);
        console.log();

        // message
        let message = "world";
        
        let messageBytes = ethers.utils.toUtf8Bytes(message);
        let signedMsg = await wallet.signMessage(message);

        let messageDigest = ethers.utils.keccak256(messageBytes);
        // The hash we wish to sign and verify https://docs.ethers.io/ethers.js/html/cookbook-signing.html#id4
        // let hashedMsg = ethers.utils.id(message); // same as 'messageDigest'


        let recovered = await ethers.utils.verifyMessage(messageBytes, signedMsg)
        if (recovered !== address) {
            throw Error("Invalid signer!")
        }

        let signingKey = new ethers.utils.SigningKey(privateKey);
        let signature = signingKey.signDigest(messageDigest);

        sig = (signature.v == 27 ? '1b' : '1c') + signature.r.substr(2) + signature.s.substr(2)
 

        let result = {
            hashedMSg: messageDigest.substr(2),
            signature: sig,
            address
        }

        return result
    }
};

module.exports = {
    deploy
};
