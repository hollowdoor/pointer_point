var Emitter = require('more-events').Emitter;
/*
git remote add origin https://github.com/hollowdoor/pointer_point.git
git push -u origin master
*/
function Point(element){
    var self = this;
    if(typeof element === 'string'){
        this.root = document.querySelector(elemenet);
    }else{
        this.root = element;
    }

    this.emitter = new Emitter(this);
    this.down = false;
    this.up = true;
    //Not fired in touch.
    this.root.addEventListener('mousedown', onDown, false);
    window.addEventListener('mousemove', onMove, false);
    this.root.addEventListener('mouseup', onUp, false);


    function onDown(e){
        self.down = true;
        self.up = false;
        self.emitter.emit('down', e);
    }

    function onMove(e){
        toPoint(e);
        self.emitter.emit('move', e);
    }

    function onUp(e){
        self.down = false;
        self.up = true;
        self.emitter.emit('up', e);
    }

    function toPoint(event){
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

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

        var rect = self.root.getBoundingClientRect();
        self.pageX = event.pageX;
        self.pageY = event.pageY;
        self.overX = null;
        self.overY = null;

        self.pos = {};
        self.pos.x = event.pageX;// - rect.left;
        self.pos.y = event.pageY;// - rect.top;

        self.boxX = self.pos.x - rect.left;
        self.boxY = self.pos.y - rect.top;
        if(event.pageX > rect.right){
            self.overX = event.pageX - rect.right;
        }

        if(event.pageY > rect.bottom){
            self.overY = event.pageY - rect.bottom;
        }
    }

    Object.defineProperty(this, 'x', {
        get: function(){
            return self.pos.x;
        }
    });

    Object.defineProperty(this, 'y', {
        get: function(){
            return self.pos.y;
        }
    });

    this.destroy = function(){
        this.root.removeEventListener('mousedown', onDown, false);
        window.removeEventListener('mousemove', onMove, false);
        this.root.removeEventListener('mouseup', onUp, false);
    };
}

Point.prototype = {
    constructor: Point,
    on: function(event, cb){
        this.emitter.on(event, cb);
    },
    off: function(event, cb){
        this.emitter.off(event, cb);
    }
};

module.exports = function(element){
    return new Point(element);
};
