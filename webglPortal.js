import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const canvas = document.getElementById("portal");
const scene = new THREE.Scene();

// Câmera ortográfica full screen
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Mouse para interatividade
let mouse = {x:0, y:0};
window.addEventListener("mousemove", e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5)*2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5)*2;
});

// Shader fragment para fundo psicodélico avançado
const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

// Simplex Noise (ou Perlin) pode ser adicionado para vórtice
float random(vec2 st){
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*43758.5453123);
}
void main(){
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float angle = atan(uv.y, uv.x) + uTime*0.5;
    float swirl = sin(angle*5.0 + uTime*3.0)*0.3;

    float red   = 0.5 + 0.5*sin(angle*4.0 + uTime + swirl*5.0);
    float green = 0.5 + 0.5*sin(angle*3.0 - uTime*0.8 + swirl*2.0);
    float blue  = 0.5 + 0.5*sin(angle*7.0 + uTime*0.5 + swirl*3.0);

    gl_FragColor = vec4(red, green, blue, 1.0);
}
`;

// Plano full screen com shader
const geometry = new THREE.PlaneGeometry(2,2);
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: {value:0},
        uMouse: {value:[0,0]}
    },
    fragmentShader
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Personagem central
const charGroup = new THREE.Group();

// Cabeça
const headGeo = new THREE.CircleGeometry(0.12,32);
const headMat = new THREE.MeshBasicMaterial({ color:0xff4fd8 });
const head = new THREE.Mesh(headGeo, headMat);
charGroup.add(head);

// Olhos
const eyeGeo = new THREE.CircleGeometry(0.03,16);
const leftEye = new THREE.Mesh(eyeGeo,new THREE.MeshBasicMaterial({color:0xffffff}));
leftEye.position.set(-0.04,0.02,0.01);
const rightEye = leftEye.clone();
rightEye.position.set(0.04,0.02,0.01);
charGroup.add(leftEye);
charGroup.add(rightEye);

// Pupilas
const pupilGeo = new THREE.CircleGeometry(0.01,16);
const leftPupil = new THREE.Mesh(pupilGeo,new THREE.MeshBasicMaterial({color:0x000000}));
leftPupil.position.set(-0.04,0.02,0.02);
const rightPupil = leftPupil.clone();
rightPupil.position.set(0.04,0.02,0.02);
charGroup.add(leftPupil);
charGroup.add(rightPupil);

// Mãos / partículas flutuantes
const handGeo = new THREE.CircleGeometry(0.02,12);
const hands = [];
for(let i=0;i<6;i++){
    const hand = new THREE.Mesh(handGeo,new THREE.MeshBasicMaterial({color:0x784ba0}));
    hands.push(hand);
    charGroup.add(hand);
}

scene.add(charGroup);

// Ajusta grupo para centro
charGroup.position.set(0,0,0);

// Clock
let clock = new THREE.Clock();

// Loop de animação
function animate(){
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    material.uniforms.uMouse.value = [mouse.x, mouse.y];

    // Respiração da cabeça
    const pulse = 1 + Math.sin(t*2)*0.05;
    charGroup.scale.set(pulse,pulse,pulse);

    // Olhos piscam
    const blink = Math.abs(Math.sin(t*2.5));
    leftEye.scale.y = blink;
    rightEye.scale.y = blink;

    // Pupilas seguem mouse
    leftPupil.position.x = -0.04 + mouse.x*0.02;
    leftPupil.position.y = 0.02 + mouse.y*0.02;
    rightPupil.position.x = 0.04 + mouse.x*0.02;
    rightPupil.position.y = 0.02 + mouse.y*0.02;

    // Mãos orbitando
    for(let i=0;i<hands.length;i++){
        const angle = i/6*Math.PI*2 + t*0.6;
        const radius = 0.18 + Math.sin(t+i)*0.05;
        hands[i].position.set(Math.cos(angle)*radius, Math.sin(angle)*radius,0);
    }

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}
animate();

// API para parar
window._stopPortal = () => {
    renderer.dispose();
    scene.clear();
}
