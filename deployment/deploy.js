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
const crypto = AeSDK.Crypto;
const toBytes = AeSDK.Bytes.toBytes;

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

    let keyPair = await crypto.generateKeyPair();
    // console.log(keyPair);
    // console.log(Node);
    
    // let spendRes = await client.spend(1, keyPair.publicKey)
    
    // console.log("----- spend tx ------");
    // console.log(spendRes);
    // console.log();


    const instance = await client.getContractInstance(contractSource);

    const rootHash = "39535EE4CA0870495A63034FB62857115B1D2DB04D71A229C93B18E59933729A";

    // eth address that would sign message (token's owner)
    const secretKey = '0xcbae6bb63d6466f214d50e24c5c483834bd0cc52f78c69b0a467dc273c6c3a14'

    const ethAddr = "0x20b9BD8fBf8520E141e937D42F514305704bC4E2".toUpperCase();
    const tokens = "3797337559826489344"
                //  1000000000000000000 = 1AE
    const leafIndex = 25;

     // !!! PS !!! =>> siblings should be passed in REVERSE order
     const siblings = [
        "A216AC75AE5818D78F6CCD35C34331EDE119CA5BA40089FA6B0AF98A652F1988",
        "4412DABEB9B4565C487AE17C1EE837D3804BC36EE1942F2A5B6C9C987DAC2C40",
        "2B09C8F74F3DB795689AAF1DB8C2A52E2EB5ACE15CA0FE43F3EFBE3AE276F570",
        "BC2DBEBEA7A5C6B40ABF87D2C299218EFA12981C246A1D44F83D61C2B683A4CA",
        "DE1E73DC0453EBD5A68D45F85D5341DE9BE4AD8CC244D90022B1D1F7FE0657CC"
        // "3AB5113A03BD541A704BFB24C1CE7BEFAF752DF088EF3C4BDEF7C936534E5647",
        // "70886EF10DBDF2FDB2CF145EC37BEE95E31BF9DA8444C924F03FFB8EAA63EF98",
        // "2FF80709DE5F2ED00142E2647E261A1CF934A0761CB8D14818199269B6E4ECB9",
        // "89C68E07F6887E0A9FB6F553A18752C6FB5F28ADAFE7E983B0B8342C93E136F2",
        // "62D2E1270D2BD08C51DA2E4A197540658553ACDB767B16AC55F28334C84C5553",
        // "A51C2763E3BA7671B9C8868E429FA52916E7FB34A41B471CBBE42703421F1307",
        // "C345D339283E1D15B77106B3D3C58C5980B37D4A69414EA634ECADC2CC889778",
        // "C74DEC9F3A5556F51D69201CC5C61B3BEE21E04451EEAE1E8590D6CE916FA431"
    ].reverse()

    let aeAddress = keyPair.publicKey;

    // console.log("==> ==> ==>");
    let result = await instance.deploy([ rootHash, 0 ])
    console.log("==> Contract was deployed to: ", result.address);

    // let temp = await client.balance(moneyKeyPair.publicKey)
    // console.log("Funder Balance:", temp);

    // FUNDING CONTACT
    let deposit = 10 * 1000000000000000000; // N * 1 AE
    let depositRes = await instance.methods.deposit({ amount: deposit })
    console.log("contract was funded with:", depositRes.decodedResult)

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

        
        // transfer
        // let transferRes = await instance.methods.transfer(
        //     aeAddress,
        //     depositRes.decodedResult / 10)

        // console.log("transferRes info:", transferRes)


        // migrate(amount_of_tokens: int, ae_address: address, leaf_index: int, siblings: list(string), eth_addr_str: string, eth_address: bytes(20), sig: bytes(65), msg_hash: hash) =
        // let migrateRes = await instance.methods.migrate(
        //     tokens, // "983047905794141508861952", 
        //     // toBytes("3797337559826489344"), // "983047905794141508861952", 
        //     aeAddress, 
        //     25, 
        //     [
        //         "A216AC75AE5818D78F6CCD35C34331EDE119CA5BA40089FA6B0AF98A652F1988",
        //         "4412DABEB9B4565C487AE17C1EE837D3804BC36EE1942F2A5B6C9C987DAC2C40",
        //         "2B09C8F74F3DB795689AAF1DB8C2A52E2EB5ACE15CA0FE43F3EFBE3AE276F570",
        //         "BC2DBEBEA7A5C6B40ABF87D2C299218EFA12981C246A1D44F83D61C2B683A4CA",
        //         "DE1E73DC0453EBD5A68D45F85D5341DE9BE4AD8CC244D90022B1D1F7FE0657CC"
        //     ], 
        //     "0x20b9BD8fBf8520E141e937D42F514305704bC4E2".toUpperCase(), 
        //     "0x20b9BD8fBf8520E141e937D42F514305704bC4E2".toUpperCase().substr(2), 
        //     "1ed7455938efdaa0709d8de24eba5b62dd2f035e82e7e46ff0a104972ec2266402663f8cbab895cc0791303c566c29b770d6730f077361b82d37b4c18987653e1c", 
        //     "8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0")

        console.log();
        console.log({
            tokens, // "983047905794141508861952", 
            aeAddress, 
            leafIndex, 
            siblings: siblings, 
            ethAddr, 
            ethAddr: ethAddr.substr(2), 
            sig: signedInfo.signature, 
            hashMsg: signedInfo.hashedMSg
        });
        console.log();

        let migrateRes = await instance.methods.migrate(
            tokens, // "983047905794141508861952", 
            aeAddress, 
            leafIndex, 
            siblings, // already reversed !!!! 
            ethAddr, 
            ethAddr.substr(2), 
            signedInfo.signature, 
            signedInfo.hashedMSg)
        
        console.log("Migration info:", migrateRes)

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
