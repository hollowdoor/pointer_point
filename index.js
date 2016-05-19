var Emitter = require('more-events').Emitter;
/*
git remote add origin https://github.com/hollowdoor/pointer_point.git
git push -u origin master
*/

if(!Date.now){ Date.now = function(){ return new Date().getTime() } }

function LocalDimensions(point, rect){
    for(var n in rect)
        setProp(this, n, rect[n]);

    setProp(this, 'x', point.x - rect.left+1);
    setProp(this, 'y', point.y - rect.top+1);

    setProp(this, 'north', (((rect.bottom - rect.top) / 2)-this.y));
    setProp(this, 'south', ((-(rect.bottom - rect.top) / 2)+this.y));
    setProp(this, 'east', (((rect.right - rect.left) / 2)-this.x));
    setProp(this, 'west', ((-(rect.right - rect.left) / 2)+this.x));


    function setProp(self, name, value){
        Object.defineProperty(self, name, {
            value: value,
            configurable: true,
            writable: false
        });
    }
}
function Point(elements){
    var self = this, el = [], targets = [];

    if(typeof elements.length === 'undefined'){
        elements = [elements];
    }

    for(var i=0; i<elements.length; i++){
        if(elements[i] !== undefined){
            if(typeof elements[i] === 'string'){
                try{
                    el.push(document.querySelector(elements[i]));
                }catch(err){
                    throw new Error(elements[i] + ' is not a valid selector used by pointer.');
                }
            }else{
                el.push(elements[i]);
            }

        }
    }

    var pos = {}, direction = {}, rect, local,
        lastmousex=-1, lastmousey=-1, timestamp, mousetravel = 0,
        startX=-1, startY=-1, scrolling = false, buf = 10, timeOut = false,
        downTime;

    var special = {
        hold: []
    };

    this.emitter = new Emitter(this);

    this.select = true;
    this.targets = [];
    this.origin = null;
    this.current = null;
    this.previous = null;

    for(var i=0; i<el.length; i++){
        if(el[i] === window){
            this.targets.push({
                target: window,
                rect: null
            });
        }
    }

    window.addEventListener('mousedown', onDown, false);
    window.addEventListener('mousemove', onMove, false);
    window.addEventListener("mouseup", onUp, false);

    window.addEventListener('touchstart', onDown, false);
    window.addEventListener('touchmove', onMove, false);
    window.addEventListener('touchend', onUp, false);

    window.addEventListener('scroll', function(e){
        scrolling = true;
        clearTimeout(timeOut)
        timeOut = setTimeout(function(){
            scrolling = false;
        }, 100)
    });

    function runEvents(self, eventName){
        for(var i=0; i<self.targets.length; i++){
            self.emitter.emit(eventName, self.targets[i].target, self.targets[i].rect);
        }
    }

    function onDown(e){

        downTime = Date.now();

        toPoint(e);
        self.down = true;
        self.up = false;
        if(self.targets.length){
            self.origin = self.current;
            for(var i=0; i<self.targets.length; i++){
                self.emitter.emit('down', self.targets[i].target, self.targets[i].rect);
            }
        }

        startX = self.x;
        startY = self.y;

    }

    function onMove(e){
        if(!self.select){
            if(document.selection){
                document.selection.empty()
            }else{
                window.getSelection().removeAllRanges()
            }
        }

        toPoint(e);
        for(var i=0; i<self.targets.length; i++){
            self.emitter.emit('move', self.targets[i].target, self.targets[i].rect);
        }
        if(self.down && self.targets.length){
            for(var i=0; i<self.targets.length; i++){
                self.emitter.emit('stroke', self.targets[i].target, self.targets[i].rect);
            }
        }
    }

    function onUp(e){
        self.down = false;
        self.up = true;

        if(self.targets.length){
            for(var i=0; i<self.targets.length; i++){
                self.emitter.emit('up', self.targets[i].target, self.targets[i].rect);
            }
        }

        if(e.targetTouches){
            //Allow click within buf. A 20x20 square.
            if(!(self.y > (startY - buf) && self.y < (startY + buf) &&
                    self.x > (startX - buf) && self.x < (startX + buf))){
                //If there is scrolling there was a touch flick.
                if(!scrolling){
                    //No touch flick so
                    self.previous = null;
                    self.origin = null;
                    e.preventDefault();
                    return false;

                }
            }
        }

        scrolling = false;
        self.previous = null;
        self.origin = null;
    }

    function toPoint(event){
        var dot, eventDoc, doc, body, pageX, pageY;
        var target, newTarget = null, targetTemp;
        var last = [];

        event = event || window.event; // IE-ism
        target = event.target || event.srcElement;

        //Supporting touch
        //http://www.creativebloq.com/javascript/make-your-site-work-touch-devices-51411644
        if(event.targetTouches) {
            event.pageX = event.targetTouches[0].clientX;
            event.pageY = event.targetTouches[0].clientY;
            event.clientX = event.targetTouches[0].clientX;
            event.clientY = event.targetTouches[0].clientY;
        }else

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX === null && event.clientX !== null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        if(self.x && self.y){
            if(event.pageX < self.x)
                direction.h = 'left';
            else if(event.pageX > self.x)
                direction.h = 'right';
            if(event.pageY < self.y)
                direction.v = 'up';
            else if(event.pageY > self.y)
                direction.v = 'down';

            lastmousex = self.x;
            lastmousey = self.y;
        }

        pos = {};
        //Prefer the viewport with clientX, and clientY.
        //pageX, and pageY change too often.
        pos.x = event.clientX;//event.pageX;
        pos.y = event.clientY;//event.pageY;


        last = [].concat(self.targets);
        newTarget = target;
        self.targets = [];
        targetTemp = [];

        for(var i=0; i<last.length; i++){
            if(last[i].target === window){
                targetTemp.push(window);
            }else if(last[i].target === target){
                newTarget = false;
                targetTemp.push(target);
            }else if(!self.inside(last[i].target)){
                self.previous = last[i].target;
                rect = getRect(last[i].target);
                self.emitter.emit('leave', last[i].target, new LocalDimensions(self, rect));
            }else{
                targetTemp.push(last[i].target);
            }
        }

        for(var i=0; i<targetTemp.length; i++){
            rect = getRect(targetTemp[i]);
            self.targets.push({
                target: targetTemp[i],
                rect: new LocalDimensions(self, rect)
            });
        }

        if(newTarget){

            for(var i=0; i<el.length; i++){
                if(el[i] === newTarget){
                    self.previous = self.current;
                    rect = getRect(target);
                    local = new LocalDimensions(self, rect);
                    self.targets.push({
                        target: newTarget,
                        rect: local
                    });
                    self.current = target;

                    self.emitter.emit('enter', target, local);
                }
            }

        }

        newTarget = null;
        targetTemp = null;
        last = null;

    }

    //Get speed
    //http://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
    Object.defineProperty(this, 'speedX', {
        get: function(){
            var now = Date.now() / 1000;
            var dt =  now - timestamp;
            var dx = self.x - lastmousex;
            timestamp = now;
            return Math.round(dx / dt);// * 1000);
        }
    });

    Object.defineProperty(this, 'speedY', {
        get: function(){
            var now = Date.now() / 1000;
            var dt =  now - timestamp;
            var dy = self.y - lastmousey;
            timestamp = now;
            return Math.round(dy / dt);// * 1000);
        }
    });

    Object.defineProperty(this, 'x', {
        get: function(){
            return pos.x;
        }
    });

    Object.defineProperty(this, 'y', {
        get: function(){
            return pos.y;
        }
    });

    Object.defineProperty(this, 'h', {
        get: function(){
            return direction.h;
        }
    });

    Object.defineProperty(this, 'v', {
        get: function(){
            return direction.v;
        }
    });

    this.emitter.on('up', function(el, rect){
        if(downTime){
            for(var i=0; i<special.hold.length; i++){
                if(Date.now() > downTime + (special.hold[i].data || 2000)){
                    special.hold[i].callback.call(this, el, rect);
                }
            }
        }
        downTime = 0;
    });

    function removeSpecial(event, cb){
        for(var i=0; i<special[event].length; i++){
            if(special[event][i].callback === cb){
                special[event].splice(i, 1);
                return;
            }
        }
    }

    function addSpecial(event, data, cb){
        if(typeof cb === 'undefined'){
            cb = data;
            data = null;
        }

        special[event].push({
            data: data,
            callback: cb
        })
    }

    this.on = function(event, cb){
        if(special[event]){
            addSpecial(event, cb, arguments[2]);
            return this;
        }
        this.emitter.on(event, cb);
        return this;
    };

    this.off = function(event, cb){
        if(special[event]){
            removeSpecial(event, cb);
            return this;
        }
        this.emitter.off(event, cb);
        return this;
    };

    this.add = function(element){
        if(typeof element === 'string'){
            try{
                el.push(document.querySelector(e));
            }catch(err){
                throw new Error(e + ' is not a valid selector, and can\'t be used add to pointer.');
            }
        }else if(!element){
            throw new Error(e + ' can not be added to pointer.');
        }

        el.push(element);
    };

    /*
    Use this some time later when old browsers are no longer in use.
    //https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/
    function applyObserver(element){
        var observer = MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
                var c;
                if(mutation.type === 'childList'){
                    c = [].slice(mutation.childList);
                    if((index = c.indexOf(element)) !== -1){
                        index = el.indexOf(element);
                        el.splice(index, 0);
                        if(!el.length){
                            self.destroy();
                        }
                    }
                }
            });
        });

        observer.observe(element.parentNode, {
            childList: true
        });
    }*/

    this.destroy = function(){
        window.removeEventListener('mousedown', onDown, false);
        window.removeEventListener('mousemove', onMove, false);
        window.removeEventListener('mouseup', onUp, false);

        window.removeEventListener('touchstart', onDown, false);
        window.removeEventListener('touchmove', onMove, false);
        window.removeEventListener('touchend', onUp, false);
        el = null;
        self = null;
        pos = null;
        direction = null;
    };
}

Point.prototype = {
    constructor: Point,
    inside: function(el){
        if(!el) throw new TypeError('Cannot be inside '+el);
        var rect = getRect(el);
        return (this.y > rect.top && this.y < rect.bottom &&
                this.x > rect.left && this.x < rect.right);
    },
    outside: function(el){
        if(!el) throw new TypeError('Cannot be outside '+el);
        return !this.inside(el);
    }
};

function elementFromPoint(x, y){
    if(document.getElementFromPoint)
        return document.getElementFromPoint(x, y);
    else
        return document.elementFromPoint(x, y);
    return null;
}

function safeObject(src){
    var obj = {};
    for(var n in src)
        obj[n] = src[n];
    return obj;
}

function getRect(el){
    if(el === window){
        return {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            width: window.innerWidth,
            height: window.innerHeight
        };

    }else{
        return el.getBoundingClientRect();
    }
}

module.exports = function(element){
    return new Point(element);
};
