import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Capsule Opening Animation ──
window.addEventListener('load', () => {
  const tl = gsap.timeline({
    onComplete: () => {
      document.getElementById('capsule-intro').style.display = 'none'
      startHeroAnimation()
    }
  })

  // 1. Capsule drops in
  tl.from('.capsule-wrap', { y: -400, opacity: 0, duration: 0.7, ease: 'bounce.out' })

  // 2. Gentle wobble
  .to('.capsule-wrap', { rotation: 6, duration: 0.12, ease: 'power1.inOut' })
  .to('.capsule-wrap', { rotation: -6, duration: 0.12, ease: 'power1.inOut' })
  .to('.capsule-wrap', { rotation: 3, duration: 0.1 })
  .to('.capsule-wrap', { rotation: 0, duration: 0.1 })

  // 3. Seam glows brighter
  .to('.capsule-seam', { boxShadow: '0 0 30px rgba(74,222,128,1)', duration: 0.3 })

  // 4. Capsule cracks open — top flies up, bottom drops down
  .to('.capsule-top', { y: -260, rotation: -12, opacity: 0, duration: 0.65, ease: 'power3.in' }, '+=0.2')
  .to('.capsule-bottom', { y: 260, rotation: 12, opacity: 0, duration: 0.65, ease: 'power3.in' }, '<')

  // 5. Burst ring expands
  .to('.burst-ring', {
    opacity: 1, scale: 8,
    borderColor: 'rgba(74,222,128,0)',
    duration: 0.7, ease: 'power2.out'
  }, '<0.1')

  // 6. Brand name pops in
  .to('.capsule-brand', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '<0.2')
  .from('.capsule-brand', { scale: 0.5 }, '<')

  // 7. Hold for a moment then fade out
  .to('#capsule-intro', { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.6')
})

// ── Three.js Setup ──
const canvas = document.getElementById('bg')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 5

// ── Floating Leaf Shapes ──
function createLeaf() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.6, 0.5, 0.6, 1.5, 0, 2.2)
  shape.bezierCurveTo(-0.6, 1.5, -0.6, 0.5, 0, 0)

  const geometry = new THREE.ShapeGeometry(shape)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(
      Math.random() * 0.05 + 0.02,
      Math.random() * 0.45 + 0.35,
      Math.random() * 0.1 + 0.05
    ),
    transparent: true,
    opacity: Math.random() * 0.3 + 0.08,
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

const leaves = []
for (let i = 0; i < 40; i++) {
  const leaf = createLeaf()
  scene.add(leaf)
  leaves.push({
    mesh: leaf,
    riseSpeed: Math.random() * 0.006 + 0.002,
    rotSpeed: (Math.random() - 0.5) * 0.012,
    swaySpeed: Math.random() * 0.008 + 0.003,
    offset: Math.random() * Math.PI * 2
  })
}

// ── Pollen Particles ──
const particleGeo = new THREE.BufferGeometry()
const count = 250
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 20
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particleMat = new THREE.PointsMaterial({ size: 0.04, color: 0x86efac, transparent: true, opacity: 0.5 })
const particles = new THREE.Points(particleGeo, particleMat)
scene.add(particles)

// ── Mouse Parallax ──
let mouseX = 0, mouseY = 0
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
})

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()

  leaves.forEach(({ mesh, riseSpeed, rotSpeed, swaySpeed, offset }) => {
    mesh.position.y += riseSpeed
    mesh.rotation.z += rotSpeed
    mesh.position.x += Math.sin(elapsed * swaySpeed + offset) * 0.004
    if (mesh.position.y > 13) {
      mesh.position.y = -13
      mesh.position.x = (Math.random() - 0.5) * 22
    }
  })

  particles.rotation.y += 0.0003
  camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05
  camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.05
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
}
animate()

// ── Scroll: Leaves fade out → Glow orbs fade in ──
gsap.to(canvas, {
  scrollTrigger: { scrub: 1.5, start: 'top top', end: '25% top' },
  opacity: 0
})

