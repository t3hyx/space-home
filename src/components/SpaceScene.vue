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

// # Init function
function initScene() {
  console.log('scene is initializing...')
  if (!sceneContainer.value) {
    // console.log('container not found!')
    return
    // console.log('container found, dimensions:', sceneContainer.value.clientWidth, sceneContainer.value.clientHeight)
  }
  // * Dimensions
  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight

  // * Scene building
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000) // todo: > VAR this color

  // * Adding ambient light
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
  scene.add(ambientLight)

  // * Adding stars to the background
  // todo: >> find another way to implement real space
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF, // todo: > VAR this color
    size: 0.5,
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

  // ? DEBUG: adding a test cube (red)
  /*   const testGeometry = new THREE.BoxGeometry(10, 10, 10)
  const testMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
  const testCube = new THREE.Mesh(testGeometry, testMaterial)
  testCube.position.set(0, 0, 0)
  scene.add(testCube)
  console.log('test cube added') */

  // * Camera building
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
  camera.position.z = 50
  // console.log('camera created & positioned @: ', camera.position)

  // * Renderer building
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  sceneContainer.value.appendChild(renderer.domElement)

  // * Animation function
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    renderer.render(scene, camera)
    // console.log('animation frame rendered')
  }

  // ? DEBUG: explict call after first render
  // //renderer.render(scene, camera)
  // console.log('first render executed')

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
  console.log('component mounted')
  // ? DEBUG: using a delay to ensure DOM is ready
  /*   setTimeout(() => {
    console.log('initialization after delay')
    initScene()
  }, 200) */
  initScene()
})

onBeforeUnmount(() => {
  // * Clening to avoid memry leaks
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  window.removeEventListener('resize', () => {})

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
  position: absolute;
  top: 0;
  left: 0;
  background-color: #111;
}
</style>
