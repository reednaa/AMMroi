


let app = new VTTCue({
    el: '#app',
    data: {
        LiquidityProtectionStore: "",
        protections: [],
        protectionMaxID: 0,
        
    },
    methods: {
        setupWeb3: function () {
            let ethereum = window.ethereum;
            this.web3 = new Web3(ethereum);
            this.web3.eth.getAccounts().then(
                (accounts) => app.selectedAccount = accounts[0]
            ); 
            this.LiquidityProtectionStore = new this.web3.eth.Contract(LiquidityProtectionStore, "0xf5FAB5DBD2f3bf675dE4cB76517d4767013cfB55");
        },
    },
    getProtectionMaxID: function () {
        this.LiquidityProtectionStore.getPastEvents(ProtectionAdded, {}).then(function(events) {
            console.log(events);
            this.protectionMaxID = events.length;
        });
    },
    getAllProtections: function () {
        for (let i = 0;i<this.protectionMaxID;i++) {
            this.LiquidityProtectionStore.methods.protectedLiquidity(i).call().then(
                function(value) {
                    app.protections.push([0, value]);
                }
            )
        }
        this.LiquidityProtectionStore.methods.protectedLiquidity
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
    }

})