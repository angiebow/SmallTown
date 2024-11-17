/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

THREE.OrbitControls = function (object, domElement) {
    this.object = object;
  
    this.domElement = (domElement !== undefined) ? domElement : document;
  
    this.enabled = true;
  
    this.target = new THREE.Vector3();
  
    this.minDistance = 0;
    this.maxDistance = Infinity;
  
    this.minZoom = 0;
    this.maxZoom = Infinity;
  
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians
  
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians
  
    this.enableDamping = false;
    this.dampingFactor = 0.25;
  
    this.enableZoom = true;
    this.zoomSpeed = 1.0;
  
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
  
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = false; // if true, pan in screen-space
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push
  
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
  
    this.enableKeys = true;
  
    this.keys = {
      LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40,
    };
  
    this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };
  
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
  
    this.getPolarAngle = function () {
      return spherical.phi;
    };
  
    this.getAzimuthalAngle = function () {
      return spherical.theta;
    };
  
    this.saveState = function () {
      scope.target0.copy(scope.target);
      scope.position0.copy(scope.object.position);
      scope.zoom0 = scope.object.zoom;
    };
  
    this.reset = function () {
      scope.target.copy(scope.target0);
      scope.object.position.copy(scope.position0);
      scope.object.zoom = scope.zoom0;
  
      scope.object.updateProjectionMatrix();
      scope.dispatchEvent(changeEvent);
  
      scope.update();
  
      state = STATE.NONE;
    };
  
    this.update = (function () {
      let offset = new THREE.Vector3();
  
      let quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
      let quatInverse = quat.clone().inverse();
  
      let lastPosition = new THREE.Vector3();
      let lastQuaternion = new THREE.Quaternion();
  
      return function update() {
        let position = scope.object.position;
  
        offset.copy(position).sub(scope.target);
  
        offset.applyQuaternion(quat);
  
        spherical.setFromVector3(offset);
  
        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle());
        }
  
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
  
        spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
  
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
  
        spherical.makeSafe();
  
  
        spherical.radius *= scale;
  
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
  
        scope.target.add(panOffset);
  
        offset.setFromSpherical(spherical);
  
        offset.applyQuaternion(quatInverse);
  
        position.copy(scope.target).add(offset);
  
        scope.object.lookAt(scope.target);
  
        if (scope.enableDamping === true) {
          sphericalDelta.theta *= (1 - scope.dampingFactor);
          sphericalDelta.phi *= (1 - scope.dampingFactor);
  
          panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);
  
          panOffset.set(0, 0, 0);
        }
  
        scale = 1;
  
        if (zoomChanged
                  || lastPosition.distanceToSquared(scope.object.position) > EPS
                  || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          scope.dispatchEvent(changeEvent);
  
          lastPosition.copy(scope.object.position);
          lastQuaternion.copy(scope.object.quaternion);
          zoomChanged = false;
  
          return true;
        }
  
        return false;
      };
    }());
  
    this.dispose = function () {
      scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
      scope.domElement.removeEventListener('mousedown', onMouseDown, false);
      scope.domElement.removeEventListener('wheel', onMouseWheel, false);
  
      scope.domElement.removeEventListener('touchstart', onTouchStart, false);
      scope.domElement.removeEventListener('touchend', onTouchEnd, false);
      scope.domElement.removeEventListener('touchmove', onTouchMove, false);
  
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
  
      window.removeEventListener('keydown', onKeyDown, false);
  
    };
  
    var scope = this;
  
    var changeEvent = { type: 'change' };
    const startEvent = { type: 'start' };
    const endEvent = { type: 'end' };
  
    var STATE = {
      NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4,
    };
  
    var state = STATE.NONE;
  
    var EPS = 0.000001;
  
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();
  
    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;
  
    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();
  
    const panStart = new THREE.Vector2();
    const panEnd = new THREE.Vector2();
    const panDelta = new THREE.Vector2();
  
    const dollyStart = new THREE.Vector2();
    const dollyEnd = new THREE.Vector2();
    const dollyDelta = new THREE.Vector2();
  
    function getAutoRotationAngle() {
      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }
  
    function getZoomScale() {
      return Math.pow(0.95, scope.zoomSpeed);
    }
  
    function rotateLeft(angle) {
      sphericalDelta.theta -= angle;
    }
  
    function rotateUp(angle) {
      sphericalDelta.phi -= angle;
    }
  
    const panLeft = (function () {
      let v = new THREE.Vector3();
  
      return function panLeft(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);
  
        panOffset.add(v);
      };
    }());
  
    const panUp = (function () {
      let v = new THREE.Vector3();
  
      return function panUp(distance, objectMatrix) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1);
        } else {
          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.object.up, v);
        }
  
        v.multiplyScalar(distance);
  
        panOffset.add(v);
      };
    }());
  
    const pan = (function () {
      let offset = new THREE.Vector3();
  
      return function pan(deltaX, deltaY) {
        let element = scope.domElement === document ? scope.domElement.body : scope.domElement;
  
        if (scope.object.isPerspectiveCamera) {
          let position = scope.object.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();
  
          targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
  
          panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
        } else if (scope.object.isOrthographicCamera) {
          panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
          panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
        } else {
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
          scope.enablePan = false;
        }
      };
    }());
  
    function dollyIn(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale /= dollyScale;
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }
  
    function dollyOut(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale *= dollyScale;
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }
    function handleMouseDownRotate(event) {
  
      rotateStart.set(event.clientX, event.clientY);
    }
  
    function handleMouseDownDolly(event) {
  
      dollyStart.set(event.clientX, event.clientY);
    }
  
    function handleMouseDownPan(event) {
  
      panStart.set(event.clientX, event.clientY);
    }
  
    function handleMouseMoveRotate(event) {
  
      rotateEnd.set(event.clientX, event.clientY);
  
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
  
      const element = scope.domElement === document ? scope.domElement.body : scope.domElement;
  
      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
  
      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
  
      rotateStart.copy(rotateEnd);
  
      scope.update();
    }
  
    function handleMouseMoveDolly(event) {
  
      dollyEnd.set(event.clientX, event.clientY);
  
      dollyDelta.subVectors(dollyEnd, dollyStart);
  
      if (dollyDelta.y > 0) {
        dollyIn(getZoomScale());
      } else if (dollyDelta.y < 0) {
        dollyOut(getZoomScale());
      }
  
      dollyStart.copy(dollyEnd);
  
      scope.update();
    }
  
    function handleMouseMovePan(event) {
  
      panEnd.set(event.clientX, event.clientY);
  
      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
  
      pan(panDelta.x, panDelta.y);
  
      panStart.copy(panEnd);
  
      scope.update();
    }
  
    function handleMouseUp(event) {
    
    }
  
    function handleMouseWheel(event) {  
      if (event.deltaY < 0) {
        dollyOut(getZoomScale());
      } else if (event.deltaY > 0) {
        dollyIn(getZoomScale());
      }
  
      scope.update();
    }
  
    function handleKeyDown(event) {  
      switch (event.keyCode) {
        case scope.keys.UP:
          pan(0, scope.keyPanSpeed);
          scope.update();
          break;
  
        case scope.keys.BOTTOM:
          pan(0, -scope.keyPanSpeed);
          scope.update();
          break;
  
        case scope.keys.LEFT:
          pan(scope.keyPanSpeed, 0);
          scope.update();
          break;
  
        case scope.keys.RIGHT:
          pan(-scope.keyPanSpeed, 0);
          scope.update();
          break;
      }
    }
  
    function handleTouchStartRotate(event) {  
      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }
  
    function handleTouchStartDollyPan(event) {  
      if (scope.enableZoom) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
  
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        dollyStart.set(0, distance);
      }
  
      if (scope.enablePan) {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
  
        panStart.set(x, y);
      }
    }
  
    function handleTouchMoveRotate(event) {  
      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
  
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
  
      const element = scope.domElement === document ? scope.domElement.body : scope.domElement;
  
      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
  
      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
  
      rotateStart.copy(rotateEnd);
  
      scope.update();
    }
  
    function handleTouchMoveDollyPan(event) {  
      if (scope.enableZoom) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
  
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        dollyEnd.set(0, distance);
  
        dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
  
        dollyIn(dollyDelta.y);
  
        dollyStart.copy(dollyEnd);
      }
  
      if (scope.enablePan) {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
  
        panEnd.set(x, y);
  
        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
  
        pan(panDelta.x, panDelta.y);
  
        panStart.copy(panEnd);
      }
  
      scope.update();
    }
  
    function handleTouchEnd(event) {  
    }
  
    function onMouseDown(event) {
      if (scope.enabled === false) return;
  
      event.preventDefault();
  
      switch (event.button) {
        case scope.mouseButtons.LEFT:
  
          if (event.ctrlKey || event.metaKey) {
            if (scope.enablePan === false) return;
  
            handleMouseDownPan(event);
  
            state = STATE.PAN;
          } else {
            if (scope.enableRotate === false) return;
  
            handleMouseDownRotate(event);
  
            state = STATE.ROTATE;
          }
  
          break;
  
        case scope.mouseButtons.MIDDLE:
  
          if (scope.enableZoom === false) return;
  
          handleMouseDownDolly(event);
  
          state = STATE.DOLLY;
  
          break;
  
        case scope.mouseButtons.RIGHT:
  
          if (scope.enablePan === false) return;
  
          handleMouseDownPan(event);
  
          state = STATE.PAN;
  
          break;
      }
  
      if (state !== STATE.NONE) {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
  
        scope.dispatchEvent(startEvent);
      }
    }
  
    function onMouseMove(event) {
      if (scope.enabled === false) return;
  
      event.preventDefault();
  
      switch (state) {
        case STATE.ROTATE:
  
          if (scope.enableRotate === false) return;
  
          handleMouseMoveRotate(event);
  
          break;
  
        case STATE.DOLLY:
  
          if (scope.enableZoom === false) return;
  
          handleMouseMoveDolly(event);
  
          break;
  
        case STATE.PAN:
  
          if (scope.enablePan === false) return;
  
          handleMouseMovePan(event);
  
          break;
      }
    }
  
    function onMouseUp(event) {
      if (scope.enabled === false) return;
  
      handleMouseUp(event);
  
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
  
      scope.dispatchEvent(endEvent);
  
      state = STATE.NONE;
    }
  
    function onMouseWheel(event) {
      if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
  
      event.preventDefault();
      event.stopPropagation();
  
      scope.dispatchEvent(startEvent);
  
      handleMouseWheel(event);
  
      scope.dispatchEvent(endEvent);
    }
  
    function onKeyDown(event) {
      if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
  
      handleKeyDown(event);
    }
  
    function onTouchStart(event) {
      if (scope.enabled === false) return;
  
      event.preventDefault();
  
      switch (event.touches.length) {
        case 1:	// one-fingered touch: rotate
  
          if (scope.enableRotate === false) return;
  
          handleTouchStartRotate(event);
  
          state = STATE.TOUCH_ROTATE;
  
          break;
  
        case 2:	// two-fingered touch: dolly-pan
  
          if (scope.enableZoom === false && scope.enablePan === false) return;
  
          handleTouchStartDollyPan(event);
  
          state = STATE.TOUCH_DOLLY_PAN;
  
          break;
  
        default:
  
          state = STATE.NONE;
      }
  
      if (state !== STATE.NONE) {
        scope.dispatchEvent(startEvent);
      }
    }
  
    function onTouchMove(event) {
      if (scope.enabled === false) return;
  
      event.preventDefault();
      event.stopPropagation();
  
      switch (event.touches.length) {
        case 1: // one-fingered touch: rotate
  
          if (scope.enableRotate === false) return;
          if (state !== STATE.TOUCH_ROTATE) return; // is this needed?
  
          handleTouchMoveRotate(event);
  
          break;
  
        case 2: // two-fingered touch: dolly-pan
  
          if (scope.enableZoom === false && scope.enablePan === false) return;
          if (state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?
  
          handleTouchMoveDollyPan(event);
  
          break;
  
        default:
  
          state = STATE.NONE;
      }
    }
  
    function onTouchEnd(event) {
      if (scope.enabled === false) return;
  
      handleTouchEnd(event);
  
      scope.dispatchEvent(endEvent);
  
      state = STATE.NONE;
    }
  
    function onContextMenu(event) {
      if (scope.enabled === false) return;
  
      event.preventDefault();
    }
    
    scope.domElement.addEventListener('contextmenu', onContextMenu, false);
  
    scope.domElement.addEventListener('mousedown', onMouseDown, false);
    scope.domElement.addEventListener('wheel', onMouseWheel, false);
  
    scope.domElement.addEventListener('touchstart', onTouchStart, false);
    scope.domElement.addEventListener('touchend', onTouchEnd, false);
    scope.domElement.addEventListener('touchmove', onTouchMove, false);
  
    window.addEventListener('keydown', onKeyDown, false);
    
    this.update();
  };
  
  THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
  THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
  
  Object.defineProperties(THREE.OrbitControls.prototype, {
  
    center: {
  
      get() {
        console.warn('THREE.OrbitControls: .center has been renamed to .target');
        return this.target;
      },
  
    },
    
    noZoom: {
  
      get() {
        console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
        return !this.enableZoom;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
        this.enableZoom = !value;
      },
  
    },
  
    noRotate: {
  
      get() {
        console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
        return !this.enableRotate;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
        this.enableRotate = !value;
      },
  
    },
  
    noPan: {
  
      get() {
        console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
        return !this.enablePan;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
        this.enablePan = !value;
      },
  
    },
  
    noKeys: {
  
      get() {
        console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
        return !this.enableKeys;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
        this.enableKeys = !value;
      },
  
    },
  
    staticMoving: {
  
      get() {
        console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
        return !this.enableDamping;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
        this.enableDamping = !value;
      },
  
    },
  
    dynamicDampingFactor: {
  
      get() {
        console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
        return this.dampingFactor;
      },
  
      set(value) {
        console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
        this.dampingFactor = value;
      },
  
    },
  
  });
  