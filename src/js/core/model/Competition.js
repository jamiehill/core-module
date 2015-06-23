/**
 * Created by Jamie on 27/10/2014.
 */
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({
        Children: {},
        defaults: {
            parent: null,
            level: 'country',
            name:''
        }
    });
});


