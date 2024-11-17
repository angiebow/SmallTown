Physijs.scripts.worker = "/js/physijs_worker.js";
Physijs.scripts.ammo = "/js/ammo.js";

var bwf = 3.5;  //bus wheel friction 
var bwr = 0;  //bus wheel restitution
var pf = 4.2;  //platform friction
var pr = 0;  //platform restitution
var backgroundColor = 0xCDD3D6;
 
var scene, environment, camera;
var busArray = [];
var Player1 = { name: "gretchen", score: 0 };
var Player2 = { name: "bertha", score: 0 };
var roundActive = false;
var loadingAnimation = document.getElementById("loading_animation_page");  // "visibility:hidden" in css

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function Environment() {
  
  scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, -50, 0));

  renderer.setClearColor (backgroundColor, 1);

  camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 10000 );
  camera.position.set( 0, 300, 600 );
  camera.zoom = 3;
  scene.add( camera );

  var lightA1 = new THREE.AmbientLight(0xFFFFFF, 0.85);
  scene.add(lightA1);
  var lightD1 = new THREE.DirectionalLight( 0xFFFFFF, 0.3 );
  lightD1.position.set( -20, 100, 20 );
  lightD1.castShadow = true;
  lightD1.shadow.camera.left = -100;
  lightD1.shadow.camera.top = -100;
  lightD1.shadow.camera.right = 100;
  lightD1.shadow.camera.bottom = 100;
  lightD1.shadow.camera.near = 1;
  lightD1.shadow.camera.far = 130;
  lightD1.shadow.mapSize.height = lightD1.shadow.mapSize.width = 1000;
  scene.add( lightD1 );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.fog = new THREE.Fog( 
    backgroundColor, 
    camera.position.z + 5, 
    camera.position.z + 200 
  );

  var platform;
  var platformDiameter = 170;
  var platformRadiusTop = platformDiameter * 0.5;  
  var platformRadiusBottom = platformDiameter * 0.5 + 0.2;
  var platformHeight = 1;
  var platformSegments = 85;
  
  var platformGeometry = new THREE.CylinderGeometry( 
    platformRadiusTop, 
    platformRadiusBottom, 
    platformHeight, 
    platformSegments 
  );
  
  var physiPlatformMaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial(), pf, pr  
  );
  var physiPlatform = new Physijs.CylinderMesh(platformGeometry, physiPlatformMaterial, 0 );
  physiPlatform.name = "physicalPlatform";
  physiPlatform.position.set(0, -0.5, 0);
  physiPlatform.visible = false;
  scene.add( physiPlatform );

  var platformMaterialsArray = [];
  var platformMaterialColor = new THREE.MeshLambertMaterial( { color: 0x606060 } );
  platformMaterialsArray.push( platformMaterialColor );  //(materialindex = 0)
  var platformImage = "./images/asphalt_texture.jpg";
  var platformTextureLoader = new THREE.TextureLoader();
  ptr = 4.5;  //platform texture repeat
  platformTextureLoader.load(platformImage, function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( ptr, ptr );
    var platformMaterialImage = new THREE.MeshLambertMaterial( { map: texture } );
    platformMaterialsArray.push( platformMaterialImage );  //(materials index = 1)
  });
  var faceCount = platformGeometry.faces.length;
  for ( i=0; i<faceCount; i++ ) {
    if ( i < platformSegments*2 ) {  //(cylinder side)
      platformGeometry.faces[i].materialIndex = 0;
    } else if ( i < platformSegments*3 ) {  //(cylinder top)
      platformGeometry.faces[i].materialIndex = 1;
    } else {  //(cylinder bottom)
      platformGeometry.faces[i].materialIndex = 0;
    }
  }
  var visiblePlatform = new THREE.Mesh( platformGeometry, platformMaterialsArray );
  visiblePlatform.name = "visiblePlatform";
  visiblePlatform.position.set(0, -0.5, 0);
  visiblePlatform.rotation.y = 0.4;
  visiblePlatform.receiveShadow = true;
  scene.add( visiblePlatform );

}

