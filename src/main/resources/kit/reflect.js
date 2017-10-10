'use strict';
/**
 * 反射工具类
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Class = Java.type('java.lang.Class');
var NoSuchFieldException = Java.type('java.lang.NoSuchFieldException');
var methodCache = [];

function Reflect(obj) {
    this.obj = obj;
    this.class = obj instanceof Class ? obj : obj.class;
    this.field = function (name) {
        try {
            // Try getting a public field
            var field = this.class.field(name);
            return on(field.get(this.obj));
        } catch (ex) {
            // Try again, getting a non-public field
            try {
                return on(accessible(declaredField(this.class, name)).get(this.obj));
            } catch (ex) {
                throw new NoSuchFieldException(ex);
            }
        }
    };

    this.method = function () {
        var name = arguments[0];
        var clazzs = Array.prototype.slice.call(arguments, 1);
        try {
            return this.class.method(name, clazzs);
        } catch (ex) {
            return this.class.declaredMethod(name, clazzs);
        }
    };

    this.cacheMethod = function () {
        var name = arguments[0];
        var mkey = this.class.name + '.' + name;
        if (!methodCache[mkey]) {
            methodCache[mkey] = this.method(name, arguments.slice(1));
        }
        return methodCache[mkey];
    };

    this.call = function () {
        var name = arguments[0];
        var params = Array.prototype.slice.call(arguments, 1);
        var method = this.cacheMethod(name, types(params));
        return exports.on(method.invoke(this.get(), params));
    };

    this.get = function () {
        return arguments.length === 1 ? this.field(arguments[0]) : this.obj;
    };

    this.create = function () {
        return on(declaredConstructor(this.class, arguments).newInstance(arguments));
    };
}

/**
 * Get an array of types for an array of objects
 */
function types(values) {
    if (values === null) {
        return [];
    }
    var result = [];
    values.forEach(function (t) {
        result.push(t === null ? Object.class : t.class)
    });
    return result;
}

function accessible(accessible) {
    if (accessible === null) {
        return null;
    }
    if (!accessible.isAccessible()) {
        accessible.setAccessible(true);
    }
    return accessible;
}

function declaredConstructor() {
    return accessible(arguments[0].declaredConstructor(arguments.slice(1)));
}

function declaredField(clazz, name) {
    var field = null;
    // noinspection JSUnresolvedVariable
    while (clazz !== java.lang.Object.class) {
        try {
            field = clazz.declaredField(name);
            if (field !== null) {
                break;
            }
        } catch (e) {
            clazz = clazz.superclass();
        }
    }
    if (field === null) {
        throw new NoSuchFieldException(name + " is not found in " + clazz.name);
    }
    return field;
}

function on(obj) {
    return new Reflect(obj);
}

exports.on = on;
exports.accessible = accessible;