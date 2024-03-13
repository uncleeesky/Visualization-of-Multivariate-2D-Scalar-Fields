import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
// create new scene
const scene = new THREE.Scene()

// create a new light
const lightDirection = new THREE.Vector3(-5, -5, 5);
const lightColor = new THREE.Color(1, 1, 1);
const pointLight = new THREE.AmbientLight(lightColor);
const light = new THREE.PointLight(0xffffff, 500)
light.position.set(-5, -5, 5)
scene.add(light)
var colorSelect = new THREE.Vector3(6,0,0);
// initalize camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 1
// initialize render
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.sortObjects = false
document.body.appendChild(renderer.domElement)

// set the control on camera
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
const loader = new THREE.TextureLoader();
// add three plane germetry
const planeGeometry = new THREE.PlaneGeometry(1, 1)
const planeGeometry1 = new THREE.PlaneGeometry(1, 1)
const planeGeometry2 = new THREE.PlaneGeometry(1, 1)

// vertex shader sending vertex position and normal vectors
const vertexShader = () => {
    return `
        varying vec2 vUv; 
        varying vec3 vNormal;
        uniform vec2 u_resolution;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal); 
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0 );
        }
    `;
}
// fragment shader add color to the pixels
const fragmentShader = () => {
    return `
        varying vec3 vNormal;
        uniform float u_time;
        uniform sampler2D texture1; 
        uniform sampler2D bumpTexture; 
        uniform vec3 pointLightDirection;
        uniform vec3 pointLightColor;
        uniform vec2 u_resolution;
        uniform float scale;
        uniform vec3 colorSelect;
        uniform float opacityScale;
        const highp vec3 W = vec3(0.3, 0.59, 0.11);
        varying vec2 vUv;
        
        void main() {
            // use normal vector to calculate the light and shade
            vec3 normal = normalize(vNormal);
            vec3 normalizedLight = normalize(pointLightDirection);
            
            float intensity = dot(normal, normalizedLight);
            vec3 lighting = pointLightColor * intensity;

            // transfer the rbg vector back to scalar value to draw the contour lines
            vec4 color1 = texture2D(texture1, vUv);
            float luminance = dot(color1.rgb, W);
            float result = luminance;

            // set interval and the pixels needed to be colored
            float step = result / scale;
            float f  = fract(step);
            float width = 0.5*fwidth(step);
            float aa = smoothstep(width, width * 1.0, f);
            float inv = 1.0 - aa;
            // give all pixel a color
            vec3 ligntColor = colorSelect*vec3(inv);
            gl_FragColor = vec4(ligntColor, opacityScale);
            

        }
    `;
}
// load texture
const texture = new THREE.TextureLoader().load('img/MRI_1.png')
const bumpTexture = new THREE.TextureLoader().load('img/MRI_1bm.png')
// set uniform parameter
const uniforms = {
    texture1: { type: "sampler2D", value: texture },
    bumpTexture: { type: "sampler2D", value: bumpTexture },
    pointLightDirection: { value: lightDirection },
    pointLightColor: { value: lightColor },
    colorSelect:{value:colorSelect},
    u_time: { value: 1 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    scale: { value: 0.025 },
    opacityScale: {value:0.44}
};

const colorScale = 0.025
// set materials
const material = new THREE.MeshPhongMaterial()
const material1 = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    transparent: true
});

const material2 = new THREE.MeshPhongMaterial()
// set texture
material2.map = texture
material.map = texture
material.bumpMap = bumpTexture
material.bumpScale = 0.015

const materialColor = material2.color;


// create meshes
const plane = new THREE.Mesh(planeGeometry, material)
const plane2 = new THREE.Mesh(planeGeometry2, material2)
const plane1 = new THREE.Mesh(planeGeometry1, material1)
// set default values
plane.material.visible = false
plane1.material.visible = false
plane2.material.visible = true
plane.material.transparent = true
plane2.material.transparent = true
plane.material.opacity = 1
plane2.material.opacity = 1
plane.material.depthTest = false
plane1.material.depthTest = false
plane2.material.depthTest = false
// add meshes to the scene in order
scene.add(plane)
scene.add(plane2)
scene.add(plane1)