function Bus(platformSide) {  //platformSide should be "platformLeft" or "platformRight"
  
  var bus = this;
  bus.platformSide = platformSide;
  bus.score = 0;

  var bfp = ( bus.platformSide == "platformLeft" ? { x:-40, y:3, z:0 } : { x:40, y:3, z:0 } );  //bus frame position
  var busFrameGeometry = new THREE.BoxGeometry( 33, 4, 5 );
  var busFrameMesh = new THREE.MeshStandardMaterial({ color: 0x333333 });
  var busFrameMaterial = Physijs.createMaterial( busFrameMesh, 0.9, 0.9 );
  bus.frame = new Physijs.BoxMesh(busFrameGeometry, busFrameMaterial, 100 );
  bus.frame.name = "frame";
  bus.frame.componentOf = "bus";
  bus.frame.position.set( bfp.x, bfp.y, bfp.z );
  bus.frame.castShadow = true;

  var busInteriorGeometry = new THREE.BoxGeometry( 33, 7, 11 );
  var busInteriorMesh = new THREE.MeshStandardMaterial({ color: 0x777777 });
  var busInteriorMaterial = Physijs.createMaterial( busInteriorMesh, 50, 50 );
  bus.interior = new Physijs.BoxMesh(busInteriorGeometry, busInteriorMaterial, 5000 );
  bus.interior.name = "interior";
  bus.interior.visible = false;  //(if visible, edges stick out from rounded frame)
  bus.interior.componentOf = "bus"; 
  bus.interior.position.set( 0, 5.5, 0 );
  bus.frame.add(bus.interior);

  var color = ( bus.platformSide == "platformLeft" ? "green" : "red" );
  var loader = new THREE.GLTFLoader();
  loader.load(
    `./gltf/bus_body_${color}.glb`,
    function ( gltf ) {
      var scale = 5.6;  
      bus.body = gltf.scene.children[0]; 
      bus.body.name = "body";
      bus.body.componentOf = "bus"; 
      bus.body.rotation.set ( 0, -1.5708, 0 );
      bus.body.scale.set (scale,scale,scale);
      bus.body.position.set ( 0, 3.6, 0 );
      bus.body.castShadow = true;
      bus.frame.add(bus.body);
    },
  );
  
  if ( bus.platformSide === "platformLeft" ) { bus.frame.rotation.y = Math.PI; }
  
  scene.add( bus.frame );
  
  var fr = 2;  //wheel front radius
  var br = 2;  //wheel back radius
  var wi = 1;  //wheel width
  var segments = 50;  //wheel cylinder segments (pie slices)
  var busWheelMaterialsArray = [];
  var busWheelImage = "./images/bus_wheel_front_uv_fill.png";
  var busWheelGeometry = new THREE.CylinderGeometry( fr, br, wi, segments );

  var busWheelColorBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
  var busWheelColorMaterial = Physijs.createMaterial( busWheelColorBaseMaterial, bwf, bwr );
  busWheelMaterialsArray.push( busWheelColorMaterial );  //(.materialindex = 0)

  var busWheelImageLoader = new THREE.TextureLoader();
  busWheelImageLoader.load( busWheelImage, function ( texture ) { 
    var busWheelImageMaterial = Physijs.createMaterial( 
      new THREE.MeshBasicMaterial({ map: texture }), bwf, bwr 
    ); 
    busWheelMaterialsArray.push( busWheelImageMaterial ); 
  }); 

  var busWheelFaceCount = busWheelGeometry.faces.length;
  for ( i=0; i<busWheelFaceCount; i++ ) {
    if ( i < segments*2 ) {
      busWheelGeometry.faces[i].materialIndex = 0; 
    } else if ( i < segments*3 ) {
      busWheelGeometry.faces[i].materialIndex = 1; 
    } else {
      busWheelGeometry.faces[i].materialIndex = 0; 
    }
  }

  bus.wheel_fl = new Physijs.CylinderMesh( busWheelGeometry, busWheelMaterialsArray, 300 );
  bus.wheel_fr = new Physijs.CylinderMesh( busWheelGeometry, busWheelMaterialsArray, 300 );
  bus.wheel_bl = new Physijs.CylinderMesh( busWheelGeometry, busWheelMaterialsArray, 300 );
  bus.wheel_br = new Physijs.CylinderMesh( busWheelGeometry, busWheelMaterialsArray, 300 );

  var frontX, backX;
  if ( bus.platformSide === "platformRight" ) {
    frontX = bfp.x - 9.5; backX = bfp.x + 9.5;
  } else { 
    frontX = bfp.x + 9.5; backX = bfp.x - 9.5; 
  }
  configureWheel( bus.wheel_fl, { x: frontX, y: 2, z: bfp.z + 5 }, "port" );
  configureWheel( bus.wheel_fr, { x: frontX, y: 2, z: bfp.z - 5 }, "starboard" );
  configureWheel( bus.wheel_bl, { x: backX, y: 2, z: bfp.z + 5 }, "port" );
  configureWheel( bus.wheel_br, { x: backX, y: 2, z: bfp.z - 5 }, "starboard" );   
  
  var wheel_fl_constraint = new Physijs.DOFConstraint( bus.wheel_fl, bus.frame, bus.wheel_fl.position );
  var wheel_fr_constraint = new Physijs.DOFConstraint( bus.wheel_fr, bus.frame, bus.wheel_fr.position );
  var wheel_bl_constraint = new Physijs.DOFConstraint( bus.wheel_bl, bus.frame, bus.wheel_bl.position );
  var wheel_br_constraint = new Physijs.DOFConstraint( bus.wheel_br, bus.frame, bus.wheel_br.position );

  bus.wheel_fl_constraint = configureWheelConstraints( wheel_fl_constraint );
  bus.wheel_fr_constraint = configureWheelConstraints( wheel_fr_constraint );
  bus.wheel_bl_constraint = configureWheelConstraints( wheel_bl_constraint );
  bus.wheel_br_constraint = configureWheelConstraints( wheel_br_constraint );

}

