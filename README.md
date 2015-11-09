pointer-point
=============

Version 2 of pointer-point is a complete restructure of it's functionality. Scroll down to visit the documentation for version 1.

Install version 2
-----------------

`npm install pointer-point`

Constructor
-----------

### pointer(element|selector|array|array like)

Acceptable arguments to the constructor:

-	single element
-	single selector
-	array of elements and/or selectors
-	an array like (dom library) of elements

All elements get all events applied to them. When ever an event fires it will be on the applicable element. This means if you set three elements the `enter` event will fire for one of those element.

The Example
-----------

```javascript
var pointer = require('pointer-point'), divs = document.querySelectorAll('div');
//All of the div elements are added to the pointer.
var point = pointer(divs);
//Change the color for any of the divs depending on events.
point.on('down', function(current, origin){
    current.style.backgroundColor = 'red';
});
point.on('move', function(current, origin){
    if(this.inside(divs[2])){
        //Check some stuff when over the second div..
        console.log('this.h '+this.h);
        console.log('this.v '+this.v);
        console.log('this.speedX '+this.speedX);
    }
});
point.on('up', function(current, origin){
    current.style.backgroundColor = 'violet';
});
point.on('leave', function(current, origin){
    current.style.backgroundColor = 'violet';
});
point.on('enter', function(current, origin){
    current.style.backgroundColor = 'blue';
    //Sometimes origin is set to null.
    if(this.down && origin){
        //The pointer is down.
        origin.style.backgroundColor = 'green';
    }
});
point.on('stroke', function(current, origin){
    console.log('stroke');
});

```

Alternatively pass an array
---------------------------

```javascript
//Add specific divs to the pointer.
var point = pointer([divs[1], divs[3]]);
```

Or just one element
-------------------

```javascript
var point = pointer(divs[0]);
```

Instance Methods
----------------

### destroy()

Removes all of the events for the pointer.

### inside(element)

Is this point inside of the element?

### outside(element)

Is this point outside of the element?

### add(element|selector)

Add one element, or one element from a selector to the instance.

### on(event, listener)

Add an event to the point with a listener function.

### off(event, listener)

Remove an event with the specified listener function.

Event listener
--------------

### listener(current, origin)

All events receive the current element the pointer is over, when the pointer is down.

All events receive the original element where the pointer was down first.

current, or origin can be null depending on the situation.

Events
------

The term **pointer** refers to a mouse, or touch.

The term **mutual** means an event is dependent on if the pointer is over one of the elements.

Non-mutual events will sometimes have their `current`, `origin` arguments set to null if the pointer is not over an element. Some mutual events will get this effect too depending on where in the DOM the event fired.

This behavior of mutual events is hard to explain, but it is consistent so you shouldn't have a problem figuring out when this is applicable. **mutual** behavior is much like how traditional mouse events work except for the origin argument which only gets passed on `down`, or `enter` if the pointer went down on one of the elements passed to the constructor.

### down

The pointer went down. **mutual**

### up

The pointer went up. up is **mutual**, but can also fire when not over an element if the pointer was down when it was over that element.

### move

The pointer is moving. Unlike a normal `mousemove` this is fired globally.

### leave

The pointer leaves one of the elements. **mutual** even though it's leaving the element.

### enter

The pointer enters one of the elements. **mutual**

### stroke

The pointer is down, moving, and over one of the elements. **mutual**

`stroke` can fire after `down`, and `enter`.

Instance Properties
-------------------

### x, y

The coordinates of the pointer.

### h, v

When direction is the pointer moving from it's last position. Their values are strings.

h is the horizontal position (left, right). v is the vertical position (up, down).

### down

Is the pointer down.

### up

Is the pointer up.

### speedX

The pointer speed in pixels per second in the x axis.

### speedY

The pointer speed in pixels per second in the y axis.

**speedX, and speedY are experimental. Don't use these if you don't want your stuff to break.**

Instance Properties Effected By Down State
------------------------------------------

These properties are set to null when the pointer isn't down.

### current

The current element the pointer is over. This can still be set if the pointer went down then is moved outside the element. current is set to null on pointer up.

### origin

Set when the pointer went down over one of the elements passed to the constructor.

origin records the first element where the pointer went down.

### previous

Like origin, but records any elements the pointer leaves.

Caveats
-------

Internally pointer-point uses events to track pointer position so until the cursor is moved, or there is a touch there will be no x/y positions. This shouldn't be a problem in most situations.

Version 1 documentation
-----------------------

Install version 1
-----------------

`npm install pointer-point@1.1.0`

Usage
-----

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dom list test</title>
    <style type="text/css">
    div{
        background-color: #968096;
    }
    </style>
</head>
<body>
    <div>
    Some text
    </div>

    <script>
    var pointer = require('../index');
    var point = pointer(document.querySelector('div'));
    point.on('move', function(e){
        //Every movement is tracked.
        console.log('point.x '+point.x);
        console.log('point.y '+point.y);
        console.log('point.down '+point.down);
    });
    point.on('down', function(e){
        //Do something when the pointer is down.
    });
    point.on('up', function(e){
        //Do something when the pointer is up.
    });
    </script>
</body>
</html>
```

Constructor
-----------

### pointer(element|selector) -> point

Pass an element, or selector for an element, and get a point in return.

Methods
-------

### point.destroy

Use destroy to remove all tracking of the pointer. Useful if you don't need the reference to the element, or it's pointer anymore.

```javascript
point.destroy();
point = null;
//Garbage collection is coming up.
```

### point.on

Add events.

### point.off

Remove events.

Events
------

-	move
-	down
-	up
-	stroke

The `move` event is used for the whole viewport. Not just the element you choose. This is useful for when you still need to track events when the pointer leaves the element.

The `stroke` event is fired only when the mouse is down. On a touch interface `move`, and `stroke` are pretty much the same. `stroke` is also emitted for the whole viewport.

Properties
----------

### point.down

Is the pointer down?

### point.up

Is the pointer up?

### point.root

The element passed to the factory constructor.

### point.x

Read only x coordinate of the pointer.

### point.y

Read only y coordinate of the pointer.

### point.pos

An internal reference to the point position.

Caveats
-------

Internally pointer-point uses events to track pointer position so until the cursor is moved, or there is a touch there will be no x/y positions. This shouldn't be a problem in most situations.
