import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/7.png')
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg')
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.generateMipmaps = false

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// const material = new THREE.MeshBasicMaterial()
// material.wireframe = true
// material.transparent = true
// material.alphaMap = doorAlphaTexture
// material.side = THREE.DoubleSide

// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)

// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture

// const material = new THREE.MeshStandardMaterial({color: 'white'})
// material.metalness = 0
// material.roughness = 1
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.1
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
// material.alphaMap = doorAlphaTexture
// material.transparent = true

const our_meshes = []

const material = new THREE.MeshStandardMaterial({ color: 'white' })
material.metalness = 0.7
material.roughness = 0.2
material.envMap = environmentMapTexture

gui.add(material, 'metalness').min(0).max(1).step(0.01)
gui.add(material, 'roughness').min(0).max(1).step(0.01)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.1)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material)
sphere.position.set(-1.5, 0, 0)

our_meshes.push(sphere)

const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material)
sphere2.position.set(-1.5, 2, 0)

our_meshes.push(sphere2)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
)

our_meshes.push(plane)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
)
torus.position.set(1.5, 0, 0)

our_meshes.push(torus)
scene.add(sphere, sphere2)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(ambientLight)
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utilities
 */
const areIntersecting = (mesh1, mesh2) => {

    mesh1.geometry.computeBoundingBox()
    mesh2.geometry.computeBoundingBox()

    var boundingBox1 = new THREE.Box3()
    var boundingBox2 = new THREE.Box3()
    boundingBox1.copy(mesh1.geometry.boundingBox)
    boundingBox2.copy(mesh2.geometry.boundingBox)

    mesh1.updateMatrixWorld(true) // ensure world matrix is up to date
    mesh2.updateMatrixWorld(true) // ensure world matrix is up to date
    boundingBox1.applyMatrix4(mesh1.matrixWorld)
    boundingBox2.applyMatrix4(mesh2.matrixWorld)

// console.log( boundingBox1.min.x);
// console.log( boundingBox2.min.x);

    return boundingBox1.intersectsBox(boundingBox2)
}

const spawnedSpheres = []

const spawnChild = () => {
    const newMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 64, 64),
        material
    )

    const anchorPos = {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 5
    }

    newMesh.visible = false
    scene.add(newMesh)

    spawnedSpheres.push(
        {
            mesh: newMesh,
            anchorPosition: anchorPos
        })

    console.log(spawnedSpheres)

}

/**
 * Animate
 */
const clock = new THREE.Clock()

let wasOverlapping = false

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Animate Spawned Spheres
    for (const spawnedSphere of spawnedSpheres) {
        // const rotationVec = new THREE.Vector3(
        //     Math.sin(elapsedTime),
        //     Math.cos(elapsedTime),
        //     0
        // )
        // spawnedSphere.mesh.geometry.position = rotationVec + spawnedSphere.position
        spawnedSphere.mesh.position.set(
            Math.sin(elapsedTime) + spawnedSphere.anchorPosition.x,
            Math.cos(elapsedTime) + spawnedSphere.anchorPosition.y,
            spawnedSphere.anchorPosition.z
        )
        spawnedSphere.mesh.visible = true
    }

    // Update objects
    sphere.rotation.y = elapsedTime * 0.1
    sphere.rotation.x = elapsedTime * 0.15

    sphere2.position.x = Math.sin(elapsedTime)
    sphere2.position.y = Math.cos(elapsedTime)

    const intersects = areIntersecting(sphere, sphere2)

    if (intersects) {
        if (wasOverlapping) {

        } else {
            console.log('start overlap')
            wasOverlapping = true
            // sphere.material.color.setHex(0x00ffff)
            spawnChild()
        }

    } else {
        if (wasOverlapping) {
            wasOverlapping = false
            // sphere.material.color.setHex(0xff00ff)
            console.log('finish overlap')
        } else {

        }

    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()