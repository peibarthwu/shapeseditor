import "./style.css";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const v0_x = -2;
const v0_y = -2;
const v0_z = -2;

const v1_x = -4;
const v1_y = -1;
const v1_z = 0;

const v2_x = 2;
const v2_y = 1;
const v2_z = 0;

const v3_x = 0;
const v3_y = 1;
const v3_z = 1;

let num_shapes = 45;
let opacityValue = 0.6;
let min_size = 0.1;
let max_size = 1;
let rotationValue = Math.PI / 2;
let scene, camera, renderer, controls, curve;
let planes = [];
let positions = [];
let gradient = true;
let basecolor = 0xffffff;
let duration = 1;

//INIT SCENE
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three").appendChild(renderer.domElement);
camera.position.z = 5;
const material = new THREE.MeshBasicMaterial({
  color: basecolor,
  side: THREE.DoubleSide,
});
material.opacity = opacityValue;
material.transparent = true;
curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(v0_x, v0_y, v0_z),
  new THREE.Vector3(v1_x, v1_y, v1_z),
  new THREE.Vector3(v2_x, v2_y, v2_z),
  new THREE.Vector3(v3_x, v3_y, v3_z)
);
redrawPlanes();

//DEBUG CONTROLS
controls = new OrbitControls(camera, renderer.domElement);

//DRAW PLANES
function redrawPlanes() {
  material.opacity = opacityValue;
  const points = curve.getPoints(num_shapes);
  planes = [];
  positions = [];
  for (let i = 0; i < num_shapes; i++) {
    const size = (max_size - min_size) / num_shapes;
    const geometry = new THREE.PlaneGeometry(i * size, i * size);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    plane.rotation.x = rotationValue;
    plane.position.x = points[i].x + (i * size) / 2;
    plane.position.y = points[i].y;
    plane.position.z = points[i].z + (i * size) / 2;
    planes.push(plane);
    positions.push(plane.position);
    console.log(gradient);
    if (gradient) {
      const gradMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3103 + i * i,
        side: THREE.DoubleSide,
      });
      gradMaterial.opacity = opacityValue;
      gradMaterial.transparent = true;
      plane.material = gradMaterial;
    } else {
      if (!(plane.material == material)) {
        console.log("change");
        plane.material.dispose();
        plane.material = material;
      }
    }
  }
}

//REDRAW SCENE
function redrawScene() {
  for (let i = 0; i < planes.length; i++) {
    planes[i].geometry.dispose();
    scene.remove(planes[i]);
  }
  redrawPlanes();
}

//RENDER
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  controls.update();
}
render();

//ANIMATE
function animatePlanes() {
  const size = (max_size - min_size) / num_shapes;
  const points = curve.getPoints(num_shapes);
  for (let i = 0; i < planes.length; i++) {
    planes[i].visible = false;
  }
  for (let i = 0; i < planes.length; i++) {
    const size = (max_size - min_size) / num_shapes;
    setTimeout(() => {
      gsap.fromTo(
        planes[i],
        {
          visible: false,
        },
        {
          visible: true,

          duration: duration,
        }
      );
      gsap.fromTo(
        planes[i].scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.1,
        },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: duration,
        }
      );
      if (i > 0) {
        gsap.fromTo(
          planes[i].position,
          {
            x: points[i - 1].x + ((i - 1) * size) / 2,
            y: points[i - 1].y,
            z: points[i - 1].z + ((i - 1) * size) / 2,
          },
          {
            x: points[i].x + (i * size) / 2,
            y: points[i].y,
            z: points[i].z + (i * size) / 2,
            duration: duration,
          }
        );
      }
    }, 100 * duration * i);

    // gsap.fromTo(
    //   planes[i].position,
    //   {
    //     x: curve.v0.x,
    //     y: curve.v0.x,
    //     z: curve.v0.x,
    //   },
    //   {
    //     x: points[i].x + (i * size) / 2,
    //     y: points[i].y,
    //     z: points[i].z + (i * size) / 2,
    //     duration: duration,
    //   }
    // );

    console.log(i * 0.1);
  }
}

