async function getAllProtections() {
    const passes = 6;
    for (let i = 0; i < Number(app.protectionMaxID); i += passes) {
        for (let q = 0; q < (passes-1); q++) {
            app.LiquidityProtectionStore.methods.protectedLiquidity(i+q).call().then(
                function(value) {
                    app.protections.push([i+q, value]);
                }
            );
        }
        await app.LiquidityProtectionStore.methods.protectedLiquidity(i+passes-1).call().then(
            function(value) {
                app.protections.push([i+passes-1, value]);
            }
        );
    }
}


async function createTranslator() {
    for (let protection in app.protections) {
        const pp = app.protections[protection][1]

        if (app.translator[pp[1]]) {} else {
            const ST = new app.web3.eth.Contract(SmartToken, pp[1]);
            await ST.methods.symbol().call().then(function(value) {
                Vue.set(app.translator, pp[1], value);
            });
        }
        if (app.translator[pp[2]]) {} else {
            try {
                const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
                await EC20.methods.symbol().call().then(function(value) {
                    Vue.set(app.translator, pp[2], value);
                });
            }
            catch(err) {
                console.log(pp[2]);
            }
        }
    }
}


async function parseProtections() {
    for (let protection in app.protections) {
        const pp = app.protections[protection][1]
        Vue.set(app.parsedProtections, protection, {id: app.protections[protection][0], owner: pp[0], reserve: pp[4], pt: pp[3], timestamp: pp[7]});

        if (app.translator[pp[1]]) {
            Vue.set(app.parsedProtections, protection, {pool: app.translator[pp[1]], ...app.parsedProtections[protection]});
        } else {
            const ST = new app.web3.eth.Contract(SmartToken, pp[1]);
            await ST.methods.symbol().call().then(function(value) {
                Vue.set(app.translator, pp[1], value);
                Vue.set(app.parsedProtections, protection, {pool: value, ...app.parsedProtections[protection]});
            });
        }
        if (app.translator[pp[2]]) {
            Vue.set(app.parsedProtections, protection, {token: app.translator[pp[2]], ...app.parsedProtections[protection]});
        } else {
            try {
            const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
            await EC20.methods.symbol().call().then(function(value) {
                Vue.set(app.translator, pp[2], value);
                Vue.set(app.parsedProtections, protection, {token: value, ...app.parsedProtections[protection]});
            });
            }
            catch(err) {
                console.log(pp[2]);
                app.parsedProtections[protection].token = pp[2];
            }
        }
        const opposite_token = app.translator[pp[1]].replace("BNT", "");

        if (app.decimals[pp[2]]) {
            if (pp[2] == "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C") {
                if (app.decimals[reverseLookup(app.translator, opposite_token)]) {
                    Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-app.decimals[reverseLookup(app.translator, opposite_token)]), ...app.parsedProtections[protection]});
                } else {
                    const OT = new app.web3.eth.Contract(ERC20, reverseLookup(app.translator, opposite_token));
                    try {
                        await OT.methods.decimals().call().then(function(value) {
                            Vue.set(app.decimals, pp[1], value);
                            Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value), ...app.parsedProtections[protection]});
                        });
                    } catch {
                        console.log(opposite_token);
                        let value = 18;
                        Vue.set(app.decimals, pp[1], value);
                        Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value), ...app.parsedProtections[protection]});
                    }
                }
            } else {
                Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: (pp[6]/pp[5])*10**(18-app.decimals[pp[2]]), ...app.parsedProtections[protection]});
            }
            
        } else {
            const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
            try {
                await EC20.methods.decimals().call().then(async function(value) {
                    Vue.set(app.decimals, pp[2], value);
                    if (value == 18) {
                        Vue.set(app.parsedProtections, protection, {decimals: value, rate: pp[6]/pp[5], ...app.parsedProtections[protection]});
                    } else {
                        if (pp[2] == "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c") {  // Then this is BNT
                            if (app.decimals[reverseLookup(app.translator, opposite_token)]) {
                                Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-app.decimals[reverseLookup(app.translator, opposite_token)]), ...app.parsedProtections[protection]});
                            } else {
                                const OT = new app.web3.eth.Contract(ERC20, reverseLookup(app.translator, opposite_token));
                                try {
                                    await OT.methods.decimals().call().then(function(value2) {
                                        Vue.set(app.decimals, pp[1], value2);
                                        Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value2), ...app.parsedProtections[protection]});
                                    });
                                } catch {
                                    console.log(opposite_token);
                                    let value2 = 18;
                                    Vue.set(app.decimals, pp[1], value2);
                                    Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value2), ...app.parsedProtections[protection]});
                                }
                            }
                        } else {
                            Vue.set(app.parsedProtections, protection, {decimals: value, rate: (pp[6]/pp[5])*10**(18-value), ...app.parsedProtections[protection]});
                        }
                    }
                    
                });
            } catch {
                console.log(pp[2]);
                let value = 18;
                Vue.set(app.decimals, pp[2], value);
                if (value == 18) {
                    Vue.set(app.parsedProtections, protection, {decimals: value, rate: pp[6]/pp[5], ...app.parsedProtections[protection]});
                } else {
                    if (pp[2] == "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c") {  // Then this is BNT
                        if (app.decimals[reverseLookup(app.translator, opposite_token)]) {
                            Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-app.decimals[reverseLookup(app.translator, opposite_token)]), ...app.parsedProtections[protection]});
                        } else {
                            const OT = new app.web3.eth.Contract(ERC20, reverseLookup(app.translator, opposite_token));
                            try {
                                await OT.methods.decimals().call().then(function(value2) {
                                    Vue.set(app.decimals, pp[1], value2);
                                    Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value2), ...app.parsedProtections[protection]});
                                });
                            } catch {
                                console.log(opposite_token);
                                let value2 = 18;
                                Vue.set(app.decimals, pp[1], value2);
                                Vue.set(app.parsedProtections, protection, {decimals: app.decimals[pp[2]], rate: pp[6]/pp[5]/10**(18-value2), ...app.parsedProtections[protection]});
                            }
                        }
                    } else {
                        Vue.set(app.parsedProtections, protection, {decimals: value, rate: (pp[6]/pp[5])*10**(18-value), ...app.parsedProtections[protection]});
                    }
                }
            }
        }
    }
    setTimeout(function () {
        jdenticon();
    }, 100);
    app.ready = true;
}

