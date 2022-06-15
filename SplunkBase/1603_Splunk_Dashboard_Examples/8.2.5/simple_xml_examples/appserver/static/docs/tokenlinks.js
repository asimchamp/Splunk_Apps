requirejs([
    '../app/simple_xml_examples/libs/jquery-3.6.0-umd-min',
    '../app/simple_xml_examples/libs/underscore-1.6.0-umd-min',
    'util/console',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, console, mvc) {

    function setToken(name, value) {
        console.log('Setting Token %o=%o', name, value);

        var defaultTokenModel = mvc.Components.get('default');
        if (defaultTokenModel) {
            defaultTokenModel.set(name, value);
        }
        var submittedTokenModel = mvc.Components.get('submitted');
        if (submittedTokenModel) {
            submittedTokenModel.set(name, value);
        }
    }

    $('.dashboard-body').on('click', '[data-set-token],[data-unset-token],[data-token-json]', function(e) {
        e.preventDefault();
        var target = $(e.currentTarget);

        var setTokenName = target.data('set-token');
        if (setTokenName) {
            setToken(setTokenName, target.data('value'));
        }

        var unsetTokenName = target.data('unset-token');
        if (unsetTokenName) {
            setToken(unsetTokenName, undefined);
        }

        var tokenJson = target.data('token-json');
        if (tokenJson) {
            try {
                if (_.isObject(tokenJson)) {
                    _(tokenJson).each(function(value, key) {
                        if (value === null) {
                            // Unset the token
                            setToken(key, undefined);
                        } else {
                            setToken(key, value);
                        }
                    });
                }
            } catch (e) {
                console.warn('Cannot parse token JSON: ', e);
            }
        }
    });
});