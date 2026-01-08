import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { SVGLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/SVGLoader.js';

const canvas = document.getElementById("portal");
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Mouse interativo
let mouse = {x:0, y:0};
window.addEventListener("mousemove", e=>{
    mouse.x = (e.clientX/window.innerWidth - 0.5)*2;
    mouse.y = -(e.clientY/window.innerHeight - 0.5)*2;
});

// Fundo psicodélico via shader
const fragShader = `
uniform float uTime;
varying vec2 vUv;
void main(){
    vec2 uv = vUv-0.5;
    float r = length(uv);
    float angle = atan(uv.y, uv.x) + uTime*0.5;
    float swirl = sin(angle*5.0 + uTime*3.0)*0.3;
    float red   = 0.5 + 0.5*sin(angle*4.0 + uTime + swirl*5.0);
    float green = 0.5 + 0.5*sin(angle*3.0 - uTime*0.8 + swirl*2.0);
    float blue  = 0.5 + 0.5*sin(angle*7.0 + uTime*0.5 + swirl*3.0);
    gl_FragColor = vec4(red,green,blue,1.0);
}`;

const planeGeo = new THREE.PlaneGeometry(2,2);
const planeMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0} },
    fragmentShader: fragShader
});
scene.add(new THREE.Mesh(planeGeo, planeMat));

// Personagem SVG
const charGroup = new THREE.Group();
scene.add(charGroup);

// Exemplo de SVG (substitua pelos paths detalhados do personagem)
const svgString = `
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="60" fill="#ff4fd8"/>
  <circle cx="70" cy="90" r="15" fill="#fff"/>
  <circle cx="130" cy="90" r="15" fill="#fff"/>
  <circle cx="70" cy="90" r="6" fill="#000"/>
  <circle cx="130" cy="90" r="6" fill="#000"/>
</svg>
`;

// Parser SVG
const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgString,"image/svg+xml");
const paths = svgDoc.querySelectorAll("circle, path");

paths.forEach(p=>{
    const color = p.getAttribute("fill") || "#fff";
    const r = parseFloat(p.getAttribute("r")) || 10;
    const cx = parseFloat(p.getAttribute("cx")) || 100;
    const cy = parseFloat(p.getAttribute("cy")) || 100;

    const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(r/200,32),
        new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.set((cx-100)/100, -(cy-100)/100, 0);
    charGroup.add(mesh);
});

// Ajuste inicial
charGroup.position.set(0,0,0);

// Partículas neon orbitando
const particles = [];
const particleGeo = new THREE.CircleGeometry(0.01,8);
const particleMat = new THREE.MeshBasicMaterial({color:0x00eaff});
for(let i=0;i<50;i++){
    const p = new THREE.Mesh(particleGeo, particleMat);
    const angle = Math.random()*Math.PI*2;
    const dist = 0.3 + Math.random()*0.2;
    p.userData = { angle, dist, speed: 0.5 + Math.random() };
    p.position.set(Math.cos(angle)*dist, Math.sin(angle)*dist,0);
    scene.add(p);
    particles.push(p);
}

let clock = new THREE.Clock();

function animate(){
    const t = clock.getElapsedTime();
    planeMat.uniforms.uTime.value = t;

    // Respiração do personagem
    const pulse = 1 + Math.sin(t*2)*0.05;
    charGroup.scale.set(pulse,pulse,pulse);

    // Olhos piscando (últimos dois meshes)
    const blink = Math.abs(Math.sin(t*3));
    charGroup.children[3].scale.y = blink;
    charGroup.children[4].scale.y = blink;

    // Pupilas seguem mouse
    charGroup.children[3].position.x = -0.3 + mouse.x*0.05;
    charGroup.children[3].position.y = 0.1 + mouse.y*0.05;
    charGroup.children[4].position.x = 0.3 + mouse.x*0.05;
    charGroup.children[4].position.y = 0.1 + mouse.y*0.05;

    // Atualiza partículas orbitando
    particles.forEach(p=>{
        p.userData.angle += p.userData.speed*0.01;
        p.position.x = Math.cos(p.userData.angle)*p.userData.dist;
        p.position.y = Math.sin(p.userData.angle)*p.userData.dist;
    });

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}
animate();

// Stop API
window._stopPortal = ()=>{
    renderer.dispose();
    scene.clear();
};
