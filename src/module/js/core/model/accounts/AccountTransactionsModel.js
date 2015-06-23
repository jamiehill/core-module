/**
 * Created by ianrotherham on 17/12/2014.
 */
define([
        'backbone',
        'core/model/accounts/TransactionCollection',
        'core/model/accounts/TransactionHistoryModel'

    ],
    function (Backbone, TransactionCollection, TransactionHistoryModel) {
        return Backbone.Model.extend({

            dependencies: 'vent, commands',

            collection: null,
            dataCount : null,
            pageItems : 12,
            currentPage : 0,


            /**
             * @param evts
             */
            ready: function () {
                //_.bindAll(this, 'onSessionStarted');
                //this.vent.on('session:loggedin', this.onSessionStarted);
            },

            initialize: function (options) {
                this.collection = new TransactionCollection();
            },

            /**
             * @param data
             */
            saveTransactionHistory: function (result) {
                var that = this;
                _.each(result.transactions, function (m) {
                    that.collection.add(new TransactionHistoryModel(m, {parse: true}));
                });
               // this.trigger("dataComplete");
            },

            saveTransactionCount: function(data){
                this.dataCount = data;
                this.calculateTransactions();
            },

            calculateTransactions: function(){
                if(this.dataCount <= this.pageItems){
                    this.getTransactions(this.currentPage, this.dataCount);
                }else if(this.dataCount > this.pageItems){
                    this.getTransactions(this.currentPage, this.pageItems);
                    this.currentPage +=  this.pageItems;
                }
            },

            getTransactionCount: function () {
                var fromDate = moment().subtract('month',1).format("YYYY-MM-DDTHH:mm:ss"),
                toDate = moment().add('day',1).format("YYYY-MM-DDTHH:mm:ss");
                this.commands.execute('command:getAccountTransactionCount', fromDate, toDate);
            },

            getTransactions: function (firstResult, maxResults) {
                this.collection = new TransactionCollection();
                var fromDate = moment().subtract('month',1).format("YYYY-MM-DDTHH:mm:ss"),
                toDate = moment().add('day',1).format("YYYY-MM-DDTHH:mm:ss");
                this.commands.execute('command:getTransactionHistory', fromDate, toDate, firstResult, maxResults);
            }
        });
    });
