async function getAllProtections() {
    const passes = 10;
    for (let i = 0; i < app.protectionMaxID; i += passes) {
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

async function parseProtections() {
    for (protection in app.protections) {
        const pp = app.protections[protection][1]
        Vue.set(app.parsedProtections, protection, {id: app.protections[protection][0], owner: pp[0], rate: pp[5]/pp[6], reserve: pp[4], pt: pp[3], timestamp: pp[7]});

        if (app.translator[pp[1]]) {
            Vue.set(app.parsedProtections, protection, {pool: app.translator[pp[1]], ...app.parsedProtections[protection]});
        } else {
            const ST = new app.web3.eth.Contract(SmartToken, pp[1]);
            await ST.methods.symbol().call().then(function(value) {
                app.translator[pp[1]] = value;
                Vue.set(app.parsedProtections, protection, {pool: value, ...app.parsedProtections[protection]});
            });
        }
        if (app.translator[pp[2]]) {
            Vue.set(app.parsedProtections, protection, {token: app.translator[pp[2]], ...app.parsedProtections[protection]});
        } else {
            try {
            const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
            await EC20.methods.symbol().call().then(function(value) {
                app.translator[pp[2]] = value;
                Vue.set(app.parsedProtections, protection, {token: value, ...app.parsedProtections[protection]});
            });
        }
        catch(err) {
            console.log(pp[2]);
            app.parsedProtections[protection].token = pp[2];
        }
    }
        if (app.decimals[pp[2]]) {
            Vue.set(app.parsedProtections, protection, {decimals: app.decmials[pp[2]], ...app.parsedProtections[protection]});
        } else {
            const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
            await EC20.methods.decimals().call().then(function(value) {
                app.decmials[pp[2]] = value;
                Vue.set(app.parsedProtections, protection, {decmials: value, ...app.parsedProtections[protection]});
            });
        }
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
        protectionMaxID: 1000,
        translator: {"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "ETH", "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": "MKR"},
        decimals: {"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": 18, "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": 18}
    },
    methods: {
        setProvider: function() {
            app.setupWeb3();
    },
        setupWeb3: function () {
        // let ethereum = window.ethereum;
        const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e');
        this.web3 = new Web3(provider);
        // this.web3.eth.getAccounts().then(
        //     (accounts) => app.selectedAccount = accounts[0]
        // ); 
        this.LiquidityProtectionStore = new this.web3.eth.Contract(LiquidityProtectionStore, "0xf5FAB5DBD2f3bf675dE4cB76517d4767013cfB55");
    },
    getAllProtections: function () {
        getAllProtections();
    },
    parseProtections: function () {
        parseProtections();
    },
        // getProtectionMaxID: function () {
        // this.LiquidityProtectionStore.getPastEvents("ProtectionAdded", {}).then(function(events) {
        //     console.log(events);
        //     this.protectionMaxID = events.length;
        // });
    sortProtections: function () {
        // First purne all non needed entries
        let clone = [...this.protections];
        this.protections = [];
        for (protection in clone) {
            if (clone[protection][1][0] != "0x0000000000000000000000000000000000000000") {
            this.protections.push(clone[protection]);
            }
        }
        this.protections.sort((a,b) => a[0] - b[0]);
    },
},
    watch: {
        protections: function(val, old) {
        if ((val.length >= this.protectionMaxID)) {
            app.sortProtections();
        }
        }
    },
});