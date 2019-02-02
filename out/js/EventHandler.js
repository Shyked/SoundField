/*
    Helps creating register and unregister events on DOM
    Also helps creating internal events tied to the object itself and not to DOM elements
*/
class EventHandler {


    constructor() {
        this._extEvents         = [];
        this._events            = {};
        this._mutationObservers = [];
        this._eventCheckpoints  = {};

        this._initEvents();
    };

    _initEvents() {
        this.on('destroy', () => {
            this._unregisterEvents();
        });
    };

    /* EXTERNAL */
    /* For DOM modifications */

    _registerEvent(els, event, handler, selector) {
        var that = this;
        if (!Array.isArray(els))
            els = [els];
        for (var i = 0 ; i < els.length ; i++) {
            var el = els[i];
            var handlerOverload = function(e) {
                if (!selector) handler.apply(that, arguments);
                else if (e.target.matches(selector)) handler.apply(that, arguments);
            };
            this._extEvents.push({
                el: el,
                event: event,
                handler: handlerOverload,
                referenceHandler: handler
            })
            el.addEventListener(event, handlerOverload);
        }
    };

    _unregisterEvent(els, event, handler) {
        var that = this;
        if (!Array.isArray(els))
            els = [els];
        for (var i = 0 ; i < els.length ; i++) {
            var el = els[i];
            var handlerOverload = function(e) {
                if (!selector) handler.apply(that, arguments);
                else if (e.target.matches(selector)) handler.apply(that, arguments);
            };
            for (var idE = 0 ; idE < this._extEvents.length ; idE++) {
                if (this._extEvents[idE].el == el
                    && this._extEvents[idE].event == event
                    && this._extEvents[idE].referenceHandler == handler) {
                    el.removeEventListener(this._extEvents[idE], this._extEvents[idE].referenceHandler);
                    this._extEvents.splice(idE, 1);
                    idE--;
                }
            }
        }
    }

    _unregisterEvents() {
        for (var i = 0 ; i < this._extEvents.length ; i++) {
            var ev = this._extEvents[i];
            ev.el.removeEventListener(ev.event, ev.handler);
        }
        this._extEvents = [];
        for (var i = 0 ; i < this._mutationObservers.length ; i++) {
            this._mutationObservers[i].disconnect();
        }
        this._mutationObservers = [];
    };

    _onRemove(el, handler) {
        if (MutationObserver) {
            var parent = el.parentElement;
            if (!parent) {
                console.log(el);
                console.log("Can't bind onRemove handler because element does not have a parent.")
            }
            else {
                var observer = new MutationObserver(function (mutationsList) {
                    for (var idM in mutationsList) {
                        if ({}.hasOwnProperty.call(mutationsList, idM)) {
                            if (mutationsList[idM].type == 'childList') {
                                mutationsList[idM].removedNodes.forEach(function (removedNode) {
                                    if (removedNode == el)
                                        handler();
                                });
                            }
                        }
                    }
                });
                observer.observe(el.parentElement, { childList: true });
                this._mutationObservers.push(observer);
            }

        }
        else console.error('MutationObserver not supported.');
    };

    _onNewChild(el, handler) {
        if (MutationObserver) {
            var observer = new MutationObserver(function (mutationsList) {
                for (var idM in mutationsList) {
                    if ({}.hasOwnProperty.call(mutationsList, idM)) {
                        if (mutationsList[idM].type == 'childList') {
                            mutationsList[idM].addedNodes.forEach(function(el) {
                                handler(el);
                            });
                        }
                    }
                }
            });
            observer.observe(el, { childList: true });
            this._mutationObservers.push(observer);
        }
        else console.error('MutationObserver not supported.');
    };

    /* INTERNAL */
    /* Triggered with JS */

    _trigger(ev) {
        if (this._events[ev]) {
            var deleteListeners = [];
            var handlersCopy = [];
            for (var i = 0 ; i < this._events[ev].length ; i++)
                handlersCopy.push(this._events[ev][i]);
            for (var i = 0 ; i < handlersCopy.length ; i++) {
                handlersCopy[i].handler.apply(this, Array.prototype.slice.call(arguments, 1));
                if (!handlersCopy[i]) i--;
                else {
                    if (handlersCopy[i].times != -1) {
                        handlersCopy[i].times--;
                        if (handlersCopy[i].times == 0) {
                            deleteListeners.push(handlersCopy[i]);
                        }
                    }
                }
            }
            if (deleteListeners.length > 0) {
                for (var i = 0 ; i < deleteListeners.length ; i++) {
                    this.off(ev, deleteListeners[i])
                }
            }
        }
    };

    on(ev, handler, times) {
        if (!this._events[ev]) this._events[ev] = [];
        this._events[ev].push({
            handler: handler,
            times: times || -1
        });
        return { event: ev, handler: handler };
    };

    once(ev, handler) {
        return this.on(ev, handler, 1);
    };

    off(ev, handler) {
        if (this._events[ev]) {
            for (var i = 0 ; i < this._events[ev].length ; i++) {
                if (this._events[ev][i].handler == handler) {
                    this._events[ev].splice(i, 1);
                    return
                }
            }
        }
    };

    /* CHECKPOINT */
    /* Ensures a certain event happened before continuing */

    /**
     * await when('you-are-ready')
     * when('you-are-ready', () => {})
     * 
     * @param  {string}   eventName
     * @param  {function} callback  (optional)
     * @return {Promise}
     */
    when(eventName, callback) {
        return new Promise((resolve, reject) => {
            if (!this._eventCheckpoints[eventName]) this._eventCheckpoints[eventName] = [];
            if (this._eventCheckpoints[eventName] === true) {
                resolve();
                if (callback) callback();
            }
            else {
                this._eventCheckpoints[eventName].push(resolve);
                if (callback) this._eventCheckpoints[eventName].push(callback);
            }
        });
    };

    _eventHappened(eventName) {
        if (Array.isArray(this._eventCheckpoints[eventName])) {
            this._eventCheckpoints[eventName].forEach(resolve => {
                resolve();
            });
        }
        this._eventCheckpoints[eventName] = true;
    };

};


// Polyfill

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
