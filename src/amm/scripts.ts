import {HexString, TxHash} from "../cardano/types"

export type OrderAddrs = {
  ammDepositDefault: HexString
  ammDepositFeeSwitch: HexString
  ammRedeemDefault: HexString
  ammRedeemFeeSwitch: HexString
  ammSwapDefault: HexString
  ammSwapFeeSwitch: HexString
  ammPoolDefault: HexString
  ammPoolFeeSwitch: HexString
  ammLock: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDepositDefault:   "addr_test1wqr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugq6ch8kj",
  ammDepositFeeSwitch: "addr_test1wpv32wn29ynaek7cmqw7kdfqy37yr9tqtlsyf0mq652w0rqe2vpt",
  ammRedeemDefault:    "addr_test1wzpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsxcd9lz",
  ammRedeemFeeSwitch:  "addr_test1wpr2s8ghmw0h2xlje80t8tjcznhqgzue8zclzuku8dhtdqc8cmsp2",
  ammSwapDefault:      "addr_test1wqnp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hst7hkqk",
  ammSwapFeeSwitch:    "addr_test1wqr4vthfnz4nj9gp4zp40scwp05yv3hd04rraj5m8q5xwwctxveup",
  ammPoolDefault:      "addr_test1wp4ec3t25egvhqy2n265xfhq882jxhkknurfe9ny4rl9k6g5eefd8",
  ammPoolFeeSwitch:    "addr_test1wpmfxqgg5t2jsfelc8dnmttp73syeh9mg6kvhza7lc2halqg6rtuz",
  ammLock:             "addr_test1wrwma0rzvdexhnqrty6t8dcur7c5ffu2rjau2ayec3d3azg0g4dmr"
}

export const OrderAddrsV1Mainnet: OrderAddrs = {
  ammDepositDefault:   "addr1wyr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugqpsrmeh",
  ammDepositFeeSwitch: "addr1wyr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugqpsrmeh",
  ammRedeemDefault:    "addr1wxpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsasees8",
  ammRedeemFeeSwitch:  "addr1wxpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsasees8",
  ammSwapDefault:      "addr1wynp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hsskr20n",
  ammSwapFeeSwitch:    "addr1wynp362vmvr8jtc946d3a3utqgclfdl5y9d3kn849e359hsskr20n",
  ammPoolDefault:      "addr1x94ec3t25egvhqy2n265xfhq882jxhkknurfe9ny4rl9k6dj764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrst84slu",
  ammPoolFeeSwitch:    "addr1wx3937ykmlcaqxkf4z7stxpsfwfn4re7ncy48yu8vutcpxgg67me2",
  ammLock:             "addr1w8wma0rzvdexhnqrty6t8dcur7c5ffu2rjau2ayec3d3azg5qp35x"
}

export type ScriptCreds = {
  ammPoolDefault: HexString
  ammPoolFeeSwitch: HexString
  ammDepositDefault: HexString
  ammDepositFeeSwitch: HexString
  ammRedeemDefault: HexString
  ammRedeemFeeSwitch: HexString
  ammSwapDefault: HexString
  ammSwapFeeSwitch: HexString
  ammLock: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPoolDefault:      "6b9c456aa650cb808a9ab54326e039d5235ed69f069c9664a8fe5b69",
  ammPoolFeeSwitch:    "76930108a2d528273fc1db3dad61f4604cdcbb46accb8bbefe157efc",
  ammDepositDefault:   "075e09eb0fa89e1dc34691b3c56a7f437e60ac5ea67b338f2e176e20",
  ammDepositFeeSwitch: "59153a6a2927dcdbd8d81deb3520247c4195605fe044bf60d514e78c",
  ammRedeemDefault:    "83da79f531c19f9ce4d85359f56968a742cf05cc25ed3ca48c302dee",
  ammRedeemFeeSwitch:  "46a81d17db9f751bf2c9deb3ae5814ee040b9938b1f172dc3b6eb683",
  ammSwapDefault:      "2618e94cdb06792f05ae9b1ec78b0231f4b7f4215b1b4cf52e6342de",
  ammSwapFeeSwitch:    "07562ee998ab391501a88357c30e0be84646ed7d463eca9b3828673b",
  ammLock:             "ddbebc6263726bcc035934b3b71c1fb144a78a1cbbc57499c45b1e89"
}

export type OpInRef = {
  readonly opInRefHash: TxHash;
  readonly opInRefIndex: number;
}

export type OpInRefs = {
  ammSwapDefault: OpInRef;
  ammSwapFeeSwitch: OpInRef;
  ammLock: OpInRef;
  ammDepositDefault: OpInRef;
  ammDepositFeeSwitch: OpInRef;
  ammRedeemDefault: OpInRef;
  ammRedeemFeeSwitch: OpInRef;
}

export type DatumRewardPKHIndex = {
  ammSwapDefault: number;
  ammSwapFeeSwitch: number;
  ammDepositDefault: number;
  ammDepositFeeSwitch: number;
  ammRedeemDefault: number;
  ammRedeemFeeSwitch: number;
}

export const OpInRefsPreviewV1: OpInRefs = {
  ammSwapDefault:      {
    opInRefHash:  "b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16",
    opInRefIndex: 2
  },
  ammSwapFeeSwitch:    {
    opInRefHash:  "cb4d21dc2cd5471e4c3b3d2125339dcc0577465e9c9fb789636046b174c2a84d",
    opInRefIndex: 1
  },
  ammDepositDefault:   {
    opInRefHash:  "b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16",
    opInRefIndex: 3
  },
  ammDepositFeeSwitch: {
    opInRefHash:  "314ff562be2a5670827f42eb81457c827256378b44a59c9fdc13c2b78e67cab3",
    opInRefIndex: 0
  },
  ammRedeemDefault:    {
    opInRefHash:  "b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16",
    opInRefIndex: 1
  },
  ammRedeemFeeSwitch:  {
    opInRefHash:  "cb4d21dc2cd5471e4c3b3d2125339dcc0577465e9c9fb789636046b174c2a84d",
    opInRefIndex: 0
  },
  ammLock:             {
    opInRefHash:  "b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16",
    opInRefIndex: 1
  }
}

export const datumRewardPKHIndex: DatumRewardPKHIndex = {
  ammSwapDefault:      6,
  ammSwapFeeSwitch:    6,
  ammDepositDefault:   5,
  ammDepositFeeSwitch: 5,
  ammRedeemDefault:    5,
  ammRedeemFeeSwitch:  5
}

export const OpInRefsMainnetV1: OpInRefs = {
  ammSwapDefault:      {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 2
  },
  ammSwapFeeSwitch:    {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 2
  },
  ammDepositDefault:   {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 0
  },
  ammDepositFeeSwitch: {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 0
  },
  ammRedeemDefault:    {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 1
  },
  ammRedeemFeeSwitch:  {
    opInRefHash:  "fc9e99fd12a13a137725da61e57a410e36747d513b965993d92c32c67df9259a",
    opInRefIndex: 1
  },
  ammLock:             {
    opInRefHash:  "27cd7f14a124e2078de83e99a97cc52855b457845c4fc2cad365b931908f7e42",
    opInRefIndex: 0
  }
}
