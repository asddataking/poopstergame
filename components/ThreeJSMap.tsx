'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/lib/sim/state'
import { TOWN_CONFIG, VISUAL_CONFIG } from '@/lib/constants'

interface Poop {
  id: string
  x: number
  z: number
  size: 'small' | 'medium' | 'large'
  scooped: boolean
}

interface Player {
  x: number
  z: number
  speed: number
  isMoving: boolean
  currentHouse: string | null
  inBackyard: boolean
}

interface House {
  id: string
  tier: string
  streetX: number
  streetZ: number
  backyardX: number
  backyardZ: number
  poops: Poop[]
}

export default function ThreeJSMap() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const playerRef = useRef<THREE.Mesh | null>(null)
  const housesRef = useRef<THREE.Mesh[]>([])
  const poopsRef = useRef<THREE.Mesh[]>([])
  const animationRef = useRef<number>()
  
  const [player, setPlayer] = useState<Player>({ 
    x: 0, 
    z: 0, 
    speed: 0.15, 
    isMoving: false, 
    currentHouse: null,
    inBackyard: false
  })
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [poopsScooped, setPoopsScooped] = useState(0)
  const [gameMessage, setGameMessage] = useState('Walk to houses and press S to scoop poops!')
  const [showGameUI, setShowGameUI] = useState(false)
  
  const { houses, selectedHouses, isDayActive, currentRoute } = useGameStore()

  // Create game houses with street and backyard positions
  const gameHouses: House[] = houses.map((house, index) => ({
    id: house.id,
    tier: house.tier,
    streetX: (index - houses.length / 2) * 8, // Houses along street
    streetZ: -15, // Street position
    backyardX: (index - houses.length / 2) * 8,
    backyardZ: -8, // Backyard position
    poops: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      id: `poop_${house.id}_${i}`,
      x: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4,
      size: Math.random() < 0.5 ? 'small' : Math.random() < 0.8 ? 'medium' : 'large',
      scooped: false
    }))
  }))

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue background
    sceneRef.current = scene

    // Camera setup (orthographic for 2D-style view)
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
    const camera = new THREE.OrthographicCamera(-25, 25, 20, -20, 0.1, 1000)
    camera.position.set(0, 0, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground plane (street)
    const groundGeometry = new THREE.PlaneGeometry(50, 40)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A }) // Dark gray street
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Street markings
    const streetMarkings = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 0.5),
      new THREE.MeshLambertMaterial({ color: 0xFFFF00 }) // Yellow center line
    )
    streetMarkings.rotation.x = -Math.PI / 2
    streetMarkings.position.set(0, 0.01, -15)
    scene.add(streetMarkings)

    // Create houses along the street
    gameHouses.forEach((house, index) => {
      // House building
      const houseGeometry = new THREE.BoxGeometry(3, 2, 3)
      const houseColor = house.tier === 'LARGE' ? 0xFF6B35 : 
                        house.tier === 'MEDIUM' ? 0xFFD93D : 0x6BCF7F
      const houseMaterial = new THREE.MeshLambertMaterial({ color: houseColor })
      const houseMesh = new THREE.Mesh(houseGeometry, houseMaterial)
      
      houseMesh.position.set(house.streetX, 1, house.streetZ)
      houseMesh.castShadow = true
      houseMesh.receiveShadow = true
      
      houseMesh.userData = { 
        id: house.id, 
        tier: house.tier,
        isSelected: selectedHouses.includes(house.id),
        houseData: house
      }
      
      housesRef.current.push(houseMesh)
      scene.add(houseMesh)

      // Backyard area (green grass)
      const backyardGeometry = new THREE.PlaneGeometry(6, 6)
      const backyardMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x228B22, 
        transparent: true, 
        opacity: 0.8 
      })
      const backyard = new THREE.Mesh(backyardGeometry, backyardMaterial)
      backyard.rotation.x = -Math.PI / 2
      backyard.position.set(house.backyardX, 0.01, house.backyardZ)
      scene.add(backyard)

      // Backyard fence
      const fenceGeometry = new THREE.BoxGeometry(6, 1, 0.2)
      const fenceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
      
      // Top fence
      const topFence = new THREE.Mesh(fenceGeometry, fenceMaterial)
      topFence.position.set(house.backyardX, 0.5, house.backyardZ - 3)
      scene.add(topFence)
      
      // Bottom fence
      const bottomFence = new THREE.Mesh(fenceGeometry, fenceMaterial)
      bottomFence.position.set(house.backyardX, 0.5, house.backyardZ + 3)
      scene.add(bottomFence)
      
      // Left fence
      const leftFence = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1, 6),
        fenceMaterial
      )
      leftFence.position.set(house.backyardX - 3, 0.5, house.backyardZ)
      scene.add(leftFence)
      
      // Right fence
      const rightFence = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1, 6),
        fenceMaterial
      )
      rightFence.position.set(house.backyardX + 3, 0.5, house.backyardZ)
      scene.add(rightFence)

      // Generate poops in backyard
      house.poops.forEach((poop, poopIndex) => {
        const poopGeometry = new THREE.SphereGeometry(
          poop.size === 'small' ? 0.3 : poop.size === 'medium' ? 0.4 : 0.5
        )
        const poopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        const poopMesh = new THREE.Mesh(poopGeometry, poopMaterial)
        
        poopMesh.position.set(
          house.backyardX + poop.x,
          0.3,
          house.backyardZ + poop.z
        )
        poopMesh.castShadow = true
        
        poopMesh.userData = { 
          poopId: poop.id, 
          size: poop.size,
          scooped: false,
          houseId: house.id
        }
        
        poopsRef.current.push(poopMesh)
        scene.add(poopMesh)
      })
    })

    // Create player (poop scooper)
    const playerGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8)
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 })
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
    playerMesh.position.set(0, 0.75, 0)
    playerMesh.castShadow = true
    scene.add(playerMesh)
    playerRef.current = playerMesh

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      // Handle player movement
      handlePlayerMovement()
      
      // Handle poop scooping
      handlePoopScooping()
      
      // Update camera to follow player
      if (cameraRef.current && playerRef.current) {
        const targetX = playerRef.current.position.x
        const targetZ = playerRef.current.position.z
        cameraRef.current.position.x = targetX
        cameraRef.current.position.z = targetZ + 15
      }
      
      renderer.render(scene, camera)
    }
    
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [houses, selectedHouses])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(event.key.toLowerCase()))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(event.key.toLowerCase())
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Player movement logic
  const handlePlayerMovement = () => {
    if (!playerRef.current) return

    let newX = player.x
    let newZ = player.z
    let isMoving = false
    let currentHouse = player.currentHouse
    let inBackyard = player.inBackyard

    if (keys.has('w') || keys.has('arrowup')) {
      newZ -= player.speed
      isMoving = true
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      newZ += player.speed
      isMoving = true
    }
    if (keys.has('a') || keys.has('arrowleft')) {
      newX -= player.speed
      isMoving = true
    }
    if (keys.has('d') || keys.has('arrowright')) {
      newX += player.speed
      isMoving = true
    }

    // Check if player is entering/leaving house areas
    gameHouses.forEach(house => {
      const distanceToHouse = Math.sqrt(
        Math.pow(newX - house.streetX, 2) + Math.pow(newZ - house.streetZ, 2)
      )
      
      if (distanceToHouse < 3) {
        currentHouse = house.id
        inBackyard = false
        setGameMessage(`At ${house.tier} house. Walk to the backyard to scoop poops!`)
      }
      
      // Check if entering backyard
      const distanceToBackyard = Math.sqrt(
        Math.pow(newX - house.backyardX, 2) + Math.pow(newZ - house.backyardZ, 2)
      )
      
      if (distanceToBackyard < 3) {
        currentHouse = house.id
        inBackyard = true
        const availablePoops = house.poops.filter(p => !p.scooped).length
        setGameMessage(`In ${house.tier} house backyard. ${availablePoops} poops available. Press S to scoop!`)
      }
    })

    // Boundary checking
    newX = Math.max(-22, Math.min(22, newX))
    newZ = Math.max(-18, Math.min(18, newZ))

    if (isMoving) {
      setPlayer(prev => ({ 
        ...prev, 
        x: newX, 
        z: newZ, 
        isMoving: true,
        currentHouse,
        inBackyard
      }))
      playerRef.current.position.set(newX, 0.75, newZ)
    } else {
      setPlayer(prev => ({ ...prev, isMoving: false }))
    }
  }

  // Poop scooping logic
  const handlePoopScooping = () => {
    if (!playerRef.current || !player.inBackyard || !player.currentHouse) return

    if (keys.has('s')) {
      const playerPosition = playerRef.current.position
      const scoopDistance = 2

      poopsRef.current.forEach((poopMesh) => {
        if (poopMesh.userData.scooped || poopMesh.userData.houseId !== player.currentHouse) return

        const distance = playerPosition.distanceTo(poopMesh.position)
        
        if (distance < scoopDistance) {
          // Mark poop as scooped
          poopMesh.userData.scooped = true
          poopMesh.visible = false
          
          // Calculate score based on poop size
          const sizeScore = poopMesh.userData.size === 'small' ? 10 : 
                           poopMesh.userData.size === 'medium' ? 25 : 50
          
          setScore(prev => prev + sizeScore)
          setPoopsScooped(prev => prev + 1)
          
          // Update game message
          setGameMessage(`Scooped ${poopMesh.userData.size} poop! +${sizeScore} points!`)
          
          // Add scooping effect
          createScoopEffect(poopMesh.position)
          
          // Respawn poop after some time
          setTimeout(() => {
            if (poopMesh && sceneRef.current) {
              poopMesh.userData.scooped = false
              poopMesh.visible = true
              
              // Randomize new position in backyard
              const house = gameHouses.find(h => h.id === player.currentHouse)
              if (house) {
                const randomX = (Math.random() - 0.5) * 4
                const randomZ = (Math.random() - 0.5) * 4
                poopMesh.position.set(
                  house.backyardX + randomX,
                  0.3,
                  house.backyardZ + randomZ
                )
              }
            }
          }, 8000 + Math.random() * 12000) // 8-20 seconds
        }
      })
    }
  }

  // Create scooping effect
  const createScoopEffect = (position: THREE.Vector3) => {
    if (!sceneRef.current) return

    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ 
        color: 0x8B4513, 
        size: 0.2,
        transparent: true,
        opacity: 0.8
      })
    )

    const particleCount = 15
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 3
      positions[i * 3 + 1] = position.y + Math.random() * 2
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 3
    }

    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.position.copy(position)
    
    sceneRef.current.add(particles)

    // Remove particles after animation
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.remove(particles)
        particles.geometry.dispose()
        ;(particles.material as THREE.PointsMaterial).dispose()
      }
    }, 1500)
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      rendererRef.current.setSize(width, height)
      
      const aspect = width / height
      cameraRef.current.left = -25 * aspect
      cameraRef.current.right = 25 * aspect
      cameraRef.current.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Toggle game UI
  useEffect(() => {
    const handleTab = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        setShowGameUI(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleTab)
    return () => window.removeEventListener('keydown', handleTab)
  }, [])

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Roblox-style Game UI */}
      {showGameUI && (
        <>
          {/* Controls overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg border border-gray-600">
            <h3 className="font-bold mb-3 text-lg">🎮 Controls</h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 px-2 py-1 rounded text-xs">WASD</span>
                <span>Move around</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-green-600 px-2 py-1 rounded text-xs">S</span>
                <span>Scoop poop (when in backyard)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-purple-600 px-2 py-1 rounded text-xs">TAB</span>
                <span>Toggle this UI</span>
              </div>
            </div>
          </div>

          {/* Score and Stats */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg border border-gray-600">
            <div className="text-sm space-y-2">
              <div className="font-bold text-yellow-400 text-lg">🏆 Score: {score}</div>
              <div>💩 Poops Scooped: {poopsScooped}</div>
              <div>📍 Position: ({player.x.toFixed(1)}, {player.z.toFixed(1)})</div>
              <div>🏠 House: {player.currentHouse || 'None'}</div>
              <div>🌳 Backyard: {player.inBackyard ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </>
      )}

      {/* Game Message */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white p-3 rounded-lg border border-gray-600 max-w-md text-center">
        <div className="text-sm font-medium">{gameMessage}</div>
        <div className="text-xs text-gray-300 mt-1">Press TAB to toggle UI</div>
      </div>

      {/* Minimap */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg border border-gray-600">
        <div className="text-xs font-bold mb-2">🗺️ Minimap</div>
        <div className="w-32 h-24 bg-gray-800 rounded border border-gray-600 relative overflow-hidden">
          {/* Player dot */}
          <div 
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
            style={{
              left: `${((player.x + 22) / 44) * 100}%`,
              top: `${((player.z + 18) / 36) * 100}%`
            }}
          />
          {/* House dots */}
          {gameHouses.map((house, index) => (
            <div
              key={house.id}
              className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
              style={{
                left: `${((house.streetX + 22) / 44) * 100}%`,
                top: `${((house.streetZ + 18) / 36) * 100}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
