import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const canvas = document.getElementById("portal");
const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);

let mouse = {x:0, y:0};
window.addEventListener("mousemove", e=>{
    mouse.x = (e.clientX/window.innerWidth - 0.5)*2;
    mouse.y = -(e.clientY/window.innerHeight - 0.5)*2;
});

// Fundo psicodélico shader (mesmo do passo anterior)
const fragmentShader = `
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

const geometry = new THREE.PlaneGeometry(2,2);
const material = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0} },
    fragmentShader
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Loader para SVG
const loader = new THREE.SVGLoader();
const charGroup = new THREE.Group();
scene.add(charGroup);

// Aqui você coloca seu SVG (como string ou arquivo)
// Exemplo minimalista:
const svgString = `
<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="60" fill="#ff4fd8"/>
  <circle cx="70" cy="90" r="15" fill="#fff"/>
  <circle cx="130" cy="90" r="15" fill="#fff"/>
  <circle cx="70" cy="90" r="6" fill="#000"/>
  <circle cx="130" cy="90" r="6" fill="#000"/>
</svg>
`;

const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgString,"image/svg+xml");
const paths = svgDoc.querySelectorAll("circle, path");

paths.forEach(p=>{
    const color = p.getAttribute("fill") || "#fff";
    const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(p.getAttribute("r")/200, 32),
        new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.x = (parseFloat(p.getAttribute("cx"))-100)/100;
    mesh.position.y = -(parseFloat(p.getAttribute("cy"))-100)/100;
    charGroup.add(mesh);
});

// Ajusta posição do grupo
charGroup.position.set(0,0,0);

let clock = new THREE.Clock();

function animate(){
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    // Respiração
    const pulse = 1 + Math.sin(t*2)*0.05;
    charGroup.scale.set(pulse,pulse,pulse);

    // Pupilas seguem mouse (exemplo, assume últimos dois filhos são pupilas)
    const pupilLeft = charGroup.children[4];
    const pupilRight = charGroup.children[5];
    pupilLeft.position.x = -0.3 + mouse.x*0.05;
    pupilLeft.position.y = 0.1 + mouse.y*0.05;
    pupilRight.position.x = 0.3 + mouse.x*0.05;
    pupilRight.position.y = 0.1 + mouse.y*0.05;

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}
animate();

// API para parar animação
window._stopPortal = ()=>{
    renderer.dispose();
    scene.clear();
}
