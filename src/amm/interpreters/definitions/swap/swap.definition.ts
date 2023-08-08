export default {
  constructor: 0,
  fields:      [
    {
      constructor: 0,
      fields:      [
        {
          bytes: 'Swap Base Token Policy Id'
        },
        {
          bytes: 'Swap Base Token Name'
        }
      ]
    },
    {
      constructor: 0,
      fields:      [
        {
          bytes: 'Swap Quote Token Policy Id'
        },
        {
          bytes: 'Swap Quote Token Name'
        }
      ]
    },
    {
      constructor: 0,
      fields:      [
        {
          bytes: "Swap PoolNFT Token Policy Id"
        },
        {
          bytes: "Swap PoolNFT Token Name"
        }
      ]
    },
    {
      int: 'Pool Fee Num'
    },
    /* Fee per token
    * To calculate feePerToken use formula: feePerTokenNum / feePerTokenDenom.
    * */
    {
      int: 'Fee Per Token Num'
    },
    {
      int: 'Fee Per Token Denom'
    },
    /* Fee per token end */
    {
      "bytes": "Sender Pub Key Hash"
    },
    {
      "constructor": 0,
      // Maybe object. If stating key hash equals undefined you get "1" str to first pos.
      "fields":      [
        {
          "bytes": "Sender Staking Key Hash"
        }
      ]
    },
    {
      "int": "base amount"
    },
    {
      "int": "min qoute amount"
    }
  ]
}
