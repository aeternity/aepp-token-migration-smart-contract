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
const fs = require('fs');

const deploy = async (network, privateKey, compiler, networkId) => {

    let net = {};
    net.url = 'http://localhost:3001';
    net.internalUrl = net.url +'/internal';
    net.networkId = "ae_devnet";
    net.compilerUrl = 'http://localhost:3080';

    const contractSource = fs.readFileSync('./contracts/TokenMigration.aes', 'utf8');

    let moneyKeyPair = { 
        publicKey: "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
        secretKey: "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
    };

    const node = await Node({ url: net.url, internalUrl: net.internalUrl, forceCompatibility: true });
    const client = await Universal({
        nodes: [ { name: 'ANY_NAME', instance: node } ],
        accounts: [AeSDK.MemoryAccount({
            keypair: moneyKeyPair
        })],
        nativeMode: false,
        networkId: net.networkId,
        compilerUrl: net.compilerUrl,
        forceCompatibility: true
    });

    const instance = await client.getContractInstance(contractSource);

    const rootHash = "29E1A00DC3C0C5B3F87AC1B14FC0368CB5EFAAF1AD8E0F9A258C24C1FF871377";
    const migrationsCount = 0;

    let result = await instance.deploy([ rootHash, migrationsCount ]);
    console.log("==> Contract was deployed to: ", result.address);

    // FUNDING CONTACT
    let deposit = 10 * 1000000000000000000; // N * 1 AE
    let depositRes = await instance.methods.deposit({ amount: deposit });
    console.log("contract was funded with:", depositRes.decodedResult);
};

module.exports = {
    deploy
};
