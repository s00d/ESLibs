export default class Arr {

    static reduce(target) {
        var result = [];

        if (target instanceof Array) {
            for (var i = 0; i < target.length; i++) {
                if (typeof target[i] === 'object') {
                    result = result.concat(this.reduce(target[i]));
                } else {
                    result.push(target[i]);
                }
            }

        } else if (typeof target === 'object') {
            for (var key in target) {
                if (typeof target[key] === 'object') {
                    result = result.concat(this.reduce(target[key]));
                } else {
                    result.push(target[key]);
                }
            }

        } else {

            result.push(target);
        }

        return result;
    }
}
