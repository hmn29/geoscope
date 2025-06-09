"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion } from "framer-motion"

interface ThreeDReportPreviewProps {
  className?: string
}

export function ThreeDReportPreview({ className = "" }: ThreeDReportPreviewProps) {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create floating report cards
    const reportCards = new THREE.Group()

    // Main report card (center)
    const mainCardGeometry = new THREE.PlaneGeometry(3, 4)
    const mainCardMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.9,
    })
    const mainCard = new THREE.Mesh(mainCardGeometry, mainCardMaterial)
    mainCard.position.set(0, 0, 0)
    reportCards.add(mainCard)

    // Score display on main card
    const scoreGeometry = new THREE.RingGeometry(0.8, 1.2, 32)
    const scoreMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
    })
    const scoreRing = new THREE.Mesh(scoreGeometry, scoreMaterial)
    scoreRing.position.set(0, 0.5, 0.01)
    reportCards.add(scoreRing)

    // Smaller metric cards
    const cardPositions = [
      { x: -2.5, y: 1.5, z: -0.5, color: 0x3b82f6 }, // Traffic
      { x: 2.5, y: 1.5, z: -0.5, color: 0x10b981 }, // Safety
      { x: -2.5, y: -1.5, z: -0.5, color: 0xf59e0b }, // Competition
      { x: 2.5, y: -1.5, z: -0.5, color: 0x8b5cf6 }, // Accessibility
    ]

    cardPositions.forEach((pos, index) => {
      const cardGeometry = new THREE.PlaneGeometry(1.5, 2)
      const cardMaterial = new THREE.MeshPhongMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.7,
      })
      const card = new THREE.Mesh(cardGeometry, cardMaterial)
      card.position.set(pos.x, pos.y, pos.z)
      card.rotation.y = Math.sin(index) * 0.2
      reportCards.add(card)

      // Add small indicator bars
      const barGeometry = new THREE.BoxGeometry(1, 0.1, 0.05)
      const barMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      })
      const bar = new THREE.Mesh(barGeometry, barMaterial)
      bar.position.set(pos.x, pos.y - 0.5, pos.z + 0.01)
      reportCards.add(bar)
    })

    // Add floating data points
    const dataPoints = new THREE.Group()
    for (let i = 0; i < 20; i++) {
      const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const pointMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        transparent: true,
        opacity: 0.8,
      })
      const point = new THREE.Mesh(pointGeometry, pointMaterial)

      point.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4)

      dataPoints.add(point)
    }

    scene.add(reportCards)
    scene.add(dataPoints)
    camera.position.z = 6

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the main report group
      reportCards.rotation.y += 0.005
      reportCards.rotation.x = Math.sin(Date.now() * 0.001) * 0.1

      // Animate data points
      dataPoints.children.forEach((point, index) => {
        point.position.y += Math.sin(Date.now() * 0.002 + index) * 0.002
        point.rotation.x += 0.01
        point.rotation.y += 0.01
      })

      // Pulse the score ring
      scoreRing.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1)

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
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5 }}
      ref={containerRef}
      className={`w-full h-full ${className}`}
    />
  )
}
