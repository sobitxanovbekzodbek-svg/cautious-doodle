/* ==========================================================================
   AURA 3D — THREE.JS ENGINE & INTERACTIVE 3D ANIMATIONS
   ========================================================================== */

class ThreeSceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Active 3D Objects
        this.mainMesh = null;
        this.innerCore = null;
        this.ring1 = null;
        this.ring2 = null;
        this.particles = null;
        this.particleGeo = null;

        // State parameters
        this.state = 'idle'; // 'idle', 'thinking', 'speaking'
        this.modelType = 'cyber-orb';
        this.themeColor = new THREE.Color(0x00f3ff);
        this.isWireframe = false;
        this.autoRotate = true;

        // Mouse tracking target
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };

        // Audio reactive values
        this.audioPulse = 0;

        this.init();
    }

    init() {
        // 1. Create Scene
        this.scene = new THREE.Scene();

        // 2. Setup Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 8);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // 4. Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.maxDistance = 15;
        this.controls.minDistance = 4;

        // 5. Lighting Setup
        this.setupLights();

        // 6. Build initial 3D model & background particles
        this.buildBackgroundParticles();
        this.loadModel(this.modelType);

        // 7. Window resize listener & mouse move listener
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // 8. Start Animation Loop
        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        this.pointLight1 = new THREE.PointLight(this.themeColor, 3, 20);
        this.pointLight1.position.set(5, 5, 5);
        this.scene.add(this.pointLight1);

        this.pointLight2 = new THREE.PointLight(0x7000ff, 2, 20);
        this.pointLight2.position.set(-5, -5, -5);
        this.scene.add(this.pointLight2);
    }

    buildBackgroundParticles() {
        const particleCount = 700;
        this.particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 30;
            positions[i + 1] = (Math.random() - 0.5) * 30;
            positions[i + 2] = (Math.random() - 0.5) * 30;
            scales[i / 3] = Math.random() * 0.05 + 0.02;
        }

        this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: this.themeColor,
            size: 0.08,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(this.particleGeo, particleMat);
        this.scene.add(this.particles);
    }

    loadModel(type) {
        // Remove existing model group if present
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
        }

        this.modelGroup = new THREE.Group();
        this.modelType = type;

        switch (type) {
            case 'cyber-orb':
                this.createCyberOrb();
                break;
            case 'quantum-head':
                this.createQuantumHead();
                break;
            case 'hologram-cube':
                this.createHologramCube();
                break;
            case 'plasma-torus':
                this.createPlasmaTorus();
                break;
            default:
                this.createCyberOrb();
        }

        this.scene.add(this.modelGroup);
    }

    createCyberOrb() {
        // Outer Geodesic Sphere
        const outerGeo = new THREE.IcosahedronGeometry(2, 2);
        const outerMat = new THREE.MeshStandardMaterial({
            color: this.themeColor,
            wireframe: true,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        this.mainMesh = new THREE.Mesh(outerGeo, outerMat);
        this.modelGroup.add(this.mainMesh);

        // Glowing Inner Nucleus Core
        const innerGeo = new THREE.SphereGeometry(1.1, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({
            color: this.themeColor,
            transparent: true,
            opacity: 0.6
        });
        this.innerCore = new THREE.Mesh(innerGeo, innerMat);
        this.modelGroup.add(this.innerCore);

        // Sci-Fi Orbital Ring 1
        const ringGeo1 = new THREE.TorusGeometry(2.8, 0.03, 16, 100);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: this.themeColor, wireframe: this.isWireframe });
        this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        this.ring1.rotation.x = Math.PI / 3;
        this.modelGroup.add(this.ring1);

        // Sci-Fi Orbital Ring 2
        const ringGeo2 = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x7000ff });
        this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        this.ring2.rotation.y = Math.PI / 4;
        this.modelGroup.add(this.ring2);
    }

    createQuantumHead() {
        // Geometric Cyber Robotic Head abstraction using Dodecahedron & Facets
        const headGeo = new THREE.DodecahedronGeometry(1.8, 1);
        const headMat = new THREE.MeshStandardMaterial({
            color: this.themeColor,
            wireframe: this.isWireframe,
            roughness: 0.3,
            metalness: 0.9,
            flatShading: true
        });
        this.mainMesh = new THREE.Mesh(headGeo, headMat);
        this.modelGroup.add(this.mainMesh);

        // Glowing Eyes Nodes
        const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

        const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
        eyeLeft.position.set(-0.6, 0.4, 1.4);
        this.modelGroup.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
        eyeRight.position.set(0.6, 0.4, 1.4);
        this.modelGroup.add(eyeRight);

        // Floating Communication Ring
        const ringGeo = new THREE.TorusGeometry(2.5, 0.04, 16, 80);
        const ringMat = new THREE.MeshBasicMaterial({ color: this.themeColor });
        this.ring1 = new THREE.Mesh(ringGeo, ringMat);
        this.ring1.rotation.x = Math.PI / 2;
        this.modelGroup.add(this.ring1);
    }

    createHologramCube() {
        // Outer Cube
        const boxGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
        const boxMat = new THREE.MeshStandardMaterial({
            color: this.themeColor,
            wireframe: true,
            roughness: 0.1,
            metalness: 1.0
        });
        this.mainMesh = new THREE.Mesh(boxGeo, boxMat);
        this.modelGroup.add(this.mainMesh);

        // Inner Nested Cube
        const innerBoxGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        const innerBoxMat = new THREE.MeshStandardMaterial({
            color: 0xff007f,
            wireframe: false,
            transparent: true,
            opacity: 0.7
        });
        this.innerCore = new THREE.Mesh(innerBoxGeo, innerBoxMat);
        this.modelGroup.add(this.innerCore);
    }

    createPlasmaTorus() {
        const torusGeo = new THREE.TorusKnotGeometry(1.6, 0.4, 120, 16);
        const torusMat = new THREE.MeshStandardMaterial({
            color: this.themeColor,
            wireframe: this.isWireframe,
            roughness: 0.2,
            metalness: 0.8
        });
        this.mainMesh = new THREE.Mesh(torusGeo, torusMat);
        this.modelGroup.add(this.mainMesh);
    }

    // Color & Material updates
    setColor(hexColor) {
        this.themeColor = new THREE.Color(hexColor);
        this.pointLight1.color = this.themeColor;
        if (this.particles) this.particles.material.color = this.themeColor;

        if (this.mainMesh && this.mainMesh.material) {
            this.mainMesh.material.color = this.themeColor;
        }
        if (this.innerCore && this.innerCore.material) {
            this.innerCore.material.color = this.themeColor;
        }
        if (this.ring1 && this.ring1.material) {
            this.ring1.material.color = this.themeColor;
        }
    }

    setWireframe(enabled) {
        this.isWireframe = enabled;
        if (this.mainMesh && this.mainMesh.material) {
            this.mainMesh.material.wireframe = enabled;
        }
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
        this.controls.autoRotate = enabled;
        this.controls.autoRotateSpeed = 1.5;
    }

    // State transitions: 'idle', 'thinking', 'speaking'
    setState(newState) {
        this.state = newState;
        console.log(`[ThreeScene] 3D Avatar State Changed -> ${newState}`);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.targetRotation.x = this.mouse.y * 0.4;
        this.targetRotation.y = this.mouse.x * 0.4;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Animation Render Loop
    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Smooth rotation based on cursor tracking when idle/thinking
        if (this.modelGroup) {
            this.modelGroup.rotation.x += (this.targetRotation.x - this.modelGroup.rotation.x) * 0.05;
            this.modelGroup.rotation.y += (this.targetRotation.y - this.modelGroup.rotation.y) * 0.05;
        }

        // Particle floating movement
        if (this.particles) {
            this.particles.rotation.y = time * 0.03;
        }

        // State-Specific 3D Animations
        switch (this.state) {
            case 'idle':
                if (this.mainMesh) {
                    this.mainMesh.rotation.y += 0.005;
                    this.mainMesh.position.y = Math.sin(time * 1.5) * 0.15;
                }
                if (this.ring1) this.ring1.rotation.z += 0.01;
                if (this.ring2) this.ring2.rotation.x -= 0.012;
                break;

            case 'thinking':
                // Fast energy rotation & pulse
                if (this.mainMesh) {
                    this.mainMesh.rotation.y += 0.04;
                    this.mainMesh.rotation.x += 0.02;
                    const scalePulse = 1 + Math.sin(time * 8) * 0.08;
                    this.mainMesh.scale.set(scalePulse, scalePulse, scalePulse);
                }
                if (this.ring1) this.ring1.rotation.z += 0.05;
                if (this.ring2) this.ring2.rotation.x -= 0.06;
                break;

            case 'speaking':
                // Audio wave reactive pulsing
                if (this.mainMesh) {
                    this.mainMesh.rotation.y += 0.015;
                    const speakScale = 1 + Math.sin(time * 15) * 0.12 + (Math.random() * 0.05);
                    this.mainMesh.scale.set(speakScale, speakScale, speakScale);
                }
                if (this.innerCore) {
                    this.innerCore.material.opacity = 0.5 + Math.sin(time * 20) * 0.3;
                }
                if (this.ring1) this.ring1.rotation.z += 0.025;
                break;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Global instance handle
window.ThreeSceneManager = ThreeSceneManager;
