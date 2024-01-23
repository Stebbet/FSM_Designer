var width = window.innerWidth;
var height = window.innerHeight;
var data = [{"x": width/2, "y": height/2 + 50}, {"x": width/2, "y": height/3}, {"x": width / 1.3, "y": height/2}]

// stage here
var stage = new Konva.Stage({container: 'container', width: width, height: height, draggable: true});

// layer
var layer = new Konva.Layer();

var circle2 = new Konva.Circle({
    x: data[2].x,
    y: data[2].y,
    radius: 15,
    fill: 'blue',
    draggable: true
});

layer.add(circle2);


var arrow = new Konva.Arrow({
    points: [0, 0, 0, 0],
    pointerLength: 20,
    pointerWidth: 20,
    fill: 'black',
    stroke: 'black',
    strokeWidth: 5,
    lineJoin: 'round',
    tension: .4,
 });
layer.add(arrow);

 var circle1 = new Konva.Circle({
    x: data[0].x,
    y: data[0].y,
    radius: 15,
    fill: 'blue',
    draggable: true
});

layer.add(circle1);

let anchor = new Konva.Circle({
    x: data[1].x,
    y: data[1].y,
    radius: 10,
    fill: 'red',
    draggable: true
});

layer.add(anchor);





function computeQuadraticBezierPathData(p0, p1, p2) {

    const controlPoint1 = {
        x: (p1.x * 2) - ((p0.x + p2.x) / 2),
        y: (p1.y * 2) - ((p0.y + p2.y) / 2)
    };

    const pathData = `M${p0.x},${p0.y} Q${controlPoint1.x},${controlPoint1.y} ${p2.x},${p2.y}`;
    return pathData;
}

arrow.points([circle1.position().x, circle1.position().y, anchor.position().x, anchor.position().y, circle2.position().x, circle2.position().y]);
//path.setData(computeQuadraticBezierPathData(...data));

function updateLine() {

    // var newpoints = computeQuadraticBezierPathData(circle1.position(), anchor.position(), circle2.position());

    //path.setData(newpoints);
    arrow.points([circle1.position().x, circle1.position().y, anchor.position().x, anchor.position().y, circle2.position().x, circle2.position().y]);
    layer.draw();

}

circle1.on('dragmove', updateLine);
anchor.on('dragmove', updateLine);
circle2.on('dragmove', updateLine);
stage.add(layer);

var scaleBy = 1.05;
stage.on('wheel', (e) => {
    // stop default scrolling
    e.evt.preventDefault();

    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();

    var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? -1 : 1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({x: newScale, y: newScale});

    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
});