function playLoadingAnimationIfDocumentNotReady() {
  loadingAnimation.style.visibility = "visible";
  document.onreadystatechange = () => {
    if (document.readyState === "complete") { 
      loadingAnimation.style.visibility = "hidden"; 
    }
  };
}

function onWindowResize() {
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}

function configureWheel( wheel, position, BusSide ) {
  wheel.name = "wheel";
  wheel.componentOf = "bus";
  BusSide === "port" ? wheel.rotation.x = Math.PI / 2 : wheel.rotation.x = -Math.PI / 2;
  wheel.position.set( position.x, position.y, position.z );
  wheel.setDamping( 0.5, 0.5 );
  wheel.castShadow = true;
  scene.add( wheel );
}

function configureWheelConstraints( constraint ) {
  scene.addConstraint( constraint );
  constraint.setAngularLowerLimit({ x: 0, y: 0, z: 1 });
  constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
  return constraint;
}

function restartGame() {
  window.location.reload();
}

function initializeMatch() {
  environment = new Environment();
  busArray = [];
  busArray.push( new Bus("platformLeft") );
  busArray.push( new Bus("platformRight") );
  roundActive = true;
}

function displayLoadingAnimation(milliseconds) {
  loadingAnimation.style.visibility = "visible";
  setTimeout(function(){ loadingAnimation.style.visibility = "hidden"; }, milliseconds); 
}

function pause(milliseconds) {
  var then = Date.now(); 
  var now;
  do { now = Date.now(); } while ( now - then < milliseconds );
}

function freezeBuses() {
  for ( i=0; i<busArray.count; i++ ) {
    busArray[i].frame.mass = 0;
    busArray[i].interior.mass = 0;
    busArray[i].wheel_fl.mass = busArray[i].wheel_fr.mass = 0;
    busArray[i].wheel_bl.mass = busArray[i].wheel_br.mass = 0;
  } 
}

