import {HexString, TxHash} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
  ammPool: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wqr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugq6ch8kj",
  ammRedeem: "addr_test1wzpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsxcd9lz",
  ammSwap: "addr_test1wqr4vthfnz4nj9gp4zp40scwp05yv3hd04rraj5m8q5xwwctxveup",
  ammPool: "addr_test1wpmfxqgg5t2jsfelc8dnmttp73syeh9mg6kvhza7lc2halqg6rtuz"
}

export const OrderAddrsV1Mainnet: OrderAddrs = {
  ammDeposit: "addr1wyr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugqpsrmeh",
  ammRedeem: "addr1wxpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsasees8",
  ammSwap: "addr1wynp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hsskr20n",
  ammPool: "addr1wx3937ykmlcaqxkf4z7stxpsfwfn4re7ncy48yu8vutcpxgg67me2"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "6e5b9b7fbf5690879606ef5624052a9a00cf9b3541d059c7c615461b",
  ammDeposit: "075e09eb0fa89e1dc34691b3c56a7f437e60ac5ea67b338f2e176e20",
  ammRedeem: "83da79f531c19f9ce4d85359f56968a742cf05cc25ed3ca48c302dee",
  ammSwap: "2618e94cdb06792f05ae9b1ec78b0231f4b7f4215b1b4cf52e6342de"
}

export type OpInRef = {
  readonly opInRefHash: TxHash;
  readonly opInRefIndex: number;
}

export type OpInRefs = {
  ammSwap: OpInRef;
  ammDeposit: OpInRef;
  ammRedeem: OpInRef;
}

export type DatumRewardPKHIndex = {
  ammSwap: number;
  ammDeposit: number;
  ammRedeem: number;
}

export const OpInRefsPreviewV1: OpInRefs = {
  ammSwap: {
    opInRefHash: 'b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16',
    opInRefIndex: 2
  },
  ammDeposit: {
    opInRefHash: 'b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16',
    opInRefIndex: 3
  },
  ammRedeem: {
    opInRefHash: 'b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16',
    opInRefIndex: 1
  }
}

export const datumRewardPKHIndex: DatumRewardPKHIndex = {
  ammSwap: 6,
  ammDeposit: 5,
  ammRedeem: 5
}

export const OpInRefsMainnetV1: OpInRefs = {
  ammSwap: {
    opInRefHash: 'fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a',
    opInRefIndex: 2
  },
  ammDeposit: {
    opInRefHash: 'fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a',
    opInRefIndex: 0
  },
  ammRedeem: {
    opInRefHash: 'fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a',
    opInRefIndex: 1
  }
}
