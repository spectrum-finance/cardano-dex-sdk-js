import {HexString, TxHash} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wqr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugq6ch8kj",
  ammRedeem: "addr_test1wzpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsxcd9lz",
  ammSwap: "addr_test1wqnp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hst7hkqk"
}

export const OrderAddrsV1Mainnet: OrderAddrs = {
  ammDeposit: "addr1wyr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugqpsrmeh",
  ammRedeem: "addr1wxpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsasees8",
  ammSwap: "addr1wynp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hsskr20n"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "708850ab55c74806e365509e08df8aa3db7c94153c063fd702b5acb2",
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