function restartGame() {
  Player1.score = 0;
  Player2.score = 0;
  var greenScoreEls = document.getElementsByClassName("green_score");  
  var redScoreEls = document.getElementsByClassName("red_score");
  for ( i=0; i<2; i++) {
    greenScoreEls[i].src = "./images/bus_0of3_green.svg";
    redScoreEls[i].src = "./images/bus_0of3_red.svg";
  }
  $("#game_win_gretchen_page_div").css("visibility", "hidden");
  $("#game_win_bertha_page_div").css("visibility", "hidden");
  initializeMatch();
}

function aBusHasFallen() {
  return ( busArray[0].frame.position.y < -50 || busArray[1].frame.position.y < -50 );
}

function bothBusesHaveFallen() {
  return ( busArray[0].frame.position.y < 0 && busArray[1].frame.position.y < 0 );
}

function declareMatchDraw() {
  $("#round_draw_page_div").css("visibility", "visible");
}

function declareRoundWin(winner) {
  loadingAnimation.style.visibility = "visible";
  var cardEl = document.getElementById("round_win_card"); 
  cardEl.src = `./images/bus_round_win_card_${winner.name}.svg`;
  var greenScoreEls = document.getElementsByClassName("green_score");  
  var redScoreEls = document.getElementsByClassName("red_score");
  for ( i=0; i<2; i++) {
    greenScoreEls[i].src = `./images/bus_${Player1.score}of3_green.svg`;
    redScoreEls[i].src = `./images/bus_${Player2.score}of3_red.svg`;
  };
  $("#round_win_page_div").css("visibility", "visible");
  displayLoadingAnimation(1500);
}

function declareGameWin(winner) {
  loadingAnimation.style.visibility = "visible";
  if (winner.name === "gretchen") {
    $("#game_win_gretchen_page_div").css("visibility", "visible");
  } else {
    $("#game_win_bertha_page_div").css("visibility", "visible");
  }
  displayLoadingAnimation(1500);
}

function checkForMatchCompletion() {
  if ( aBusHasFallen() ) {
    freezeBuses(); 
    pause(1000);
    roundActive = false;
    if ( bothBusesHaveFallen() ) { 
      declareMatchDraw();
    } else {
      var winner = busArray[0].frame.position.y > 0 ? Player1 : Player2;
      winner.score += 1;
      if (winner.score < 3) {
        declareRoundWin(winner);
      } else {
        declareGameWin(winner);
      }
    }
  }
}

function handleKeyDown ( keyEvent ) {
  switch ( keyEvent.keyCode ) {
    // BUS 1
    // pivots wheels for steering
    case 65: case 37:  // "a" key or left arrow key (turn left)
      busArray[0].wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, 10, 200 );
      busArray[0].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[0].wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, 10, 200 );
      busArray[0].wheel_fl_constraint.enableAngularMotor( 1 );
    break;
    case 68: case 39:  // "d" key  or right arrow key (turn right)
      busArray[0].wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, -10, 200 );
      busArray[0].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[0].wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, -10, 200 );
      busArray[0].wheel_fl_constraint.enableAngularMotor( 1 );
    break;
    // rotates wheels for propulsion
    case 87: case 38: // "w" key or up arrow key (forward)
      busArray[0].wheel_bl_constraint.configureAngularMotor( 2, 1, 0, -30, 50000 );
      busArray[0].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[0].wheel_br_constraint.configureAngularMotor( 2, 1, 0, -30, 50000 );
      busArray[0].wheel_br_constraint.enableAngularMotor( 2 );
    break;
    case 83: case 40:  // "s" key or down arrow key (backward)
      busArray[0].wheel_bl_constraint.configureAngularMotor( 2, 1, 0, 20, 3500 );
      busArray[0].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[0].wheel_br_constraint.configureAngularMotor( 2, 1, 0, 20, 3500 );
      busArray[0].wheel_br_constraint.enableAngularMotor( 2 );
    break;
    // BUS 2
    // pivots wheels for steering
    case 76:  // "l" key (turn left)
      busArray[1].wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, 10, 200 );
      busArray[1].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[1].wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, 10, 200 );
      busArray[1].wheel_fl_constraint.enableAngularMotor( 1 );
    break;
    case 222:  // "'" key (turn right)
      busArray[1].wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, -10, 200 );
      busArray[1].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[1].wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 4, Math.PI / 4, -10, 200 );
      busArray[1].wheel_fl_constraint.enableAngularMotor( 1 );
    break;
    // rotates wheels for propulsion
    case 80:  // "p" key (forward)
      busArray[1].wheel_bl_constraint.configureAngularMotor( 2, 1, 0, 30, 50000 );
      busArray[1].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[1].wheel_br_constraint.configureAngularMotor( 2, 1, 0, 30, 50000 );
      busArray[1].wheel_br_constraint.enableAngularMotor( 2 );
    break;
    case 186:  // ";" key (backward)
      busArray[1].wheel_bl_constraint.configureAngularMotor( 2, 1, 0, -20, 3500 );
      busArray[1].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[1].wheel_br_constraint.configureAngularMotor( 2, 1, 0, -20, 3500 );
      busArray[1].wheel_br_constraint.enableAngularMotor( 2 );
    break;
  }
}

