// Use matter.js to attach a pinata to a figure, drag to interact

var screenW = window.innerWidth;
var screenH = window.innerHeight;
var canvas = document.getElementById('sim');
canvas.width = screenW;
canvas.height = screenH;

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Runner = Matter.Runner;

var engine = Engine.create();
engine.world.gravity.x = 0;
engine.world.gravity.y = 6;

var mouseConstraint = MouseConstraint.create(engine,{
  mouse: Mouse.create(canvas)
});

var group = Body.nextGroup(true);
var render = Render.create({
    canvas: canvas,
    engine: engine,
     options: {
        width: window.innerWidth,
        height: window.innerHeight, 
        wireframeBackground: '#ffffff',
       wireframes: false
     }
});

// create person
function createPinata(x,y){
  var headOptions = {friction: 1,frictionAir:.09,collisionFilter: {group: group}};
  var chestOptions = {friction: 1,frictionAir:.09,collisionFilter: {group: group}};
  var armOptions = {friction: 1, frictionAir: .09,collisionFilter: {group: group}};
  var legOptions = {friction: 1, frictionAir: .09,collisionFilter: {group: group}};
  var head  = Bodies.circle(x, y-70, 30, headOptions);
  var chest = Bodies.rectangle(x,y,60, 80,chestOptions);//40,120
  var rightUpperArm = Bodies.rectangle(x+40, y-20, 20, 40,armOptions);
  var rightLowerArm = Bodies.rectangle(x+40, y+20, 20, 60,armOptions);
  var leftUpperArm = Bodies.rectangle(x-40, y-20, 20, 40,armOptions);
  var leftLowerArm = Bodies.rectangle(x-40, y+20, 20, 60,armOptions);
  var leftUpperLeg = Bodies.rectangle(x-20, y+60, 20, 40,legOptions);
  var rightUpperLeg = Bodies.rectangle(x+20, y+60, 20, 40,legOptions);
  var leftLowerLeg = Bodies.rectangle(x-20, y+100, 20, 60,legOptions);
  var rightLowerLeg = Bodies.rectangle(x+20, y+100, 20, 60,legOptions);
  
  var legTorso = Body.create({
            parts: [chest, leftUpperLeg, rightUpperLeg],
            collisionFilter: {group: group},
        });
  
  var chestToRightUpperArm = Constraint.create({
            bodyA: legTorso,
            pointA: { x: 25, y: -40 },
            pointB: {x:-5, y:-10},
            bodyB: rightUpperArm,
            stiffness: .4,
            length: 2
      });
  var chestToLeftUpperArm = Constraint.create({
            bodyA: legTorso,
            pointA: { x: -25, y: -40 },
            pointB: {x:5, y:-10},
            bodyB: leftUpperArm,
            stiffness: .4,
            length: 2
      });

  var upperToLowerRightArm = Constraint.create({
            bodyA: rightUpperArm,
            bodyB: rightLowerArm,
            pointA: {x:0,y: 15},
            pointB: {x:0, y:-20},
            stiffness: .2
      });

  var upperToLowerLeftArm= Constraint.create({
            bodyA: leftUpperArm,
            bodyB: leftLowerArm,
            pointA: {x:0,y: 15},
            pointB: {x:0, y:-20},
            stiffness: .2,
            length: 1
      });
  
  var upperToLowerLeftLeg= Constraint.create({
            bodyA: legTorso,
            bodyB: leftLowerLeg,
            pointA: {x:-20,y: 60},
            pointB: {x:0, y:-25},
            stiffness: .4
      });
  
  var upperToLowerRightLeg= Constraint.create({
            bodyA: legTorso,
            bodyB: rightLowerLeg,
            pointA: {x:20,y: 60},
            pointB: {x:0, y:-25},
            stiffness: .4
      });

  var headContraint = Constraint.create({
            bodyA: head,
            pointA:{x:0, y: 20},
            pointB: {x:0, y:-50},
            bodyB: legTorso,
            stiffness: .7
        });
  
  return Composite.create({
    bodies: [
      legTorso,
      head,
      leftLowerArm,
      leftUpperArm,
      rightLowerArm, 
      rightUpperArm,
      leftLowerLeg,
      rightLowerLeg
    ],
    constraints: [
      headContraint,
      chestToLeftUpperArm,
      chestToRightUpperArm, 
      upperToLowerLeftArm,
      upperToLowerRightArm,
      upperToLowerLeftLeg,
      upperToLowerRightLeg
    ]
  });
}

var ground = Bodies.rectangle(screenW/2, screenH, screenW, 100, {
    render: {
      fillStyle: '#000000',
      strokeStyle: '#333',
      lineWidth: 0
    },
  isStatic: true, 
  friction: 1
});

// create rope
var ropeA = Composites.stack(50, 10, 2, 1, 11, 11, function(x, y) {
   return Bodies.rectangle(x, y, 50, 2, { collisionFilter: { group: group } });
 });

Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.5, length: 20 });
Composite.add(ropeA, Constraint.create({ 
  pointA: { x: screenW/2, y: 10 },
  pointB: { x: -20, y:0 },
  bodyB: ropeA.bodies[0],
  stiffness: 0.5,
  length: 20
}));
World.add(engine.world, ropeA);

// create pinata, connect to rope
var pinata = createPinata(screenW/2-50, screenH/2);
var pinataConstraint = Constraint.create({ 
  bodyA: ropeA.bodies[ropeA.bodies.length-1], 
  bodyB: pinata.bodies[1],
  pointA: { x: 25, y:0 },
  pointB: { x: 0, y: -30 },
  stiffness: 0.5,
  length: 20
});
World.add(engine.world, [pinata, pinataConstraint]);

// bat 
function dropBat() {
  var bat = Bodies.rectangle(0, 0, 100, 10, {

  });
  Body.setMass(bat, 2);
  Body.setAngularVelocity(bat, -.1);
  Body.applyForce(bat, { x: 0, y: 0 }, { x: 0.1, y: 0 });
  World.add(engine.world, [bat]);
}
setTimeout(dropBat, 2000);

// emit candy
function dropCandyPiece(x, y) {
  var c = Bodies.circle(x + Math.random()*5, y + Math.random()*5, 4, {});
  World.add(engine.world, c);
}

function dropCandy(x, y) {
  setTimeout(dropCandyPiece, 5, x, y);
  setTimeout(dropCandyPiece, 10, x, y);
  setTimeout(dropCandyPiece, 15, x, y);
  setTimeout(dropCandyPiece, 20, x, y);
  setTimeout(dropCandyPiece, 30, x, y);
  setTimeout(dropCandyPiece, 50, x, y);
}

setTimeout(function () {
  setInterval(function () {
    if (pinata.constraints.length<2) {
      if (c.bodyB.angularSpeed < 0.1) {
        dropCandy(c.bodyB.position.x, c.bodyB.position.y);
      }
      return;
    }

    var c = pinata.constraints[pinata.constraints.length-1];
    if (c.bodyB.angularSpeed < 0.1) {
      return;
    }

    Composite.remove(pinata, c);
    dropCandy(c.bodyB.position.x, c.bodyB.position.y);

  }, 1000);
}, 2000);

// 
World.add(engine.world, [mouseConstraint, ground]);
window.addEventListener("resize", function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    Body.setPosition(ground, {x:screenW/2, y: screenH-50});
});

Engine.run(engine);
Render.run(render);