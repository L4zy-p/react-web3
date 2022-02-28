// https://eth-rinkeby.alchemyapi.io/v2/BQi-_DjF7GkYTu7DFRE8mdQZ2uHQozZh

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/BQi-_DjF7GkYTu7DFRE8mdQZ2uHQozZh',
      accounts: ['c5c9b78b87c3b1f3c735b91f13a1b84c5a6f082831daddbea23e4d2343051bb5']
    }
  }
}