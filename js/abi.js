LiquidityProtectionStore = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_expirationTime","type":"uint256"}],"name":"BalanceLocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"BalanceUnlocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_prevOwner","type":"address"},{"indexed":true,"internalType":"address","name":"_newOwner","type":"address"}],"name":"OwnerUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IConverterAnchor","name":"_poolAnchor","type":"address"},{"indexed":false,"internalType":"bool","name":"_added","type":"bool"}],"name":"PoolWhitelistUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":true,"internalType":"contract IDSToken","name":"_poolToken","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"_poolAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_reserveAmount","type":"uint256"}],"name":"ProtectionAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":true,"internalType":"contract IDSToken","name":"_poolToken","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"_poolAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_reserveAmount","type":"uint256"}],"name":"ProtectionRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"_prevPoolAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_prevReserveAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newPoolAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newReserveAmount","type":"uint256"}],"name":"ProtectionUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IERC20Token","name":"_token","type":"address"},{"indexed":false,"internalType":"uint256","name":"_prevAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newAmount","type":"uint256"}],"name":"SystemBalanceUpdated","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_expirationTime","type":"uint256"}],"name":"addLockedBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IConverterAnchor","name":"_poolAnchor","type":"address"}],"name":"addPoolToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"contract IDSToken","name":"_poolToken","type":"address"},{"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"internalType":"uint256","name":"_poolAmount","type":"uint256"},{"internalType":"uint256","name":"_reserveAmount","type":"uint256"},{"internalType":"uint256","name":"_reserveRateN","type":"uint256"},{"internalType":"uint256","name":"_reserveRateD","type":"uint256"},{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"addProtectedLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"decSystemBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"incSystemBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IConverterAnchor","name":"_poolAnchor","type":"address"}],"name":"isPoolWhitelisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"lockedBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"}],"name":"lockedBalanceCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_startIndex","type":"uint256"},{"internalType":"uint256","name":"_endIndex","type":"uint256"}],"name":"lockedBalanceRange","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"protectedLiquidity","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"contract IDSToken","name":"","type":"address"},{"internalType":"contract IERC20Token","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"}],"name":"protectedLiquidityCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"protectedLiquidityId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"}],"name":"protectedLiquidityIds","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"removeLockedBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IConverterAnchor","name":"_poolAnchor","type":"address"}],"name":"removePoolFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"removeProtectedLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"}],"name":"systemBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IDSToken","name":"_poolToken","type":"address"}],"name":"totalProtectedPoolAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IDSToken","name":"_poolToken","type":"address"},{"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"}],"name":"totalProtectedReserveAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"uint256","name":"_newPoolAmount","type":"uint256"},{"internalType":"uint256","name":"_newReserveAmount","type":"uint256"}],"name":"updateProtectedLiquidityAmounts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"whitelistedPool","outputs":[{"internalType":"contract IConverterAnchor","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"whitelistedPoolCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"whitelistedPools","outputs":[{"internalType":"contract IConverterAnchor[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];
SmartToken = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_disable","type":"bool"}],"name":"disableTransfers","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_amount","type":"uint256"}],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"transfersEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_token","type":"address"}],"name":"NewSmartToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Issuance","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Destruction","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_prevOwner","type":"address"},{"indexed":true,"name":"_newOwner","type":"address"}],"name":"OwnerUpdate","type":"event"}];
ERC20 = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];
poolAbi = [{"inputs":[{"internalType":"contract IDSToken","name":"_token","type":"address"},{"internalType":"contract IContractRegistry","name":"_registry","type":"address"},{"internalType":"uint32","name":"_maxConversionFee","type":"uint32"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint16","name":"_type","type":"uint16"},{"indexed":true,"internalType":"contract IConverterAnchor","name":"_anchor","type":"address"},{"indexed":true,"internalType":"bool","name":"_activated","type":"bool"}],"name":"Activation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20Token","name":"_fromToken","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_toToken","type":"address"},{"indexed":true,"internalType":"address","name":"_trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_return","type":"uint256"},{"indexed":false,"internalType":"int256","name":"_conversionFee","type":"int256"}],"name":"Conversion","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"_prevFee","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"_newFee","type":"uint32"}],"name":"ConversionFeeUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newSupply","type":"uint256"}],"name":"LiquidityAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_provider","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newSupply","type":"uint256"}],"name":"LiquidityRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_prevOwner","type":"address"},{"indexed":true,"internalType":"address","name":"_newOwner","type":"address"}],"name":"OwnerUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20Token","name":"_connectorToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"_tokenSupply","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_connectorBalance","type":"uint256"},{"indexed":false,"internalType":"uint32","name":"_connectorWeight","type":"uint32"}],"name":"PriceDataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20Token","name":"_token1","type":"address"},{"indexed":true,"internalType":"contract IERC20Token","name":"_token2","type":"address"},{"indexed":false,"internalType":"uint256","name":"_rateN","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_rateD","type":"uint256"}],"name":"TokenRateUpdate","type":"event"},{"inputs":[],"name":"acceptAnchorOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"acceptTokenOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token[]","name":"_reserveTokens","type":"address[]"},{"internalType":"uint256[]","name":"_reserveAmounts","type":"uint256[]"},{"internalType":"uint256","name":"_minReturn","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token[]","name":"_reserveTokens","type":"address[]"},{"internalType":"uint256","name":"_reserveTokenIndex","type":"uint256"},{"internalType":"uint256","name":"_reserveAmount","type":"uint256"}],"name":"addLiquidityCost","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"},{"internalType":"uint256","name":"_reserveAmount","type":"uint256"}],"name":"addLiquidityReturn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"},{"internalType":"uint32","name":"_weight","type":"uint32"}],"name":"addReserve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"anchor","outputs":[{"internalType":"contract IConverterAnchor","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"connectorTokenCount","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"connectorTokens","outputs":[{"internalType":"contract IERC20Token","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_address","type":"address"}],"name":"connectors","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint32","name":"","type":"uint32"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"conversionFee","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"conversionWhitelist","outputs":[{"internalType":"contract IWhitelist","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"conversionsEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_sourceToken","type":"address"},{"internalType":"contract IERC20Token","name":"_targetToken","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_trader","type":"address"},{"internalType":"address payable","name":"_beneficiary","type":"address"}],"name":"convert","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"converterType","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"fund","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_connectorToken","type":"address"}],"name":"getConnectorBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_sourceToken","type":"address"},{"internalType":"contract IERC20Token","name":"_targetToken","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getReturn","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasETHReserve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isStandardPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isV28OrHigher","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"liquidate","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxConversionFee","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"onlyOwnerCanUpdateRegistry","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"prevAverageRate","outputs":[{"internalType":"uint256","name":"n","type":"uint256"},{"internalType":"uint256","name":"d","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"prevAverageRateUpdateTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"prevRegistry","outputs":[{"internalType":"contract IContractRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"}],"name":"recentAverageRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registry","outputs":[{"internalType":"contract IContractRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"contract IERC20Token[]","name":"_reserveTokens","type":"address[]"},{"internalType":"uint256[]","name":"_reserveMinReturnAmounts","type":"uint256[]"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"contract IERC20Token[]","name":"_reserveTokens","type":"address[]"}],"name":"removeLiquidityReturn","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"}],"name":"reserveBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reserveRatio","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reserveTokenCount","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reserveTokens","outputs":[{"internalType":"contract IERC20Token","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_reserveToken","type":"address"}],"name":"reserveWeight","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"","type":"address"}],"name":"reserves","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint32","name":"weight","type":"uint32"},{"internalType":"bool","name":"deprecated1","type":"bool"},{"internalType":"bool","name":"deprecated2","type":"bool"},{"internalType":"bool","name":"isSet","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"restoreRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_onlyOwnerCanUpdateRegistry","type":"bool"}],"name":"restrictRegistryUpdate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"_conversionFee","type":"uint32"}],"name":"setConversionFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IWhitelist","name":"_whitelist","type":"address"}],"name":"setConversionWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_sourceToken","type":"address"},{"internalType":"contract IERC20Token","name":"_targetToken","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"targetAmountAndFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IConverterAnchor","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferAnchorOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferTokenOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"_to","type":"address"}],"name":"withdrawETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20Token","name":"_token","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];