// add control the size of the window
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// add data gui and add different controllers
const gui = new GUI()
// add folders
var f1 = gui.addFolder('bump mapping')
f1.add(material, 'bumpScale', 0, 500, 0.01)
f1.add(plane.material, 'visible')
f1.add(plane.material,'opacity',0,1,0.01)
f1.open()
var f2 = gui.addFolder('height contour')
f2.add(uniforms.scale, 'value', 0.001, 0.05, 0.001)
f2.add(plane1.material, 'visible')
// f2.add(uniforms,'opacityScale',0,1,0.1)

f2.open();
var f3 = gui.addFolder('color mapping')
// creat class use for the controller in dat.gui
class changeTexture {
    DataSet: string;
    constructor() {
        this.DataSet = "img/MRI_1.png";
    }
};
class changeColor {
    color: string;
    constructor() {
        this.color = "#060000";;
    }
};
class changeOpacity{
    opacityScale: GLfloat;
    constructor(){
        this.opacityScale = 0.44;
    }
}
// onload window listen for operation
window.onload = function () {
    
    var changecolor = new changeColor();
    var controller = f2.addColor(changecolor,'color')
    var changeopacity = new changeOpacity();;
    var controller4 = f2.add(changeopacity,'opacityScale',0,1,0.01)
    // trigger event
    controller4.onChange(function(opacityScale){
        uniforms.opacityScale.value = opacityScale;
    })
    // trigger event
    controller.onChange(function (color) {
        var colorChange = [];
        // method to change hex color to rgb color vector
        for (var i = 1; i < 7; i += 2) {
          colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        var colorVec=  new THREE.Vector3(colorChange[0],colorChange[1],colorChange[2]);
        uniforms.colorSelect.value = colorVec;
    });
    var changetexture = new changeTexture();
    var controller2 = f3.add(changetexture, 'DataSet', { 'MRIT1CE':'img/MRI_t1cegray.png','MRI1': 'img/MRI_1.png', 'MRI2': 'img/MRI_2.png','MRIt2': 'img/MRI_t2.png','MRIFlair': 'img/MRI_flair.png','MRIFlgray': 'img/MRI_flgray.png', 'MRIGray': 'img/MRI_gray.png','MRIT2Gray': 'img/MRI_t2gray.png','CT1': 'img/CT_1.png', 'CT2': 'img/CT_2.png','CTGray': 'img/CT_gray.png','UltraSound1': 'img/US_1.png', 'UltraSound2': 'img/US_2.png','UltraSoundGray': 'img/US_gray.png'});
    var controller1 = f2.add(changetexture, 'DataSet', { 'MRI1': 'img/MRI_1.png', 'MRI2': 'img/MRI_2.png','MRIt2': 'img/MRI_t2.png','MRIFlair': 'img/MRI_flair.png','MRIFlgray': 'img/MRI_flgray.png', 'MRIGray': 'img/MRI_gray.png','MRIT2Gray': 'img/MRI_t2gray.png','CT1': 'img/CT_1.png', 'CT2': 'img/CT_2.png','CTGray': 'img/CT_gray.png','UltraSound1': 'img/US_1.png', 'UltraSound2': 'img/US_2.png','UltraSoundGray': 'img/US_gray.png'});
    var controller = f1.add(changetexture, 'DataSet', { 'MRI1': 'img/MRI_1.png', 'MRI2': 'img/MRI_2.png','MRIt2': 'img/MRI_t2.png','MRIFlair': 'img/MRI_flair.png','MRIFlgray': 'img/MRI_flgray.png', 'MRIGray': 'img/MRI_gray.png','MRIT2Gray': 'img/MRI_t2gray.png','CT1': 'img/CT_1.png', 'CT2': 'img/CT_2.png','CTGray': 'img/CT_gray.png','UltraSound1': 'img/US_1.png', 'UltraSound2': 'img/US_2.png','UltraSoundGray': 'img/US_gray.png'});
    controller.onChange(function(DataSet){
        // change material's properties
        var texture2 = new THREE.TextureLoader().load(DataSet);
        const bumpTexture1 = new THREE.TextureLoader().load('img/MRI_1bm.png')
        const bumpTexture2 = new THREE.TextureLoader().load('img/CT_1bm.png')
        const bumpTexture3 = new THREE.TextureLoader().load('img/CT_2bm.png')
        const bumpTexture4 = new THREE.TextureLoader().load('img/US_1bm.png')
        const bumpTexture5 = new THREE.TextureLoader().load('img/US_2bm.png')
        const bumpTexture6 = new THREE.TextureLoader().load('img/MRI_t2bm.png')
        const bumpTexture7 = new THREE.TextureLoader().load('img/MRI_graybm.png')
        const bumpTexture8 = new THREE.TextureLoader().load('img/CT_graybm.png')
        const bumpTexture9 = new THREE.TextureLoader().load('img/US_graybm.png')
        const bumpTexture10 = new THREE.TextureLoader().load('img/MRI_t2graybm.png')
        const bumpTexture11 = new THREE.TextureLoader().load('img/MRI_flairbm.png')
        const bumpTexture12 = new THREE.TextureLoader().load('img/MRI_flgraybm.png')
        
        switch(DataSet)
        {
            
            case 'img/MRI_1.png':
                plane.material.bumpMap = bumpTexture;
            break;
            case 'img/MRI_2.png':
                plane.material.bumpMap = bumpTexture1;
            break;
            case 'img/CT_1.png':
                plane.material.bumpMap = bumpTexture2;
            break;
            case 'img/CT_2.png':
                plane.material.bumpMap = bumpTexture3;
            break;
            case 'img/US_1.png':
                plane.material.bumpMap = bumpTexture4;
            break;
            case 'img/US_2.png':
                plane.material.bumpMap = bumpTexture5;
            break;
            case 'img/MRI_gray.png':
                plane.material.bumpMap = bumpTexture7;
            break;    
            case 'img/CT_gray.png':
                plane.material.bumpMap = bumpTexture8;
            break;    
            case 'img/US_gray.png':
                plane.material.bumpMap = bumpTexture9;
            break;    
            case 'img/MRI_t2.png':
                plane.material.bumpMap = bumpTexture6;
            break;
            case 'img/MRI_t2gray.png':
                plane.material.bumpMap = bumpTexture10;
            break;
            case 'img/MRI_flair.png':
                plane.material.bumpMap = bumpTexture11;
            break;
            case 'img/MRI_flgray.png':
                plane.material.bumpMap = bumpTexture12;
            break;
        }
        plane.material.map = texture2;
        plane.material.needsUpdate = true;
    })
    // trigger event
    controller1.onChange(function(DataSet){
        // change material's properties
        var texture2 = new THREE.TextureLoader().load(DataSet);
        uniforms.texture1.value = texture2;
        plane1.material.needsUpdate = true;
    })
    // trigger event
    controller2.onChange(function (DataSet) {
        // change material's properties
        var texture2 = new THREE.TextureLoader().load(DataSet);
        plane2.material.map = texture2;
        plane2.material.needsUpdate = true;
        plane1.material.needsUpdate = true;
    });

}


f3.add(plane2.material, 'visible')
f3.add(plane2.material,'opacity',0,1,0.01)
f3.open()
var f4 = gui.addFolder('light position')
f4.add(light.position, 'x', -10, 10, 0.1)
f4.add(light.position, 'y', -10, 10, 0.1)
f4.add(light.position, 'z', -10, 10, 0.1)
f4.open()
// function of animate, keep the window update.
function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()


}
// render the scene
function render() {
    renderer.render(scene, camera)
}

animate()

// basically coloned from Material for MkDocs's blog BumpMap
// https://sbcode.net/threejs/bumpmap/
// accessed at 20.12.2023