/*global Java, base, module, exports, require*/
function ServerHandlerDefault() {
    /**
     * 获取在线玩家
     */
    this.players = function () {
        switch (arguments.length) {
            case 1:
                if (toString.call(arguments[0]) !== "[object Function]") { throw TypeError('first argument must be a function!') }
                return this.onlinePlayers().forEach(arguments[0]);
            default:
                return this.onlinePlayers();
        }
    };
}
var ServerHandler = Object.assign(new ServerHandlerDefault(), requireInternal('server'));

exports = module.exports = ServerHandler;