function handleKeyUp(keyEvent){
   switch( keyEvent.keyCode ) {
     case 65: case 68: case 37: case 39:
      busArray[0].wheel_fr_constraint.configureAngularMotor( 1, 0, 0, 10, 200 );
      busArray[0].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[0].wheel_fl_constraint.configureAngularMotor( 1, 0, 0, 10, 200 );
      busArray[0].wheel_fl_constraint.enableAngularMotor( 1 );
		break;
     case 87: case 83: case 38: case 40: 
      busArray[0].wheel_bl_constraint.configureAngularMotor( 2, 0, 0, 0, 2000 );
      busArray[0].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[0].wheel_br_constraint.configureAngularMotor( 2, 0, 0, 0, 2000 );
      busArray[0].wheel_br_constraint.enableAngularMotor( 2 );
		break;
    case 76: case 222:
      busArray[1].wheel_fr_constraint.configureAngularMotor( 1, 0, 0, 10, 200 );
      busArray[1].wheel_fr_constraint.enableAngularMotor( 1 );
      busArray[1].wheel_fl_constraint.configureAngularMotor( 1, 0, 0, 10, 200 );
      busArray[1].wheel_fl_constraint.enableAngularMotor( 1 );
		break;
     case 80: case 186:
      busArray[1].wheel_bl_constraint.configureAngularMotor( 2, 0, 0, 0, 2000 );
      busArray[1].wheel_bl_constraint.enableAngularMotor( 2 );
      busArray[1].wheel_br_constraint.configureAngularMotor( 2, 0, 0, 0, 2000 );
      busArray[1].wheel_br_constraint.enableAngularMotor( 2 );
		break;
	}
}

window.addEventListener("resize", onWindowResize, false);

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

$("#landing_page_div").click(function(){ 
  displayLoadingAnimation(500); 
  $("#landing_page_div").hide();  
  initializeMatch(); 
});

$("#button_restart").click(function(){ 
  displayLoadingAnimation(1500); 
  restartGame();
});

$("#button_draw").click(function(){ 
  declareMatchDraw(); 
});

$("#button_play_next_round").click(function(){ 
  displayLoadingAnimation(1500); 
  $("#round_win_page_div").css("visibility", "hidden"); 
  initializeMatch(); 
});

$("#button_replay_round").click(function(){ 
  displayLoadingAnimation(1500); 
  $("#round_draw_page_div").css("visibility", "hidden"); 
  initializeMatch(); 
});

$(".button_new_game").click(function(){ 
  displayLoadingAnimation(1500); 
  restartGame(); 
});

initializeMatch();

function render() {
  if ( roundActive === true ) { checkForMatchCompletion(); }
  scene.simulate();
  camera.lookAt( 0, 1, 0 );
  camera.updateProjectionMatrix();
  renderer.render( scene, camera);
  requestAnimationFrame( render );  
}

render();