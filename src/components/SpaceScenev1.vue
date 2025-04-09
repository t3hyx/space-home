<!-- eslint-disable no-console -->
<script setup lang="ts">
import * as THREE from 'three'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// # Container for the scene
const sceneContainer = ref<HTMLElement | null>(null)

// # THREE variables
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationFrameId: number

// # Celestials variables
interface CelestialBody {
  mesh: THREE.Mesh
  orbit: number
  orbitSpeed: number
  rotationSpeed: number
  name: string
  orbitLine?: THREE.Line
}

const planets: CelestialBody[] = []
let sun: THREE.Mesh

// # Orbit Line function
function createOrbitLine(radius: number): THREE.Line {
  const segments = 128
  const orbitGeometry = new THREE.BufferGeometry()

  const vertices = []
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    vertices.push(
      Math.cos(theta) * radius, // x
      0, // y
      Math.sin(theta) * radius, // z
    )
  }

  // * Circle Geometry building
  orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  // * Orbit line Material
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.3,
  })

  return new THREE.Line(orbitGeometry, orbitMaterial)
}

// # Solar system function
function createSolarSystem() {
  // * Sun
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
  const sunMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFAA00, // TODO: > VAR this color
    emissive: 0xFF4500, // TODO: > VAR this color
    //specular: 0x000000, // TODO: > VAR this color
    emissiveIntensity: 1,
    //shininess: 0,
  })
  sun = new THREE.Mesh(sunGeometry, sunMaterial)
  scene.add(sun)

  const sunLight = new THREE.PointLight(0xFFFFFF, 2, 200) // TODO: > VAR these
  sun.add(sunLight)

  // trying to fix with another ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)

  // * Planets
  const planetColors = [
    0x3498DB, // blue (Mercury?)
    0xE67E22, // orange (Venus?)
    0x2ECC71, // green (Earth?)
    //0xE74C3C, // red (Mars?)
    //0xF1C40F, // yellow (Jupiter?)
    //0x9B59B6, // purple (Saturn?)
    //0x1ABC9C, // teal (Uranus?)
    //0x34495E, // d-blue (Neptune?)
  ]

  const planetNames = [
    'Mercury',
    'Venus',
    'Earth',
  /* 'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune', */
  ]

  // * Set unique stats for each planet
  for (let i = 0; i < 3; i++) {
    // ** Size
    const size = i < 4 ? 1 + (i * 0.3) : 1.8 + ((i - 4) * 0.4)

    // ** Distance to Sun
    const orbit = 10 + (i * 6)

    // ** Orbiting speed
    const orbitSpeed = 0.005 / (1 + (i * 0.2))

    // ** Rotation speed
    const rotationSpeed = 0.01 + (Math.random() * 0.01)

    // ** Geometry & Material
    const planetGeometry = new THREE.SphereGeometry(size, 24, 24)
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: planetColors[i],
      shininess: 30,
      specular: 0x444444,
    })

    // ** Mesh
    const planet = new THREE.Mesh(planetGeometry, planetMaterial)

    // ** Initial orbit position
    const angle = Math.random() * Math.PI * 2
    planet.position.x = Math.cos(angle) * orbit
    planet.position.z = Math.sin(angle) * orbit

    // ** Orbit lines
    const orbitLine = createOrbitLine(orbit)
    scene.add(orbitLine)

    scene.add(planet)

    // ** Animation data
    planets.push({
      mesh: planet,
      orbit,
      orbitSpeed,
      rotationSpeed,
      name: planetNames[i],
      orbitLine,
    })
  }
}

// # Init function
function initScene() {
  console.log('scene is initializing...')
  if (!sceneContainer.value) {
    return
  }
  // * Dimensions
  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight

  // * Scene building
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // * Adding ambient light
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
  scene.add(ambientLight)

  // * Adding stars to the background
  // TODO: >> Find another way to implement real space
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.5,
    sizeAttenuation: true,
  })

  const starsVertices = []
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)

  // * Solar system building
  createSolarSystem()

  // * Camera building
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000) // TODO: > VAR these
  camera.position.z = 60 // TODO: > VAR this
  camera.position.y = 10

  // * Renderer building
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  sceneContainer.value.appendChild(renderer.domElement)

  // * Animation function
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    // ** Sun's rotation
    if (sun) {
      sun.rotation.y += 0.005
    }

    // ** Planets animation
    planets.forEach((planet) => {
      // current coordinates
      const currentPos = planet.mesh.position
      const angle = Math.atan2(currentPos.x, currentPos.z)

      // new coordinates
      const newAngle = angle + (planet.orbitSpeed * 0.1)
      const newX = Math.cos(newAngle) * planet.orbit
      const newZ = Math.sin(newAngle) * planet.orbit

      planet.mesh.position.x = newX
      planet.mesh.position.z = newZ

      // planet rotation
      planet.mesh.rotation.y += planet.rotationSpeed
    })

    renderer.render(scene, camera)
  }

  // * Resizing handler
  const handleResize = () => {
    if (!sceneContainer.value)
      return

    const width = sceneContainer.value.clientWidth
    const height = sceneContainer.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
  window.addEventListener('resize', handleResize)

  // * Start animation
  console.log('animation starting...')
  animate()
  console.log('animation running')
}

// # Lifecycle hooks
onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  // * Clening to avoid memry leaks
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', () => {})

  // * Deleting references to three.js objects
  planets.forEach(planet => {
    if (planet.mesh.geometry) planet.mesh.geometry.dispose()
    if (planet.mesh.material) (planet.mesh.material as THREE.Material).dispose()
    if (planet.orbitLine?.geometry) planet.orbitLine.geometry.dispose()
    if (planet.orbitLine?.material) (planet.orbitLine.material as THREE.Material).dispose()
    scene.remove(planet.mesh)
    if (planet.orbitLine) scene.remove(planet.orbitLine)
  })

  if (sun.geometry) sun.geometry.dispose()
  if (sun.material) (sun.material as THREE.Material).dispose()
  scene.remove(sun)

  if (sceneContainer.value && renderer) {
    sceneContainer.value.removeChild(renderer.domElement)
  }
  // * Freeing-up memory
  if (scene) {
    scene.clear()
  }
})
</script>

<template>
  <div ref="sceneContainer" class="scene-container" />
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 0;
}
</style>
