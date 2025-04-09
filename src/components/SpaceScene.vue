<script setup lang="ts">
import * as THREE from 'three'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { usePlanets } from '../composables/usePlanets'
// Container pour la scène
const sceneContainer = ref<HTMLElement | null>(null)

// Variables Three.js
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let clock: THREE.Clock
let animationFrameId: number

// Structure des planètes
interface Planet {
  name: string
  color: number
  size: number
  orbit: number
  orbitSpeed: number
  orbitLine: THREE.Line
  geometry: THREE.SphereGeometry
  material: THREE.MeshLambertMaterial
  mesh: THREE.Mesh
  angle: number

}

let planets: Planet[] = []
let sun: THREE.Mesh

// Initialisation
function initScene() {
  if (!sceneContainer.value)
    return

  // Dimensions
  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight

  // Création de base
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 30, 80)
  camera.lookAt(0, 0, 0)

  // Renderer avec antialiasing pour une meilleure qualité
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  sceneContainer.value.appendChild(renderer.domElement)

  // Horloge pour l'animation
  clock = new THREE.Clock()

  // Création des étoiles de fond
  createStars()

  // Création du système solaire
  createSolarSystem()

  // Gestion du redimensionnement
  window.addEventListener('resize', handleResize)

  // Démarrer l'animation
  animate()
}

// Création des étoiles de fond
function createStars() {
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.7,
    sizeAttenuation: true,
  })

  const starsVertices = []
  for (let i = 0; i < 5000; i++) {
    const x = THREE.MathUtils.randFloatSpread(1000)
    const y = THREE.MathUtils.randFloatSpread(1000)
    const z = THREE.MathUtils.randFloatSpread(1000)
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)
}

// Création du système solaire
function createSolarSystem() {
  // Soleil
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFAA00,
  })
  sun = new THREE.Mesh(sunGeometry, sunMaterial)
  scene.add(sun)

  // Lumière
  const sunLight = new THREE.PointLight(0xFFFFFF, 2, 300)
  sun.add(sunLight)

  // Lumière ambiante pour éviter que les planètes soient trop sombres
  const ambientLight = new THREE.AmbientLight(0x404040, 0.7)
  scene.add(ambientLight)

  planets = usePlanets()

  planets.forEach((planet: Planet) => {
    scene.add(planet.mesh)
    scene.add(planet.orbitLine)
    planets.push(planet)
  })
}

// Gestion du redimensionnement
function handleResize() {
  if (!sceneContainer.value)
    return

  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Boucle d'animation
function animate() {
  animationFrameId = requestAnimationFrame(animate)

  // Obtenir le temps écoulé
  const delta = clock.getDelta()

  // Rotation du soleil
  sun.rotation.y += 0.5 * delta

  // Animation des planètes
  planets.forEach((planet) => {
    // Mettre à jour l'angle en fonction de la vitesse
    planet.angle += planet.orbitSpeed * delta

    // Calculer la nouvelle position
    planet.mesh.position.x = Math.cos(planet.angle) * planet.orbit
    planet.mesh.position.z = Math.sin(planet.angle) * planet.orbit

    // Rotation de la planète sur elle-même
    planet.mesh.rotation.y += delta
  })

  // Rendu
  renderer.render(scene, camera)
}

// Hooks de cycle de vie
onMounted(() => {
  setTimeout(() => {
    initScene()
  }, 100)
})

onBeforeUnmount(() => {
  // Nettoyage
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  window.removeEventListener('resize', handleResize)

  // Libération de la mémoire
  planets.forEach((planet) => {
    if (planet.mesh.geometry)
      planet.mesh.geometry.dispose()
    if (planet.mesh.material instanceof THREE.Material)
      planet.mesh.material.dispose()
    if (planet.orbitLine?.geometry)
      planet.orbitLine.geometry.dispose()
    if (planet.orbitLine?.material instanceof THREE.Material)
      planet.orbitLine.material.dispose()
    scene.remove(planet.mesh)
    if (planet.orbitLine)
      scene.remove(planet.orbitLine)
  })

  if (sun.geometry)
    sun.geometry.dispose()
  if (sun.material instanceof THREE.Material)
    sun.material.dispose()
  scene.remove(sun)

  if (sceneContainer.value && renderer) {
    sceneContainer.value.removeChild(renderer.domElement)
    renderer.dispose()
  }

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
