import test from "ava"
import {QuickblueTxOut, toCardanoTxOut} from "../../quickblue/models"
import {RustModule} from "../../utils/rustLoader"
import {mkPoolsParser} from "./poolsParser"

test.before(async () => {
  await RustModule.load(true)
})

const p = mkPoolsParser(RustModule.CardanoWasm)

test("Parse Pools", async t => {
  const pools = p.parseBatch(utxos)
  t.log(pools)
})

const sampleResponse = `
[
    {
        "ref": "7939ccb5d678104933751a5cff39a53b90010d208debf637859ef75628fdeab0: 1",
        "blockHash": "4292f63569d48674152d3e0ad84b6e67814a63f69cc09edd604f29925ce1d69b",
        "txHash": "7939ccb5d678104933751a5cff39a53b90010d208debf637859ef75628fdeab0",
        "index": 1,
        "globalIndex": 9628437,
        "addr": "addr_test1wz29maq9x2q9jakwfse83sgzqf08szupqumqal0wn4hfcdq0qkwwj",
        "rawAddr": "70945df40532805976ce4c3278c102025e780b8107360efdee9d6e9c34",
        "value": [
            {
                "policyId": "",
                "name": "",
                "quantity": 5000000,
                "jsQuantity": "5000000"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenA",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenB",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenLP",
                "quantity": 9223372036854775797,
                "jsQuantity": "9223372036854775797"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenNFT",
                "quantity": 1,
                "jsQuantity": "1"
            }
        ],
        "dataHash": "071b22e6b6098a46ec82fb0847800eaf22201a803eed5cac1f60e955f1197dbe",
        "data": {
            "fields": [
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4e4654"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e41"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e42"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4c50"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "int": 1
                }
            ],
            "constructor": 0
        },
        "dataBin": "d8799fd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da506572676f54657374546f6b656e4e4654ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e41ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e42ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4f6572676f54657374546f6b656e4c50ff01ff",
        "spentByTxHash": null
    },
    {
        "ref": "c3f5aa2b4341ae05029f1ceddc520b94fe76751d6087c12ab2063555f55f0981: 1",
        "blockHash": "945d2b82397446af5a3da7cf2fceef49e68dcecfb52247bd3b04e81bff2c68bb",
        "txHash": "c3f5aa2b4341ae05029f1ceddc520b94fe76751d6087c12ab2063555f55f0981",
        "index": 1,
        "globalIndex": 9645732,
        "addr": "addr_test1wz29maq9x2q9jakwfse83sgzqf08szupqumqal0wn4hfcdq0qkwwj",
        "rawAddr": "70945df40532805976ce4c3278c102025e780b8107360efdee9d6e9c34",
        "value": [
            {
                "policyId": "",
                "name": "",
                "quantity": 5000000,
                "jsQuantity": "5000000"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenA",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenB",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenLP",
                "quantity": 9223372036854775797,
                "jsQuantity": "9223372036854775797"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenNFT",
                "quantity": 1,
                "jsQuantity": "1"
            }
        ],
        "dataHash": "071b22e6b6098a46ec82fb0847800eaf22201a803eed5cac1f60e955f1197dbe",
        "data": {
            "fields": [
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4e4654"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e41"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e42"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4c50"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "int": 1
                }
            ],
            "constructor": 0
        },
        "dataBin": "d8799fd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da506572676f54657374546f6b656e4e4654ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e41ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e42ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4f6572676f54657374546f6b656e4c50ff01ff",
        "spentByTxHash": null
    },
    {
        "ref": "49926bf7639ffb568889a80a268b11563d2431e36ce441f2983640ed701022da: 1",
        "blockHash": "1ab2875400a1ffc46a395ea61e9e0acfa1610bd2fac7a7d2bcca2525e2a9e760",
        "txHash": "49926bf7639ffb568889a80a268b11563d2431e36ce441f2983640ed701022da",
        "index": 1,
        "globalIndex": 9648480,
        "addr": "addr_test1wz29maq9x2q9jakwfse83sgzqf08szupqumqal0wn4hfcdq0qkwwj",
        "rawAddr": "70945df40532805976ce4c3278c102025e780b8107360efdee9d6e9c34",
        "value": [
            {
                "policyId": "",
                "name": "",
                "quantity": 5000000,
                "jsQuantity": "5000000"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenA",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenB",
                "quantity": 10,
                "jsQuantity": "10"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenLP",
                "quantity": 9223372036854775797,
                "jsQuantity": "9223372036854775797"
            },
            {
                "policyId": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da",
                "name": "ergoTestTokenNFT",
                "quantity": 1,
                "jsQuantity": "1"
            }
        ],
        "dataHash": "071b22e6b6098a46ec82fb0847800eaf22201a803eed5cac1f60e955f1197dbe",
        "data": {
            "fields": [
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4e4654"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e41"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e42"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "fields": [
                        {
                            "bytes": "805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da"
                        },
                        {
                            "bytes": "6572676f54657374546f6b656e4c50"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "int": 1
                }
            ],
            "constructor": 0
        },
        "dataBin": "d8799fd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da506572676f54657374546f6b656e4e4654ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e41ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4e6572676f54657374546f6b656e42ffd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4f6572676f54657374546f6b656e4c50ff01ff",
        "spentByTxHash": null
    }
]
`
const explorerUtxos: QuickblueTxOut[] = JSON.parse(sampleResponse)
const utxos = explorerUtxos.map(x => toCardanoTxOut(x))

