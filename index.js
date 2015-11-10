var Emitter = require('more-events').Emitter;
/*
git remote add origin https://github.com/hollowdoor/pointer_point.git
git push -u origin master
*/

function LocalDimensions(point, rect){
    for(var n in rect)
        setProp(this, n, rect[n]);

    setProp(this, 'x', point.x - rect.left);
    setProp(this, 'y', point.y - rect.top);

    function setProp(self, name, value){
        Object.defineProperty(self, name, {
            value: value
        });
    }
}
function Point(elements){
    var self = this, el = [];

    if(typeof elements.length === 'undefined'){
        elements = [elements];
    }

    for(var i=0; i<elements.length; i++){
        if(elements[i] !== undefined){
            if(typeof elements[i] === 'string'){
                try{
                    el.push(document.querySelector(e));
                }catch(err){
                    throw new Error(e + ' is not a valid selector used by pointer.');
                }
            }else{
                el.push(elements[i]);
            }

        }
    }

    var pos = {}, direction = {}, rect, local,
        lastmousex=-1, lastmousey=-1, timestamp, mousetravel = 0;

    this.emitter = new Emitter(this);

    this.origin = null;
    this.current = null;
    this.previous = null;

    window.addEventListener('mousedown', onDown, false);
    window.addEventListener('mousemove', onMove, false);
    window.addEventListener("mouseup", onUp, false);

    window.addEventListener('touchstart', onDown, false);
    window.addEventListener('touchmove', onMove, false);
    window.addEventListener('touchend', onUp, false);

    function onDown(e){

        toPoint(e);
        self.down = true;
        self.up = false;
        if(self.current){
            self.origin = self.current;
            self.emitter.emit('down', self.current, local);
        }

    }

    function onMove(e){
        toPoint(e);
        self.emitter.emit('move', self.current, local);
    }

    function onUp(e){
        self.down = false;
        self.up = true;
        if(self.current){
            self.emitter.emit('up', self.current, local);
        }
        self.current = null;
        self.previous = null;
        self.origin = null;
    }

    function toPoint(event){
        var dot, eventDoc, doc, body, pageX, pageY;
        var target, newTarget = null, leaving = null;

        event = event || window.event; // IE-ism
        target = event.target || event.srcElement;

        if(target !== self.current){
            for(var i=0; i<el.length; i++){
                if(el[i] === target){
                    newTarget = target;
                    break;
                }
            }

            leaving = self.current;
            if(newTarget){
                self.previous = self.current;
                self.current = newTarget;
            }
        }

        rect = self.current ? self.current.getBoundingClientRect() : null;

        //Supporting touch
        //http://www.creativebloq.com/javascript/make-your-site-work-touch-devices-51411644
        if(event.targetTouches) {
            event.pageX = e.targetTouches[0].clientX;
            event.pageY = e.targetTouches[0].clientY;

            e.stopPropagation();
            e.preventDefault();
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
        pos.x = event.pageX;// - rect.left
        pos.y = event.pageY;// - rect.top;

        local = rect ? new LocalDimensions(self, rect) : {};

        if(leaving && self.outside(leaving)){
            if(!newTarget)
                self.current = null;
            self.emitter.emit('leave', leaving, local);

        }

        if(newTarget){
            self.emitter.emit('enter', self.current, local);
        }

        if(self.down && self.current){
            self.emitter.emit('stroke', self.current, local);
        }

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
        if(elementFromPoint(self.x, self.y) === el) return true;
        return !this.outside(el);
    },
    outside: function(el){
        var rect;
        if(!el) throw new TypeError('Cannot be outside '+el);
        if(elementFromPoint(self.x, self.y) !== el) return true;
        rect = el.getBoundingClientRect();
        return (this.y > rect.top-1 || this.y < rect.bottom+1 ||
            this.x > rect.left-1 || this.y < rect.right+1);
    },
    on: function(event, cb){
        this.emitter.on(event, cb);
    },
    off: function(event, cb){
        this.emitter.off(event, cb);
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

module.exports = function(element){
    return new Point(element);
};