function reverseLookup(dict, value) {
    for (let header in dict) {
        if (dict[header] == value) {
            return header;
        }
    }
}

async function ensurePrices(pools) {
    const reserve0 = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"
    for (let a of pools) {
        const ST = new app.web3.eth.Contract(SmartToken, a);
        const totalSupply = await ST.methods.totalSupply().call()/10**18;
        const poolAddress = await ST.methods.owner().call();
        const pool = new app.web3.eth.Contract(poolAbi, poolAddress);
        // Prices are BNT/TKN
        let reserve1 = await pool.methods.connectorTokens(1).call();
        if (app.translator[reserve1] == "BNT") {
            reserve1 = await pool.methods.connectorTokens(0).call();
        } // This is because I am 100% lazy. reserve1 is always non-bnt

        const reserve0Balance = await pool.methods.reserveBalance(reserve0).call()/10**18;
        const reserve1Balance = await pool.methods.reserveBalance(reserve1).call()/10**app.decimals[reserve1];

        Vue.set(app.TKNprices, reserve1, reserve0Balance/reserve1Balance);
        Vue.set(app.reserves, reserve1, [reserve0Balance, reserve1Balance]);
        Vue.set(app.totalSupply, a, totalSupply);
    }
}


let app = new Vue({
    el: '#app',
    data: {
        web3: false,
        LiquidityProtectionStore: "",
        protections: [],
        parsedProtections: [],
        parsedProtectionInc: 0,
        protectionMaxID: 5000,
        translator: {"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "ETH", "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": "MKR", "0xFEE7EeaA0c2f3F7C7e6301751a8dE55cE4D059Ec": "WBTCBNT",
    "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5": "TRB"},
        decimals: {"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": 18, "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": 18, "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5": 18},
        totalSupply: {},
        TKNprices: {},
        reserves: {},
        pricesReady: false,
        ready: false,
        calculatedReady: false,
        site: 1,
        sortAddr: false,
        addrToSort: "",
    },
    methods: {
        toCSV: function(arr) {
            let csvContent = "data:text/csv;charset=utf-8,";
            // Check if the array contains parsed prices.
            const translator = {timestamp: "timestamp", id: "id", owner: "owner", pool: "pool", token: "token", price: "rate", poolAmount: "pt", reserveAmount: "reserve", impermanentLoss: "IL", fees: "fees"};
            
            const header = ["timestamp", "id", "owner", "pool", "token", "price", "poolAmount", "reserveAmount", "impermanentLoss", "fees"];

            csvContent += header.join(",");
            csvContent += "\n";
            for (protection of arr) {
                let tempArr = [];
                for (part of header) {
                    if (part == "reserveAmount") {
                        tempArr.push(Number(protection[translator[part]])/10**protection["decimals"]);
                    } else if (part == "poolAmount") {
                        tempArr.push(protection[translator[part]]/10**18);
                    } else {
                        tempArr.push(protection[translator[part]]);
                    }
                }
                csvContent += tempArr.join(",");
                csvContent += "\n";
            }
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "parsedProtection.csv");
            document.body.appendChild(link); // Required for FF

            link.click();
            
        },
        setProvider: function() {
            app.setupWeb3();
        },
        setupWeb3: function() {
            // let ethereum = window.ethereum;
            const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e');
            this.web3 = new Web3(provider);
            // this.web3.eth.getAccounts().then(
            //     (accounts) => app.selectedAccount = accounts[0]
            // ); 
            this.LiquidityProtectionStore = new this.web3.eth.Contract(LiquidityProtectionStore, "0xf5FAB5DBD2f3bf675dE4cB76517d4767013cfB55");
        },
        getAllProtections: function() {
            getAllProtections();
            this.ready = false;
        },
        parseProtections: function() {
            parseProtections();
        },
        // getProtectionMaxID: function () {
        // this.LiquidityProtectionStore.getPastEvents("ProtectionAdded", {}).then(function(events) {
        //     console.log(events);
        //     this.protectionMaxID = events.length;
        // });
        sortProtections: function() {
            // First purne all non needed entries
            let clone = [...this.protections];
            this.protections = [];
            for (let protection in clone) {
                if (clone[protection][1][0] != "0x0000000000000000000000000000000000000000") {
                this.protections.push(clone[protection]);
                }
            }
            this.protections.sort((a,b) => a[0] - b[0]);
            setTimeout(function() {
                createTranslator().then(function () {parseProtections()});
            }, 500);
        },
        easyParse: function (toParse) {
            // Requires one to first use parseProtections to create the translator.
            let parseReturn = [];
            for (let protection in toParse) {
                const pp = toParse[protection][1]
                parseReturn[protection] = {id: toParse[protection][0], owner: pp[0], rate: pp[5]/pp[6], reserve: pp[4], pt: pp[3], timestamp: pp[7], pool: this.translator[pp[1]], token: this.translator[pp[2]], decimals: this.decimals[pp[2]]};
            }
            return parseReturn;
        },
        dictSum: function(dict, index) {
            let toReturn = 0;
            for (let ee in dict) {
                toReturn += Number(dict[ee][index]);
            }
            return toReturn;
        },
        reverseLookup: function(dict, value) {
            return reverseLookup(dict, value);
        },
        // list.filter(protection => protection.pool == ETHBNT)
        filterDict: function(protectionSubset, index, f) {
            let subsetReturn = [];
            for (let protection in protectionSubset) {
                if (!index) {
                    if (f(protectionSubset[protection])) {
                        subsetReturn.push(protectionSubset[protection]);
                    }
                } else {
                    if (f(protectionSubset[protection][index])) {
                        subsetReturn.push(protectionSubset[protection]);
                    }
                }
            }
            return subsetReturn;
        },
        getPricesForAll: function() {
            let allPools = [];
            for (let p of this.filterDict(this.translator, false, (e) => e.includes("BNT") && e != "BNT")) {
                allPools.push(this.reverseLookup(this.translator, p))
            }
            ensurePrices(allPools).then(() => app.pricesReady = true);
        },
        toHumanTime: function(timestamp) {
            return moment.unix(timestamp).format("YYYY-MM-DD HH:mm");
        },
        impermanentLoss: function(protectionID) {
            let protection;
            for (let p in this.parsedProtections) {
                if (this.parsedProtections[p].id == protectionID) {
                    protection = this.parsedProtections[p];
                }
            }
            const r0 = protection.rate;
            let r1;
            if (protection.token == "BNT") {
                const token = protection.pool.replace("BNT", "");
                const tokenAddress = reverseLookup(this.translator, token);
                r1 = (this.TKNprices[tokenAddress]);
            } else {
                const tokenAddress = reverseLookup(this.translator, protection.token);
                r1 = 1/this.TKNprices[tokenAddress];
            }
            return (2 * Math.sqrt(r1/r0))/(1+r1/r0);
        },
        fees: function(protectionID) {
            let protection;
            for (let p in this.parsedProtections) {
                if (this.parsedProtections[p].id == protectionID) {
                    protection = this.parsedProtections[p];
                }
            }
            const r0 = Number(protection.rate);
            let r1;
            let reserve;
            const totalSupply = Number(this.totalSupply[reverseLookup(this.translator, protection.pool)]);
            if (protection.token == "BNT") {
                const token = protection.pool.replace("BNT", "");
                const tokenAddress = reverseLookup(this.translator, token);
                r1 = (this.TKNprices[tokenAddress]);
                reserve = Number(this.reserves[reverseLookup(this.translator, protection.pool.replace("BNT", ""))][0]);
            } else {
                const tokenAddress = reverseLookup(this.translator, protection.token);
                r1 = 1/Number(this.TKNprices[tokenAddress]);
                try {
                reserve = Number(this.reserves[reverseLookup(this.translator, protection.pool.replace("BNT", ""))][1]);
                }
                catch(err) {
                    console.log(protection.id);
                }
            }
            return Math.sqrt(r0/r1) * (reserve/totalSupply * Number(protection.pt)*2/10**18)/(Number(protection.reserve)/10**Number(protection.decimals));
        },
        addCalculatedData: function() {
            this.calculatedReady = false;
            for (let pp in this.parsedProtections) {
                const protection = this.parsedProtections[pp];
                const IL = this.impermanentLoss(protection.id);
                const fees = this.fees(protection.id);
                Vue.set(this.parsedProtections, pp, {IL:IL, fees:fees, ...protection})
            }
            this.calculatedReady = true;
        },
        dictLength: function(dict) {
            return Object.keys(dict).length;
        }
    },
    watch: {
        protections: function(val, old) {
            if ((val.length >= Number(this.protectionMaxID))) {
                setTimeout(function() {
                    if (app.protections.length == val.length) {
                        app.sortProtections();
                    }
                }, 100);
            }
        },
        translator: function(val, old) {
            for (let pool in val) {
                if (pool.includes("BNT")) {
                    const ST = new app.web3.eth.Contract(SmartToken, pool);
                }
            }
        },
        site: function(val, old) {
            if (val == 1) {
                setTimeout(() => jdenticon(), 350);
            }
        },
        ready: function(val, old) {
            if (val) {
                this.getPricesForAll();
            }
        },
        pricesReady: function (val, old) {
            if (val) {
                this.addCalculatedData();
            }
        }
    },
    created: function() {
        setTimeout(() => app.setProvider(), 200);
    }
});