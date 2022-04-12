export type NetworkParams = {
  pparams: {
    protocolVersion: {
      major: number
      minor: number
    }
    decentralization: number
    maxBlockHeaderSize: number
    maxBlockBodySize: number
    maxTxSize: number
    txFeeFixed: bigint
    txFeePerByte: bigint
    minUTxOValue: number
    stakeAddressDeposit: bigint
    stakePoolDeposit: bigint
    minPoolCost: number
    poolRetireMaxEpoch: number
    stakePoolTargetNum: number
    poolPledgeInfluence: number
    monetaryExpansion: number
    treasuryCut: number
    utxoCostPerWord: bigint
    executionUnitPrices: {
      priceSteps: number
      priceMemory: number
    }
    maxTxExecutionUnits: {
      steps: number
      memory: number
    }
    maxBlockExecutionUnits: {
      steps: number
      memory: number
    }
    maxValueSize: number
    collateralPercentage: number
    maxCollateralInputs: number
  }
  network: string
  sysstart: string
}
