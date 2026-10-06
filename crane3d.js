(function () {
  function init() {
    const box = document.getElementById('crane3d');
    if (!box || typeof THREE === 'undefined') {
      if (box) box.innerHTML = '<p style="padding:1rem">La 3D nécessite une connexion internet (Three.js).</p>';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    box.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(4, 8, 5);
    scene.add(sun);

    const cardboard = new THREE.MeshLambertMaterial({ color: 0xc79a5b });
    const blue = new THREE.MeshLambertMaterial({ color: 0x12304f });
    const red = new THREE.MeshLambertMaterial({ color: 0xc0392b });
    const rope = new THREE.MeshLambertMaterial({ color: 0xe8dcc0 });

    const grid = new THREE.GridHelper(10, 20, 0x12304f, 0xb8c4d0);
    scene.add(grid);

    function bar(a, b, r, mat) {
      const d = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      scene.add(m);
      return m;
    }
    function block(w, h, d, mat, x, y, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }

    // Portique : deux cadres en A de part et d'autre, poutre à 5 m
    const H = 5;
    [-1.8, 1.8].forEach(x => {
      bar(new THREE.Vector3(x, 0, -1.1), new THREE.Vector3(x, H, 0), 0.08, cardboard);
      bar(new THREE.Vector3(x, 0, 1.1), new THREE.Vector3(x, H, 0), 0.08, cardboard);
      bar(new THREE.Vector3(x, 1.2, -0.47), new THREE.Vector3(x, 1.2, 0.47), 0.04, cardboard);
      block(0.4, 0.06, 2.4, blue, x, 0.03, 0);
    });
    block(4.0, 0.22, 0.3, cardboard, 0, H + 0.11, 0);
    block(4.0, 0.04, 0.34, blue, 0, H + 0.24, 0);

    // Treuil : tambour et manivelle sur le cadre gauche
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 20), blue);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(-1.8, 1.7, 0.9);
    scene.add(drum);
    const crank = new THREE.Group();
    crank.position.set(-1.8, 1.7, 1.2);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), red);
    arm.position.x = 0.25;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), red);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0.5, 0, 0.1);
    crank.add(arm, handle);
    scene.add(crank);

    // Chariot, corde, charge
    const trolley = block(0.5, 0.2, 0.5, blue, 0, H - 0.1, 0);
    const wheelL = block(0.08, 0.08, 0.5, red, -0.2, H - 0.02, 0);
    const wheelR = block(0.08, 0.08, 0.5, red, 0.2, H - 0.02, 0);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), rope);
    scene.add(cord);
    const load = block(0.5, 0.5, 0.5, red, 0, 0.3, 0);

    let T = 0, L = 0, theta = 0.7, phi = 1.15, dist = 12;
    const target = new THREE.Vector3(0, 2.4, 0);

    function pose() {
      const x = (T - 0.5) * 3;
      trolley.position.x = x;
      wheelL.position.x = x - 0.2;
      wheelR.position.x = x + 0.2;
      const top = H - 0.2;
      const loadTop = 0.55 + L * 4;
      load.position.set(x, loadTop - 0.25, 0);
      cord.scale.y = top - loadTop;
      cord.position.set(x, (top + loadTop) / 2, 0);
      crank.rotation.z = -L * 12;
      drum.rotation.y = -L * 12;
      oT.textContent = Math.round(T * 30) + ' cm';
      oL.textContent = Math.round(L * 40) + ' cm';
    }

    function cam() {
      camera.position.set(
        target.x + dist * Math.sin(phi) * Math.sin(theta),
        target.y + dist * Math.cos(phi),
        target.z + dist * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    }

    function resize() {
      const w = box.clientWidth, h = box.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dist = w < 500 ? 16 : 12;
      cam();
    }
    addEventListener('resize', resize);

    // Rotation à la souris / au doigt
    let drag = false, lx = 0, ly = 0;
    box.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointerup', () => (drag = false));
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      theta -= (e.clientX - lx) * 0.008;
      phi = Math.min(1.5, Math.max(0.3, phi - (e.clientY - ly) * 0.008));
      lx = e.clientX; ly = e.clientY;
      cam();
    });

    // Curseurs et démo
    const sT = document.getElementById('sT'), sL = document.getElementById('sL');
    const oT = document.getElementById('oT'), oL = document.getElementById('oL');
    const demo = document.getElementById('demo');
    let playing = false, t0 = 0;
    sT.addEventListener('input', () => { T = +sT.value; pose(); });
    sL.addEventListener('input', () => { L = +sL.value; pose(); });
    demo.addEventListener('click', () => {
      playing = !playing;
      t0 = performance.now();
      demo.textContent = playing ? 'Arrêter la démo' : 'Lancer la démo';
    });

    // Ne dessiner que lorsque la section est visible
    let visible = true;
    new IntersectionObserver(en => (visible = en[0].isIntersecting)).observe(box);

    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      if (playing) {
        // cycle : lever, translater, descendre, revenir
        const c = ((now - t0) / 1000 % 12) / 12;
        const ease = v => v * v * (3 - 2 * v);
        const seg = (a, b) => ease(Math.min(1, Math.max(0, (c - a) / (b - a))));
        L = seg(0, 0.25) - seg(0.5, 0.75);
        T = seg(0.25, 0.5) - seg(0.75, 1);
        sL.value = L; sT.value = T;
        pose();
      }
      renderer.render(scene, camera);
    }

    resize();
    pose();
    requestAnimationFrame(loop);
  }
  
  if (typeof THREE !== 'undefined') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();