/*
    Vanilla
*/
window.EventHandler = function () {

    this._events = [];
    this._extEvents = {};
    this._mutationObservers = [];

    this._init = function () {
        this._initEvents();
    };

    this._initEvents = function () {
        var that = this;
        this.on('destroy', function () {
            this._unregisterEvents();
        });
    };

    /* EXTERNAL */

    this._registerEvent = function (els, event, handler, selector) {
        var that = this;
        if (!Array.isArray(els))
            els = [els];
        for (var i in els) {
            var el = els[i];
            var handlerOverload = function(e) {
                if (!selector) handler.apply(that, arguments);
                else if (e.target.matches(selector)) handler.apply(that, arguments);
            };
            this._events.push({
                el: el,
                event: event,
                handler: handlerOverload
            })
            el.addEventListener(event, handlerOverload);
        }
    };

    this._unregisterEvents = function () {
        for (var i in this._events) {
            var ev = this._events[i];
            ev.el.off(ev.event, ev.handler);
        }
        this._events = [];
        for (var i in this._mutationObservers) {
            this._mutationObservers[i].disconnect();
        }
        this._mutationObservers = [];
    };

    this._onRemove = function (el, handler) {
        if (MutationObserver) {
            var parent = el.parentElement;
            if (!parent) {
                console.log(el);
                console.log("Can't bind onRemove handler because element does not have a parent.")
            }
            else {
                var observer = new MutationObserver(function (mutationsList) {
                    for (var idM in mutationsList) {
                        if (mutationsList[idM].type == 'childList') {
                            mutationsList[idM].removedNodes.forEach(function (removedNode) {
                                if (removedNode == el)
                                    handler();
                            });
                        }
                    }
                });
                observer.observe(el.parentElement, { childList: true });
                this._mutationObservers.push(observer);
            }

        }
        else console.error('MutationObserver not supported.');
    };

    this._onNewChild = function (el, handler) {
        if (MutationObserver) {
            var observer = new MutationObserver(function (mutationsList) {
                for (var idM in mutationsList) {
                    if (mutationsList[idM].type == 'childList') {
                        mutationsList[idM].addedNodes.forEach(function(el) {
                            handler(el);
                        });
                    }
                }
            });
            observer.observe(el, { childList: true });
            this._mutationObservers.push(observer);
        }
        else console.error('MutationObserver not supported.');
    };

    /* INTERNAL */

    this._trigger = function (ev) {
        var deleteListeners = [];
        for (var i in this._extEvents[ev]) {
            this._extEvents[ev][i].handler.apply(this, Array.prototype.slice.call(arguments, 1));
            if (this._extEvents[ev][i].times != -1) {
                this._extEvents[ev][i].times--;
                if (this._extEvents[ev][i].times == 0) {
                    deleteListeners.push(i);
                }
            }
        }
        if (deleteListeners.length > 0) {
            deleteListeners.reverse();
            for (var i in deleteListeners) {
                this._extEvents[ev].splice(deleteListeners[i], 1);
            }
        }
    };

    this.on = function (ev, handler, times) {
        if (!this._extEvents[ev]) this._extEvents[ev] = [];
        this._extEvents[ev].push({
            handler: handler,
            times: times || -1
        });
    };

    this.once = function (ev, handler) {
        this.on(ev, handler, 1);
    };

    this._init();

};


// Compatibility

if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}
