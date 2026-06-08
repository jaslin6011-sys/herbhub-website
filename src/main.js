import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 3D Background
const canvas = document.getElementById('bg')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 5

// Create a leaf shape using bezier curves
function createLeaf() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.6, 0.5, 0.6, 1.5, 0, 2.2)
  shape.bezierCurveTo(-0.6, 1.5, -0.6, 0.5, 0, 0)

  const geometry = new THREE.ShapeGeometry(shape)
  const greenShade = new THREE.Color(
    Math.random() * 0.1 + 0.05,
    Math.random() * 0.4 + 0.4,
    Math.random() * 0.1 + 0.05
  )
  const material = new THREE.MeshBasicMaterial({
    color: greenShade,
    transparent: true,
    opacity: Math.random() * 0.35 + 0.1,
    side: THREE.DoubleSide
  })
  const leaf = new THREE.Mesh(geometry, material)

  leaf.position.set(
    (Math.random() - 0.5) * 22,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 8
  )

  const scale = Math.random() * 0.25 + 0.08
  leaf.scale.set(scale, scale, scale)
  leaf.rotation.z = Math.random() * Math.PI * 2

  return leaf
}

// Add floating leaves
const leaves = []
for (let i = 0; i < 40; i++) {
  const leaf = createLeaf()
  scene.add(leaf)
  leaves.push({
    mesh: leaf,
    riseSpeed: Math.random() * 0.006 + 0.002,
    rotSpeed: (Math.random() - 0.5) * 0.012,
    swaySpeed: Math.random() * 0.008 + 0.003,
    swayAmount: Math.random() * 0.4 + 0.1,
    offset: Math.random() * Math.PI * 2
  })
}

// Floating pollen/seed particles
const particleGeo = new THREE.BufferGeometry()
const count = 250
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particleMat = new THREE.PointsMaterial({
  size: 0.04,
  color: 0x86efac,
  transparent: true,
  opacity: 0.5
})
const particles = new THREE.Points(particleGeo, particleMat)
scene.add(particles)

// Mouse parallax
let mouseX = 0, mouseY = 0
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
})

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()

  leaves.forEach(({ mesh, riseSpeed, rotSpeed, swaySpeed, swayAmount, offset }) => {
    mesh.position.y += riseSpeed
    mesh.rotation.z += rotSpeed
    mesh.position.x += Math.sin(elapsed * swaySpeed + offset) * 0.004

    if (mesh.position.y > 13) {
      mesh.position.y = -13
      mesh.position.x = (Math.random() - 0.5) * 22
    }
  })

  particles.rotation.y += 0.0003
  particles.rotation.x += 0.0001

  camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05
  camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.05
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}
animate()

// Fade out leaves as user scrolls down
gsap.to(canvas, {
  scrollTrigger: {
    scrub: 1.5,
    start: 'top top',
    end: '25% top'
  },
  opacity: 0
})

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// GSAP Scroll Animations
gsap.set('.hero-title', { opacity: 0, y: 60 })
gsap.set('.hero-sub', { opacity: 0 })
gsap.set('.scroll-indicator', { opacity: 0 })
gsap.set('.content-box', { opacity: 0, y: 80 })
gsap.set('.section-title', { opacity: 0 })
gsap.set('.card', { opacity: 0, y: 60, scale: 0.9 })

const heroTl = gsap.timeline({ delay: 0.3 })
heroTl
  .to('.hero-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' })
  .to('.hero-sub', { opacity: 1, duration: 0.8 }, '-=0.5')
  .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.3')

gsap.to('#about .content-box', {
  scrollTrigger: { trigger: '#about', start: 'top 70%' },
  opacity: 1, y: 0, duration: 1, ease: 'power3.out'
})

gsap.to('.section-title', {
  scrollTrigger: { trigger: '#services', start: 'top 70%' },
  opacity: 1, duration: 0.8
})

gsap.to('.card', {
  scrollTrigger: { trigger: '#services', start: 'top 60%' },
  opacity: 1, y: 0, scale: 1,
  duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)'
})

gsap.to('.product-card', {
  scrollTrigger: { trigger: '#products', start: 'top 60%' },
  opacity: 1, y: 0,
  duration: 0.7, stagger: 0.1, ease: 'power3.out'
})

gsap.to('#contact .section-title', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  opacity: 1, duration: 0.8
})

gsap.to('.contact-form', {
  scrollTrigger: { trigger: '#contact', start: 'top 60%' },
  opacity: 1, y: 0, duration: 1, ease: 'power3.out'
})
