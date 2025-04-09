import * as THREE from 'three'

export function usePlanets() {
  function createOrbitLine(radius: number, color: number): THREE.Line {
    const segments = 64
    const orbitGeometry = new THREE.BufferGeometry()
    const points = []

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(
        radius * Math.cos(theta),
        0,
        radius * Math.sin(theta),
      ))
    }

    orbitGeometry.setFromPoints(points)

    const orbitMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    })

    return new THREE.Line(orbitGeometry, orbitMaterial)
  }

  const PLANET_CONFIG = [
    { name: 'Mercure', color: 0x3498DB },
    { name: 'Vénus', color: 0xE67E22 },
    { name: 'Terre', color: 0x2ECC71 },
    { name: 'Mars', color: 0xE74C3C },
    { name: 'Jupiter', color: 0xF1C40F },
    { name: 'Saturne', color: 0x9B59B6 },
    { name: 'Uranus', color: 0x1ABC9C },
    { name: 'Neptune', color: 0x34495E },
    { name: 'Pluton', color: 0x9B59B6 },
  ]

  // Planet sizing and orbit calculations
  const calculatePlanetProps = (index: number) => ({
    size: index < 4 ? 1.2 + (index * 0.3) : 2 + ((index - 4) * 0.4),
    orbit: 12 + (index * 7),
    orbitSpeed: 0.5 / (index + 1),
  })

  // Generate geometry based on size
  const createPlanetGeometry = (size: number) => new THREE.SphereGeometry(size, 24, 24)

  // Generate material based on color
  const createPlanetMaterial = (color: number) => new THREE.MeshLambertMaterial({
    color,
    emissive: 0x000000,
  })

  const createPlanetMesh = (size: number, color: number) => new THREE.Mesh(createPlanetGeometry(size), createPlanetMaterial(color))

  // Generate planets using the configuration data

  const planets = PLANET_CONFIG.map((config, index) => {
    const { size, orbit, orbitSpeed } = calculatePlanetProps(index)
    const planet = {
      name: config.name,
      color: config.color,
      size,
      orbit,
      orbitSpeed,
      orbitLine: createOrbitLine(orbit, config.color),
      geometry: createPlanetGeometry(size),
      material: createPlanetMaterial(config.color),
      mesh: createPlanetMesh(size, config.color),
      angle: Math.random() * Math.PI * 2,
    }
    planet.mesh.position.x = Math.cos(planet.angle) * planet.orbit
    planet.mesh.position.z = Math.sin(planet.angle) * planet.orbit
    // scene.add(planet.orbitLine)
    // scene.add(planet.mesh)
    return planet
  })

  return planets
}
