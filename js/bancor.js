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
        app.parsedProtections[protection] = {id: app.protections[protection][0], owner: pp[0], rate: pp[5]/pp[6], reserve: pp[4], pt: pp[3], timestamp: pp[7]}; 
        const ST = new app.web3.eth.Contract(SmartToken, pp[1]);
        const EC20 = new app.web3.eth.Contract(ERC20, pp[2]);
        ST.methods.symbol().call().then(function(value) {
            app.parsedProtections[protection].pool = value;
        });
        await EC20.methods.symbol().call().then(function(value) {
            app.parsedProtections[protection].token = value;
        });
    }
},


let app = new Vue({
    el: '#app',
    data: {
        web3: false,
        LiquidityProtectionStore: "",
        protections: [],
        parsedProtections: [],
        protectionMaxID: 1000,
        
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
        // getProtectionMaxID: function () {
        // this.LiquidityProtectionStore.getPastEvents("ProtectionAdded", {}).then(function(events) {
        //     console.log(events);
        //     this.protectionMaxID = events.length;
        // });
    getAllProtections: function () {
        for (let i = 0;i<this.protectionMaxID;i++) {
            this.LiquidityProtectionStore.methods.protectedLiquidity(i).call().then(
                function(value) {
                    app.protections.push([i, value]);
                }
            )
        }
    },
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
    parseProtections: function() {
        for (protection in this.protections) {
            const pp = this.protections[protection][1]
            this.parsedProtections[protection] = {id: this.protections[protection][0], owner: pp[0], rate: pp[5]/pp[6], reserve: pp[4], pt: pp[3], timestamp: pp[7]}; 
            const ST = new this.web3.eth.Contract(SmartToken, pp[1]);
            const EC20 = new this.web3.eth.Contract(ERC20, pp[2]);
            ST.methods.symbol().call().then(function(value) {
                app.parsedProtections[protection].pool = value;
            });
            EC20.methods.symbol().call().then(function(value) {
                app.parsedProtections[protection].token = value;
            });
        }
    },
},
    watch: {
        protections: function(val, old) {
        if ((val.length >= this.protectionMaxID)) {
            app.sortProtections();
        }
        }
    }
});