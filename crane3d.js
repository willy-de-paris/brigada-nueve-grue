(function () {
  function init() {
    const box = document.getElementById('crane3d');
    if (!box) {
      console.error('Conteneur #crane3d non trouvé');
      return;
    }
    if (typeof THREE === 'undefined') {
      box.innerHTML = '<p style="padding:1rem">La 3D nécessite une connexion internet (Three.js).</p>';
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
    const grey = new THREE.MeshLambertMaterial({ color: 0x55606c });
    const rope = new THREE.MeshLambertMaterial({ color: 0xe8dcc0 });

    scene.add(new THREE.GridHelper(10, 20, 0x12304f, 0xb8c4d0));

    function add(parent, m) { parent.add(m); return m; }
    function block(parent, w, h, d, mat, x, y, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      return add(parent, m);
    }
    function bar(parent, a, b, r, mat) {
      const d = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      return add(parent, m);
    }
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    // Base lestée (fixe)
    block(scene, 2.6, 0.14, 2.6, cardboard, 0, 0.07, 0);
    block(scene, 2.7, 0.04, 2.7, blue, 0, 0.01, 0);

    // Partie tournante : mât, flèche, tirant, treuil, lest, poulie
    const swing = new THREE.Group();
    scene.add(swing);

    const MAST = 6.2, REACH = 3, TIP = 5.4;
    add(swing, Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, MAST, 16), cardboard),
      { position: V(0, 0.14 + MAST / 2, 0) }));
    add(swing, Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), blue),
      { position: V(0, 0.14, 0) })); // pivot au sol
    add(swing, Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), red),
      { position: V(0, 4.4, 0) })); // articulation de la flèche

    bar(swing, V(0, 4.4, 0), V(REACH, TIP, 0), 0.07, cardboard);          // flèche
    bar(swing, V(0, MAST + 0.1, 0), V(REACH, TIP, 0), 0.025, grey);        // tirant
    block(swing, 0.3, 0.06, 0.3, blue, 0, MAST + 0.12, 0);

    // Poulie en bout de flèche
    const pulley = add(swing, Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 20), red),
      { position: V(REACH, TIP - 0.05, 0) }));
    pulley.rotation.x = Math.PI / 2;

    // Lest (contrepoids) du côté opposé à la flèche
    block(swing, 0.8, 0.5, 0.8, grey, -0.9, 0.4, 0);

    // Treuil sur le mât
    const drum = add(swing, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 20), blue));
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0.45, 1.3, 0);
    const crank = new THREE.Group();
    crank.position.set(0.45, 1.3, 0.38);
    block(crank, 0.5, 0.05, 0.05, red, 0.25, 0, 0);
    const handle = add(crank, new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), red));
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0.5, 0, 0.1);
    swing.add(crank);

    // Ficelle fixe : treuil -> haut du mât -> le long de la flèche
    bar(swing, V(0.45, 1.5, 0.05), V(0.3, 4.45, 0.12), 0.012, rope);
    bar(swing, V(0.3, 4.45, 0.12), V(REACH, TIP + 0.1, 0.06), 0.012, rope);

    // Ficelle verticale et charge (longueur variable)
    const cord = add(swing, new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), rope));
    const load = block(swing, 0.5, 0.5, 0.5, red, REACH, 0.3, 0);

    let T = 0, L = 0, theta = 0.7, phi = 1.15, dist = 14;
    const target = V(0, 2.8, 0);

    function pose() {
      swing.rotation.y = -T * 1; // 1 rad de rotation = arc de 3 m (30 cm sur la maquette)
      const top = TIP - 0.2;
      const loadTop = 0.55 + L * 4;
      load.position.set(REACH, loadTop - 0.25, 0);
      cord.scale.y = top - loadTop;
      cord.position.set(REACH, (top + loadTop) / 2, 0);
      crank.rotation.z = -L * 12;
      drum.rotation.y = -L * 12;
      oT.textContent = Math.round(T * 57.3) + '° (arc ' + Math.round(T * 30) + ' cm)';
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
      dist = w < 500 ? 19 : 14;
      cam();
    }
    addEventListener('resize', resize);

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

    let visible = true;
    new IntersectionObserver(en => (visible = en[0].isIntersecting)).observe(box);

    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      if (playing) {
        // cycle : lever, tourner le mât, descendre, revenir
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

  function checkAndInit() {
    if (document.readyState !== 'loading' && typeof THREE !== 'undefined') {
      init();
    }
  }

  document.addEventListener('DOMContentLoaded', checkAndInit);
  window.addEventListener('load', checkAndInit);
})();