/**
 * TECHFEST IIT BOMBAY — THE INNOVATION DIMENSION
 * Procedural 3D Environment, GSAP ScrollTrigger Flight Path & State Engine
 */

(function () {
  'use strict';

  // --- STATE CONFIGURATION ---
  const state = {
    isReady: false,
    hasEntered: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    currentZone: 0,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isMobile: window.innerWidth < 860
  };

  // --- DOM REFERENCES WITH DEFENSIVE CHECKS ---
  const dom = {
    canvas: document.getElementById('webgl-canvas'),
    loader: document.getElementById('loader-screen'),
    loaderBar: document.getElementById('loader-bar'),
    loaderStatus: document.getElementById('loader-status'),
    loaderPercent: document.getElementById('loader-percent'),
    enterBtn: document.getElementById('enter-btn'),
    zoneCounter: document.getElementById('zone-counter'),
    hudCoords: document.getElementById('hud-coords'),
    scrollThumb: document.getElementById('scroll-thumb'),
    tooltip: document.getElementById('object-tooltip'),
    tooltipTitle: document.getElementById('tooltip-title'),
    tooltipDesc: document.getElementById('tooltip-desc'),
    cursorDot: document.getElementById('cursor-dot'),
    cursorRing: document.getElementById('cursor-ring')
  };

  // --- AUDIO SYNTHESIZER (No External Asset Dependency) ---
  let audioCtx = null;

  function initAudio() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass && !audioCtx) {
        audioCtx = new AudioCtxClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (e) {
      console.warn('Web Audio not accessible on this client.', e);
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.04) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore silent audio context errors
    }
  }

  // --- INITIALIZATION GUARD & PROGRESS EMULATOR ---
  function setupLoader() {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        onEngineReady();
      }
      if (dom.loaderBar) dom.loaderBar.style.width = progress + '%';
      if (dom.loaderPercent) dom.loaderPercent.innerText = progress + '%';
    }, 80);

    // Fail-safe timeout: Force reveal enter button within 1.4s regardless of network delays
    setTimeout(() => {
      if (!state.isReady) {
        clearInterval(progressInterval);
        if (dom.loaderBar) dom.loaderBar.style.width = '100%';
        if (dom.loaderPercent) dom.loaderPercent.innerText = '100%';
        onEngineReady();
      }
    }, 1400);
  }

  function onEngineReady() {
    state.isReady = true;
    if (dom.loaderStatus) dom.loaderStatus.innerText = 'DIMENSION READY';
    if (dom.enterBtn) {
      dom.enterBtn.removeAttribute('disabled');
      dom.enterBtn.addEventListener('click', enterDimension, { once: true });
    }
  }

  function enterDimension() {
    initAudio();
    playTone(520, 'triangle', 0.4, 0.08);

    if (dom.loader) {
      dom.loader.classList.add('hidden');
    }

    state.hasEntered = true;

    // Cinematic introductory camera zoom
    if (typeof gsap !== 'undefined' && world.camera) {
      gsap.to(world.camera.position, {
        z: 22,
        y: 1.5,
        duration: 2.2,
        ease: 'power3.inOut'
      });
    }
  }

  // --- THREE.JS PROCEDURAL SCENE ARCHITECTURE ---
  const world = {
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    raycaster: null,
    mouseVec: null,
    interactiveObjects: [],
    coreGroup: null,
    arenaGroup: null,
    buildGroup: null,
    exploreGroup: null,
    connectGroup: null,
    particles: null
  };

  function initThree() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js failed to load from CDN.');
      return;
    }

    world.scene = new THREE.Scene();
    world.scene.background = new THREE.Color(0x050608);
    world.scene.fog = new THREE.FogExp2(0x050608, 0.024);

    world.camera = new THREE.PerspectiveCamera(
      state.isMobile ? 65 : 50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    world.camera.position.set(0, 4, 34);

    world.renderer = new THREE.WebGLRenderer({
      canvas: dom.canvas,
      antialias: !state.isMobile,
      powerPreference: 'high-performance',
      alpha: false
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    world.renderer.setPixelRatio(dpr);
    world.renderer.setSize(window.innerWidth, window.innerHeight);
    world.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    world.renderer.toneMappingExposure = 1.1;

    world.clock = new THREE.Clock();
    world.raycaster = new THREE.Raycaster();
    world.mouseVec = new THREE.Vector2();

    setupLighting();
    setupCoreGeometry();
    setupCompeteZone();
    setupBuildZone();
    setupExploreZone();
    setupConnectZone();
    setupCosmicParticleField();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    setupScrollTriggers();
    renderLoop();
  }

  // --- LIGHTING ---
  function setupLighting() {
    const ambient = new THREE.AmbientLight(0x16202c, 1.2);
    world.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(12, 20, 15);
    world.scene.add(dirLight);

    const coreLight = new THREE.PointLight(0x00ff88, 3.5, 30);
    coreLight.position.set(0, 0, 0);
    world.scene.add(coreLight);
  }

  // --- ZONE 00: CENTRAL INNOVATION CORE ---
  function setupCoreGeometry() {
    world.coreGroup = new THREE.Group();

    // Glowing Inner Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = { name: 'TF CORE NEXUS', desc: 'DIMENSION INCEPTION // IIT BOMBAY' };
    world.coreGroup.add(coreMesh);
    world.interactiveObjects.push(coreMesh);

    // Dynamic Concentric Gimbal Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x5a6d82,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.05, 16, 100), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.05, 16, 100), ringMat);
    ring2.rotation.x = Math.PI / 3;
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.05, 16, 100), ringMat);
    ring3.rotation.y = Math.PI / 4;

    world.coreGroup.add(ring1, ring2, ring3);
    world.scene.add(world.coreGroup);
  }

  // --- ZONE 01: COMPETE ARENA ---
  function setupCompeteZone() {
    world.arenaGroup = new THREE.Group();
    world.arenaGroup.position.set(-6, -14, -12);

    const ringGeo = new THREE.TorusGeometry(5, 0.12, 12, 8); // Octagonal competition arena
    const arenaMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      wireframe: true,
      metalness: 0.9
    });

    const arenaRing = new THREE.Mesh(ringGeo, arenaMat);
    arenaRing.rotation.x = Math.PI / 2;
    arenaRing.userData = { name: 'ROBOTICS ARENA', desc: 'AUTONOMOUS KINETIC BATTLEGROUND' };

    const trophyGeo = new THREE.OctahedronGeometry(1.8, 0);
    const trophyMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      wireframe: true
    });
    const trophy = new THREE.Mesh(trophyGeo, trophyMat);
    trophy.position.y = 0.5;
    trophy.userData = { name: 'CHAMPION MATRIX', desc: 'ALGORITHMIC TRIUMPH NODE' };

    world.arenaGroup.add(arenaRing, trophy);
    world.interactiveObjects.push(arenaRing, trophy);
    world.scene.add(world.arenaGroup);
  }

  // --- ZONE 02: BUILD (Kinetic Assembly Voxel Structure) ---
  function setupBuildZone() {
    world.buildGroup = new THREE.Group();
    world.buildGroup.position.set(7, -30, -28);

    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x3f536b,
      wireframe: true
    });

    // Create 3D matrix array of assembleable blocks
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        const block = new THREE.Mesh(cubeGeo, cubeMat);
        block.position.set(x * 1.5, y * 1.5, (Math.random() - 0.5) * 2);
        block.userData = {
          name: `ASSEMBLY BLOCK [${x},${y}]`,
          desc: 'KINETIC HARDWARE PROTOTYPING'
        };
        world.buildGroup.add(block);
        world.interactiveObjects.push(block);
      }
    }

    world.scene.add(world.buildGroup);
  }

  // --- ZONE 03: EXPLORE TUNNEL ---
  function setupExploreZone() {
    world.exploreGroup = new THREE.Group();
    world.exploreGroup.position.set(0, -48, -48);

    const tunnelRings = 12;
    for (let i = 0; i < tunnelRings; i++) {
      const radius = 4.5 + Math.sin(i * 0.4) * 1.5;
      const tGeo = new THREE.TorusGeometry(radius, 0.04, 8, 48);
      const tMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ff88 : 0x00e5ff,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(tGeo, tMat);
      ring.position.z = -i * 5;
      world.exploreGroup.add(ring);
    }

    world.scene.add(world.exploreGroup);
  }

  // --- ZONE 04: CONNECT (Constellation Network) ---
  function setupConnectZone() {
    world.connectGroup = new THREE.Group();
    world.connectGroup.position.set(0, -70, -70);

    const nodeCount = 28;
    const nodePositions = [];
    const sphereGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
      mesh.position.copy(pos);
      mesh.userData = { name: `NODE // 0x${i.toString(16).toUpperCase()}`, desc: 'SYNAPSE: RESEARCHER & CREATOR' };
      world.connectGroup.add(mesh);
      world.interactiveObjects.push(mesh);
      nodePositions.push(pos);
    }

    // Connect node pairs with lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1d3644, transparent: true, opacity: 0.6 });
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 7) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
          const line = new THREE.Line(lineGeo, lineMat);
          world.connectGroup.add(line);
        }
      }
    }

    world.scene.add(world.connectGroup);
  }

  // --- SURROUNDING PARTICLE FIELD ---
  function setupCosmicParticleField() {
    const particleCount = state.isMobile ? 400 : 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 140;
      positions[i + 1] = (Math.random() - 0.5) * 160 - 30;
      positions[i + 2] = (Math.random() - 0.5) * 140 - 20;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: state.isMobile ? 0.35 : 0.25,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.45
    });

    world.particles = new THREE.Points(geo, mat);
    world.scene.add(world.particles);
  }

  // --- GSAP SCROLLTRIGGER FLIGHT PIPELINE ---
  function setupScrollTriggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP ScrollTrigger not found. 3D flight fallback active.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const flightTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#smooth-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          updateZoneCounter(self.progress);
        }
      }
    });

    // Flight Path Waypoints
    flightTimeline
      // Zone 01: Turn towards Arena
      .to(world.camera.position, { x: -4, y: -13, z: -4, ease: 'none' }, 0.1)
      // Zone 02: Move to Build voxel array
      .to(world.camera.position, { x: 5, y: -29, z: -20, ease: 'none' }, 0.35)
      // Zone 03: Warp through Tunnel
      .to(world.camera.position, { x: 0, y: -48, z: -40, ease: 'none' }, 0.6)
      // Zone 04: Arrive in Connect constellation
      .to(world.camera.position, { x: 0, y: -69, z: -58, ease: 'none' }, 0.8)
      // Zone 05: Open into Frontier portal
      .to(world.camera.position, { x: 0, y: -82, z: -88, ease: 'none' }, 1.0);
  }

  function updateZoneCounter(progress) {
    let zone = 0;
    if (progress > 0.85) zone = 5;
    else if (progress > 0.65) zone = 4;
    else if (progress > 0.45) zone = 3;
    else if (progress > 0.22) zone = 2;
    else if (progress > 0.05) zone = 1;

    if (state.currentZone !== zone) {
      state.currentZone = zone;
      if (dom.zoneCounter) {
        dom.zoneCounter.innerText = `0${zone}`;
      }
      playTone(380 + zone * 40, 'sine', 0.08, 0.02);
    }

    // Scroll rail thumb height
    if (dom.scrollThumb) {
      dom.scrollThumb.style.height = `${progress * 100}%`;
    }
  }

  // --- EVENT LISTENERS & INTERACTION ---
  function onPointerMove(e) {
    state.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

    // Desktop Custom Cursor
    if (!state.isMobile && dom.cursorDot && dom.cursorRing) {
      dom.cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      dom.cursorRing.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
    }

    world.mouseVec.x = state.mouse.targetX;
    world.mouseVec.y = state.mouse.targetY;
  }

  function onWindowScroll() {
    // Coordinate HUD telemetric display
    if (dom.hudCoords && world.camera) {
      const pos = world.camera.position;
      dom.hudCoords.innerText = `POS: [${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}]`;
    }
  }

  function onWindowResize() {
    if (!world.camera || !world.renderer) return;
    world.camera.aspect = window.innerWidth / window.innerHeight;
    world.camera.updateProjectionMatrix();
    world.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- CONTINUOUS RENDER LOOP ---
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    const delta = world.clock.getDelta();
    const time = world.clock.getElapsedTime();

    // Mouse Parallax Damping
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

    // Dynamic Geometry Rotations
    if (world.coreGroup) {
      world.coreGroup.rotation.y = time * 0.25;
      world.coreGroup.rotation.x = Math.sin(time * 0.2) * 0.15;
    }

    if (world.arenaGroup) {
      world.arenaGroup.rotation.z = time * 0.2;
    }

    if (world.buildGroup) {
      world.buildGroup.rotation.y = Math.cos(time * 0.3) * 0.2;
    }

    if (world.particles) {
      world.particles.rotation.y = -time * 0.03;
    }

    // Interactive Raycasting (Hover Highlights)
    if (world.raycaster && world.camera && world.interactiveObjects.length > 0) {
      world.raycaster.setFromCamera(world.mouseVec, world.camera);
      const intersects = world.raycaster.intersectObjects(world.interactiveObjects);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (dom.tooltip && hit.userData.name) {
          dom.tooltip.classList.add('active');
          if (dom.tooltipTitle) dom.tooltipTitle.innerText = hit.userData.name;
          if (dom.tooltipDesc) dom.tooltipDesc.innerText = hit.userData.desc || 'TECHFEST COMPONENT';
        }
      } else {
        if (dom.tooltip) dom.tooltip.classList.remove('active');
      }
    }

    // Camera LookAt Follow & Parallax offset
    if (world.camera) {
      world.camera.position.x += (state.mouse.x * 1.5 - world.camera.position.x * 0.05) * 0.02;
      world.renderer.render(world.scene, world.camera);
    }
  }

  // --- BOOT ENGINE ON DOM CONTENT LOADED ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLoader();
      initThree();
    });
  } else {
    setupLoader();
    initThree();
  }

})();