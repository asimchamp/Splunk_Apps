define(['util/moment', 'underscore'], function(moment, _) {

    var UNITS = {
        second: 's,sec,secs,second,seconds',
        minute: 'm,min,minute,minutes',
        hour: 'h,hr,hrs,hour,hours',
        day: 'd,day,days',
        week: 'w,week,weeks',
        month: 'mon,month,months',
        quarter: 'q,qtr,qtrs,quarter,quarters',
        year: 'y,yr,yrs,year,years'
    };

    var unitMap = _.once(function() {
        var result = {};
        _(UNITS).each(function(aliases, unit) {
            _(aliases.split(',')).each(function(alias) {
                result[alias] = unit;
            });
        });
        return result;
    });

    function parseRelativeTimeExpressionPart(part) {
        if (part == 'now') {
            return {now: true};
        } else {
            var match = part.match(/([+-]?\d+)([a-z]\w*)/);
            if (match) {
                var amount = match[1];
                var unit = match[2];
                var momentUnit = unitMap()[unit];
                if (!momentUnit) {
                    throw new Error('Invalid unit ' + JSON.stringify(unit) + ' in relative time expression');
                }
                return {
                    amount: parseInt(amount, 10),
                    unit: momentUnit
                };
            } else {
                throw new Error('Invalid relative time expression: ' + JSON.stringify(part));
            }
        }
    }

    function parseRelativeTimeExpression(expr) {
        if (expr == null) return;
        expr = String(expr).trim();

        // Absolute/epoch time expression
        if (/^\d+$/.test(expr)) {
            return [{absolute: parseInt(expr, 10)}];
        }

        var result = [];
        var parts = expr.split('@', 2);

        if (parts[0] !== '') {
            result.push(parseRelativeTimeExpressionPart(parts[0]));
        }

        if (parts.length > 1) {
            var snap = parts[1].match(/^[a-z]\w*/);
            if (snap) {
                snap = snap[0];
                var remainder = parts[1].substring(snap.length);
                var weekday = snap.match(/w([0-6])/);
                if (weekday) {
                    result.push({snapTo: 'week'}, {amount: parseInt(weekday[1], 10), unit: 'day'});
                } else {
                    var snapUnit = unitMap()[snap];
                    if (!snapUnit) {
                        throw new Error('Invalid snap-to unit ' + JSON.stringify(snapUnit) + ' in relative time expression');
                    }
                    result.push({snapTo: snapUnit});
                }
                if (remainder.length) {
                    result.push(parseRelativeTimeExpressionPart(remainder));
                }
            } else {
                throw new Error('Invalid snap-to expression: ' + JSON.stringify(parts[1]));
            }
        }

        return result;
    }

    function applyRelativeTimeExpressionPart(m, expr) {
        if (expr.absolute != null) {
            return moment.unix(expr.absolute);
        } else if (expr.now === true) {
            return moment();
        } else if (expr.amount != null) {
            return moment(m).add(expr.amount, expr.unit);
        } else if (expr.snapTo) {
            return moment(m).startOf(expr.snapTo);
        } else {
            throw new Error('Invalid parsed time expression part: ' + JSON.stringify(expr));
        }
    }

    function applyRelativeTimeExpression(m, parsed) {
        return _.inject(parsed, applyRelativeTimeExpressionPart, m);
    }

    moment.fn.applyRelative = function(expr) {
        return applyRelativeTimeExpression(this, parseRelativeTimeExpression(expr));
    };

    return {
        parseRelativeTimeExpression: parseRelativeTimeExpression,
        applyRelativeTimeExpression: applyRelativeTimeExpression,
        applyRelativeTimeExpressionPart: applyRelativeTimeExpressionPart
    };
});