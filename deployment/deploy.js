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
const toBytes = AeSDK.Bytes.toBytes;

const ethers = require('ethers');
const fs = require('fs');

const deploy = async (network, privateKey, compiler, networkId) => {
    //let deployer = new Deployer(network, privateKey, compiler, networkId)

    let net = {};
    net.url = 'http://localhost:3001';
    net.internalUrl = 'http://localhost:3001/internal';
    net.networkId = "ae_devnet";
    net.compilerUrl = 'http://localhost:3080';
    const contractSource = fs.readFileSync('./contracts/TokenMigration.aes', 'utf8'); 

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

    let source = fs.readFileSync('./contracts/TokenMigration.aes', 'utf8');
// source = `
// contract Test =
//   record state = 
//     { data: string }

//   entrypoint init(root_hash: string) : state = 
//     { data = root_hash }

//   entrypoint get() = state.data`

    const instance = await client.getContractInstance(source);

    console.log("==> instance <--");
    // console.log(instance);

// \"contract TokenMigration =\n  type state = ()\n  entrypoint hello(x: string) = x\"
    // curl -H "Content-Type: application/json" -d "{\"code\":\"contract TokenMigration =\n  type state = ()\n  entrypoint hello(x: string) = x\",\"options\":{\"backend\":\"aevm\"}}" -X POST http://localhost:3080/compile

    // curl -H "Content-Type: application/json" -d "{\"code\":\"contract TokenMigration =\n  type state = ()\n  entrypoint hello(x: string) = x\",\"options\":{\"backend\":\"aevm\"}}" -X POST http://localhost:3080/compile
    // curl -H "Content-Type: application/json" -d "{\"code\":\"contract TokenMigration =\n  record state = {data: int}\n  entrypoint init() = { data = 5}\n  entrypoint hello(x: string) = x\",\"options\":{\"backend\":\"aevm\"}}" -X POST http://localhost:3080/compile

    // curl -H "Content-Type: application/json" -d "{\"function\":\"init\",\"arguments\":[\"\\\"my string\\\"\"],\"source\":\"contract Test =\n  record state = {data: string}\n  entrypoint init(x: string) = {data = x}\n  entrypoint hello(x: int) = x\",\"options\":{\"backend\":\"aevm\"}}" -X POST http://localhost:3080/encode-calldata

    // let result = await instance.deploy([rootHash], {})
    // console.log("Contract was deployed to: ", result.address);

    const rootHash = "2A8E3173A64C1890CFD9E44EE3FB8C993FB2D3FB5FBF926812CA46DC925253AF";

    const ethAddr = "0x18c4a229411ec44fc0ddfc7fd02e31fc1872a6e1".toLocaleLowerCase()
    const tokens = "449437408529709982023680"
    const index = 2345;

     // !!! PS !!! =>> siblings should be passed in REVERSE order
     const siblings = [
        "D28F693728229E4AF6A2C8D263E0F35BAB2B659CA98ADBB24F250017E8FEE16B",
        "C8A76985CC36C37D79A33028537D7B5EBA04CFA51A1AB78E9C6ADCC7FDCBDA02",
        "A8CA3099A8DF1D48E27D8A7C87440594E644C4816E6AA38C57D03FE8AFE8F88C",
        "800079F085CA51B0BC4D0D2E5B22A2B0E3FBA899C6F3A7596D270EFB26367FCF",
        "3AB5113A03BD541A704BFB24C1CE7BEFAF752DF088EF3C4BDEF7C936534E5647",
        "70886EF10DBDF2FDB2CF145EC37BEE95E31BF9DA8444C924F03FFB8EAA63EF98",
        "2FF80709DE5F2ED00142E2647E261A1CF934A0761CB8D14818199269B6E4ECB9",
        "89C68E07F6887E0A9FB6F553A18752C6FB5F28ADAFE7E983B0B8342C93E136F2",
        "62D2E1270D2BD08C51DA2E4A197540658553ACDB767B16AC55F28334C84C5553",
        "A51C2763E3BA7671B9C8868E429FA52916E7FB34A41B471CBBE42703421F1307",
        "C345D339283E1D15B77106B3D3C58C5980B37D4A69414EA634ECADC2CC889778",
        "C74DEC9F3A5556F51D69201CC5C61B3BEE21E04451EEAE1E8590D6CE916FA431"
    ]

    let aeAddress = 'ak_zPoY7cSHy2wBKFsdWJGXM7LnSjVt6cn1TWBDdRBUMC7Tur2NQ';

    console.log("==> ==> ==>");
    let result = await instance.deploy(['2A8E3173A64C1890CFD9E44EE3FB8C993FB2D3FB5FBF926812CA46DC925253AF'])
    console.log("==> Contract was deployed to: ", result.address);

    // console.log('->', toBytes(ethAddr).length);
    // console.log('->', Buffer.from(ethAddr).toString('hex'));

    let ethAsBytes = toBytes(ethAddr.substr(2));
    // let ethAsBytes = toBytes(ethAddr).substr(2);
    // let ethAsBytes = Buffer.from(ethAddr.substr(2)).toString('hex')
    console.log('ethAsBytes:', ethAsBytes);
    console.log('length', ethAsBytes.length);

    let aa = await ethSignature();

    let signMsgAsBytes = toBytes(aa.signMsg.substr(2))
    let digestAsBytes = toBytes(aa.digest.substr(2))


    // let instance = await deployer.deploy("./contracts/TokenMigration.aes", [rootHash]);

    // migrate(amountOfTokens: string, aeAddress: string, leafIndex: int, siblings: list(string), ethAddress: bytes(20), sig: bytes(65), msgHash: hash) =
    let migrateRes = await instance.methods.migrate(tokens, aeAddress, index, siblings.reverse(), ethAsBytes, ethAddr, signMsgAsBytes, digestAsBytes)
    console.log("is migrated:", migrateRes.decodedResult);

    // let isValid = await instance.methods.containedInTree(ethAddr, tokens, index, siblings.reverse());
    // console.log("is valid:", isValid.decodedResult);

    async function ethSignature(){
        let wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.signingKey.privateKey;
        const publicKey = wallet.signingKey.publicKey;
        const address = wallet.signingKey.address;
    
        console.log()
        console.log("_________________________________");
        console.log("privateKey", privateKey);
        console.log("publicKey", publicKey);
        console.log("address", address);
        console.log()
    
    
        // message
        let message = "Hello World";
        let messageBytes = ethers.utils.toUtf8Bytes(message);
        let messageDigest = ethers.utils.keccak256(messageBytes);
        console.log("Digest: " + messageDigest);
    
        // signing
        let signingKey = new ethers.utils.SigningKey(privateKey);
        let signature = signingKey.signDigest(messageDigest);
        let signMsg = await wallet.signMessage(messageBytes);
    
        console.log("sign digest", signature);
        console.log("signed msg", sig);
        console.log("signed msg length", sig.length);
        console.log("_________________________________");
        console.log()

        return {
            digest: messageDigest,
            signDigest, 
            signMsg
        }
    }
};



module.exports = {
    deploy
};