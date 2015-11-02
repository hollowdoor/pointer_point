pointer-point
=============

install
-------

`npm install pointer-point`

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
        console.log('point.x '+point.x);
        console.log('point.y '+point.y);
        console.log('point.down '+point.down);
    });
    point.on('down', function(e){

    });
    point.on('up', function(e){

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

### point.on

Add events.

### point.off

Remove events.

### point.x

Read only x coordinate of the pointer.

### point.y

Read only y coordinate of the pointer.

### point.pos

An internal reference to the point position.

Events
------

-	move
-	down
-	up

Properties
----------

### point.down

Is the pointer down?

### point.up

Is the pointer up?

### point.root

The element passed to the factory constructor.

Caveats
-------

Internally pointer-point uses events to track pointer position so until the cursor is moved there will be no position.

At this time only mouse positions are tracked. For touch most browsers fire mouse events as well so this module could, or should work on most touch devices.
