"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ThreeDVisualizationProps {
  type: "traffic" | "safety" | "competition" | "hero"
  className?: string
}

export function ThreeDVisualization({ type, className = "" }: ThreeDVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create geometry based on type
    let mesh: THREE.Mesh

    if (type === "hero") {
      // Create a globe with points
      const geometry = new THREE.SphereGeometry(2, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })
      mesh = new THREE.Mesh(geometry, material)

      // Add points around the globe
      const pointsGeometry = new THREE.BufferGeometry()
      const pointsCount = 100
      const positions = new Float32Array(pointsCount * 3)

      for (let i = 0; i < pointsCount; i++) {
        const radius = 2.2
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }

      pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const pointsMaterial = new THREE.PointsMaterial({
        color: 0x06b6d4,
        size: 0.1,
      })
      const points = new THREE.Points(pointsGeometry, pointsMaterial)
      scene.add(points)
    } else if (type === "traffic") {
      // Create a heatmap-like visualization
      const geometry = new THREE.PlaneGeometry(4, 4, 20, 20)
      const material = new THREE.MeshPhongMaterial({
        color: 0x10b981,
        wireframe: false,
        side: THREE.DoubleSide,
      })
      mesh = new THREE.Mesh(geometry, material)

      // Deform the plane to create a heatmap effect
      const positionAttribute = geometry.attributes.position
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const distance = Math.sqrt(x * x + y * y)
        const z = Math.sin(distance * 2) * 0.5
        positionAttribute.setZ(i, z)
      }
      geometry.computeVertexNormals()
      mesh.rotation.x = -Math.PI / 2
    } else if (type === "safety") {
      // Create a shield-like visualization
      const geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 32)
      const material = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        wireframe: false,
      })
      mesh = new THREE.Mesh(geometry, material)

      // Add a center sphere
      const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.7,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      scene.add(sphere)
    } else if (type === "competition") {
      // Create a bar chart like visualization
      const group = new THREE.Group()

      for (let i = 0; i < 5; i++) {
        const height = Math.random() * 2 + 0.5
        const geometry = new THREE.BoxGeometry(0.5, height, 0.5)
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(0.1 + i * 0.1, 0.8, 0.5),
        })
        const bar = new THREE.Mesh(geometry, material)
        bar.position.x = i - 2
        bar.position.y = height / 2
        group.add(bar)
      }

      mesh = group
    } else {
      // Default cube
      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 })
      mesh = new THREE.Mesh(geometry, material)
    }

    scene.add(mesh)
    camera.position.z = 5

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      if (mesh instanceof THREE.Group) {
        mesh.rotation.y += 0.01
      } else {
        mesh.rotation.y += 0.01
        if (type === "hero") {
          mesh.rotation.x += 0.005
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [type])

  return <div ref={containerRef} className={`w-full h-full ${className}`}></div>
}