//RESIZE
window.addEventListener("resize", function () {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

//GUI STUFF SO U CAN EDIT
function setUpControls() {
  const durationControl = document.getElementById("duration");
  console.log(durationControl);
  durationControl.addEventListener("input", function () {
    duration = durationControl.value;
  });

  const numPlanes = document.getElementById("numPlanes");
  numPlanes.addEventListener("input", function () {
    num_shapes = numPlanes.value;
    redrawScene();
  });

  const opacity = document.getElementById("opacity");
  opacity.addEventListener("input", function () {
    opacityValue = opacity.value;
    redrawScene();
  });

  const rotation = document.getElementById("rotation");
  rotation.addEventListener("input", function () {
    rotationValue = rotation.value;
    redrawScene();
  });

  const maxSize = document.getElementById("maxSize");
  maxSize.addEventListener("input", function () {
    max_size = maxSize.value;
    redrawScene();
  });

  const v0_x_control = document.getElementById("v0_x");
  v0_x_control.addEventListener("input", function () {
    curve.v0.x = v0_x_control.value;
    redrawScene();
  });

  const v0_y_control = document.getElementById("v0_y");
  v0_y_control.addEventListener("input", function () {
    curve.v0.y = v0_y_control.value;
    redrawScene();
  });

  const v0_z_control = document.getElementById("v0_z");
  v0_z_control.addEventListener("input", function () {
    curve.v0.z = v0_z_control.value;
    redrawScene();
  });

  const v1_x_control = document.getElementById("v1_x");
  v1_x_control.addEventListener("input", function () {
    curve.v1.x = v1_x_control.value;
    redrawScene();
  });

  const v1_y_control = document.getElementById("v1_y");
  v1_y_control.addEventListener("input", function () {
    curve.v1.y = v1_y_control.value;
    redrawScene();
  });

  const v1_z_control = document.getElementById("v1_z");
  v1_z_control.addEventListener("input", function () {
    curve.v1.z = v1_z_control.value;
    redrawScene();
  });

  const v2_x_control = document.getElementById("v2_x");
  v2_x_control.addEventListener("input", function () {
    curve.v2.x = v2_x_control.value;
    redrawScene();
  });

  const v2_y_control = document.getElementById("v2_y");
  v2_y_control.addEventListener("input", function () {
    curve.v2.y = v2_y_control.value;
    redrawScene();
  });

  const v2_z_control = document.getElementById("v2_z");
  v2_z_control.addEventListener("input", function () {
    curve.v2.z = v2_z_control.value;
    redrawScene();
  });

  const v3_x_control = document.getElementById("v3_x");
  v3_x_control.addEventListener("input", function () {
    curve.v3.x = v3_x_control.value;
    redrawScene();
  });

  const v3_y_control = document.getElementById("v3_y");
  v3_y_control.addEventListener("input", function () {
    curve.v3.y = v3_y_control.value;
    redrawScene();
  });

  const v3_z_control = document.getElementById("v3_z");
  v3_z_control.addEventListener("input", function () {
    curve.v3.z = v3_z_control.value;
    redrawScene();
  });

  const color = document.getElementById("color");
  color.addEventListener("input", function () {
    material.color = new THREE.Color(color.value);
    redrawScene();
  });

  const bgcolor = document.getElementById("bgcolor");
  bgcolor.addEventListener("input", function () {
    scene.background = new THREE.Color(bgcolor.value);
    redrawScene();
  });

  const gradientControl = document.getElementById("gradient");
  gradientControl.addEventListener("input", function () {
    gradient = gradientControl.checked;
    redrawScene();
  });

  const runanimation = document.getElementById("runanimation");
  runanimation.onclick = function () {
    animatePlanes();
  };

  let controlVisibility = true;
  const inputs = document.getElementById("inputs");
  const hidecontrols = document.getElementById("hidecontrols");
  hidecontrols.onclick = function () {
    controlVisibility = !controlVisibility;
    if (controlVisibility) {
      inputs.style.display = "block";
    } else {
      inputs.style.display = "none";
    }
  };
}
setUpControls();