// Glow orbs fade in as leaves fade out
gsap.to('.orb-1', {
  scrollTrigger: { scrub: 1, start: '15% top', end: '40% top' },
  opacity: 1
})
gsap.to('.orb-2', {
  scrollTrigger: { scrub: 1, start: '20% top', end: '45% top' },
  opacity: 1
})
gsap.to('.orb-3', {
  scrollTrigger: { scrub: 1, start: '25% top', end: '50% top' },
  opacity: 1
})

// ── Hero Animations (called after loader exits) ──
function startHeroAnimation() {
  const heroTl = gsap.timeline()
  heroTl
    .from('.hero-title',       { opacity: 0, y: 60,  duration: 1.2, ease: 'power4.out' })
    .from('.hero-sub',         { opacity: 0, y: 20,  duration: 0.8 }, '-=0.6')
    .from('.hero-cta',         { opacity: 0, y: 20,  duration: 0.7, ease: 'back.out(1.7)' }, '-=0.4')
    .from('.scroll-indicator', { opacity: 0,          duration: 0.5 }, '-=0.2')
}

// ── Scroll Animations ──
gsap.from('#about .content-box', {
  scrollTrigger: { trigger: '#about', start: 'top 70%' },
  opacity: 0, y: 80, duration: 1.1, ease: 'power3.out'
})

gsap.from('#services .section-title', {
  scrollTrigger: { trigger: '#services', start: 'top 75%' },
  opacity: 0, y: 30, duration: 0.8
})

gsap.from('.card', {
  scrollTrigger: { trigger: '#services', start: 'top 60%' },
  opacity: 0, y: 60, scale: 0.9,
  duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)'
})

gsap.from('#products .section-title', {
  scrollTrigger: { trigger: '#products', start: 'top 75%' },
  opacity: 0, y: 30, duration: 0.8
})

gsap.from('.product-card', {
  scrollTrigger: { trigger: '#products', start: 'top 65%' },
  opacity: 0, y: 70, scale: 0.95,
  duration: 0.7, stagger: 0.1, ease: 'power3.out'
})

// Animated arc on each CTA curve when product card enters view
gsap.from('.cta-curve path', {
  scrollTrigger: { trigger: '#products', start: 'top 60%' },
  strokeDasharray: 100,
  strokeDashoffset: 100,
  duration: 1, stagger: 0.1, ease: 'power2.out',
  attr: { 'stroke-dashoffset': 0 }
})

gsap.from('#contact .section-title', {
  scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  opacity: 0, y: 30, duration: 0.8
})

gsap.from('.contact-form', {
  scrollTrigger: { trigger: '#contact', start: 'top 65%' },
  opacity: 0, y: 60, duration: 1, ease: 'power3.out'
})

gsap.from('.contact-email', {
  scrollTrigger: { trigger: '#contact', start: 'top 55%' },
  opacity: 0, duration: 0.8, delay: 0.3
})

gsap.from('.badge', {
  scrollTrigger: { trigger: '.trust-section', start: 'top 80%' },
  opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out'
})

gsap.from('#testimonials .section-title', {
  scrollTrigger: { trigger: '#testimonials', start: 'top 75%' },
  opacity: 0, y: 30, duration: 0.8
})
gsap.from('.testimonial-card', {
  scrollTrigger: { trigger: '#testimonials', start: 'top 65%' },
  opacity: 0, y: 60, scale: 0.95,
  duration: 0.7, stagger: 0.15, ease: 'power3.out'
})

// ── FAQ Accordion ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement
    const isOpen = item.classList.contains('open')
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  })
})

gsap.from('#faq .section-title', {
  scrollTrigger: { trigger: '#faq', start: 'top 75%' },
  opacity: 0, y: 30, duration: 0.8
})
gsap.from('.faq-item', {
  scrollTrigger: { trigger: '#faq', start: 'top 65%' },
  opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power3.out'
})

// ── Hamburger Menu ──
const hamburger = document.getElementById('hamburger')
const navMenu = document.getElementById('nav-menu')
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open')
  navMenu.classList.toggle('open')
})
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open')
    navMenu.classList.remove('open')
  })
})

// ── Resize ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
