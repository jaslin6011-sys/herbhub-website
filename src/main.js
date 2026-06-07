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

// Floating particles
const geometry = new THREE.BufferGeometry()
const count = 500
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const material = new THREE.PointsMaterial({ size: 0.03, color: 0x16a34a, transparent: true, opacity: 0.8 })
const particles = new THREE.Points(geometry, material)
scene.add(particles)

// Glowing ring
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.5, 0.04, 16, 100),
  new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true })
)
scene.add(ring)

// Mouse parallax
let mouseX = 0, mouseY = 0
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  particles.rotation.y += 0.0005
  particles.rotation.x += 0.0002
  ring.rotation.x += 0.003
  ring.rotation.y += 0.005
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
  camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
}
animate()

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// GSAP Scroll Animations — set initial hidden state via JS not CSS
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

gsap.to('#contact .content-box', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  opacity: 1, y: 0, duration: 1, ease: 'power3.out'
})

gsap.to('.product-card', {
  scrollTrigger: { trigger: '#products', start: 'top 60%' },
  opacity: 1, y: 0,
  duration: 0.7, stagger: 0.1, ease: 'power3.out'
})

gsap.to(ring.position, {
  scrollTrigger: { scrub: 2, start: 'top top', end: 'bottom bottom' },
  y: -5, x: 2
})
