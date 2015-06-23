/**
 * Created by Amelco on 04/03/2015.
 */

define([ 'core/model/accounts/TransactionCollection', 'core/model/accounts/TransactionHistoryModel' ],
    function (TransactionCollection, TransactionHistoryModel) {
        return Backbone.Model.extend({
            dependencies: 'vent, commands',
            collection: null,
            dataCount : null,
            pageItems : 12,
            currentPage : 1,
            firstPage: 1,
            initialize: function (options) {
                _.bindAll(this, 'saveTransactionCount', 'saveTransactionHistory');
                this.vent = ctx.get('vent');
                this.commands = ctx.get('commands');
                this.collection = new TransactionCollection();
            },
            /**
             * @param data
             */
            saveTransactionHistory: function (data, type) {
                var that = this;
                _.each(data.Result.transactions, function (m) {
                    if (m.fundsType == type) {
                        that.collection.add(new TransactionHistoryModel(m, {parse: true}));
                    }
                });
                this.trigger("txn::dataFetchComplete");
            },
            saveTransactionCount: function(data, type){
                this.dataCount = data.Long;
            },
            fetchTransactionCount: function(type){
                this.getTransactionCount(type);
            },
            fetchTransactions: function(type){
                this.getTransactions(this.firstPage, this.pageItems, type);
            },
            navigateTransactions: function(dir,type){
                if(dir === "LESS"){
                    if(this.currentPage > this.firstPage){
                        this.currentPage -= this.pageItems;
                    }else if(this.currentPage < this.firstPage) {
                        this.currentPage = this.firstPage;
                    }
                }else if(dir === "MORE"){
                    if(this.currentPage < this.dataCount){
                        this.currentPage += this.pageItems;
                    }
                    if(this.currentPage >= this.dataCount){
                        this.currentPage = this.dataCount - this.pageItems;
                    }
                }
                this.getTransactions(this.currentPage, this.pageItems, type);
            },
            getTransactionCount: function (type) {
                var fromDate = moment().subtract('month',1).format("YYYY-MM-DDTHH:mm:ss"),
                toDate = moment().add('day',1).format("YYYY-MM-DDTHH:mm:ss"),
                that = this;
                this.commands.execute('command:getAccountTransactionCount', fromDate, toDate, type)
                    .done(function(data){
                        that.saveTransactionCount(data,type);
                    });
            },
            getTransactions: function (firstResult, maxResults, type) {
                this.collection = new TransactionCollection();
                var fromDate = moment().subtract('month',1).format("YYYY-MM-DDTHH:mm:ss"),
                    toDate = moment().add('day',1).format("YYYY-MM-DDTHH:mm:ss"),
                    that = this;
                this.commands.execute('command:getTransactionHistory', fromDate, toDate, type, firstResult, maxResults)
                    .done(function(data){
                        that.saveTransactionHistory(data,type);
                    });
            }
        });
    });
