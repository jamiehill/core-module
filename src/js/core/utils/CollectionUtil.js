define(function () {
    return {

        /**
         * Factory method for producing collections
         * @returns {*|void}
         */
       factory: function(model, models) {
            models = models || [];
            return new (Backbone.Collection.extend({
                model: model
            }))(models);
        }

    };
});