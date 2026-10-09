(function () {
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

  const carton = new THREE.MeshLambertMaterial({ color: 0xffe0b0 });
  const cardboard = new THREE.MeshLambertMaterial({ color: 0xc79a5b });
  const blue = new THREE.MeshLambertMaterial({ color: 0x12304f });
  const red = new THREE.MeshLambertMaterial({ color: 0xc0392b });
  const grey = new THREE.MeshLambertMaterial({ color: 0x55606c });
  const sand = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
  const green = new THREE.MeshLambertMaterial({ color: 0x1a9e5c });
  const cable = new THREE.MeshLambertMaterial({ color: 0xe03c31 });
  const glass = new THREE.MeshLambertMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.4 });

  scene.add(new THREE.GridHelper(10, 20, 0x12304f, 0xb8c4d0));

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function block(parent, w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  function cyl(parent, r1, r2, h, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 18), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  function bar(parent, a, b, r, mat) {
    const d = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    parent.add(m);
    return m;
  }

  // Dimensions (1 unité = 1 m réel ; maquette 1:10)
  const MAST = 6.0;                    // haut du mât : 60 cm
  const ARM = 3.0;                     // bras total : 30 cm (15 cm de chaque côté)
  const ANG = 25 * Math.PI / 180;      // inclinaison SOUS l'horizontale
  const REACH = (ARM / 2) * Math.cos(ANG);   // portée ≈ 1,36 m (13,6 cm)
  const TIPY = MAST - (ARM / 2) * Math.sin(ANG); // hauteur du bout de flèche ≈ 5,37 m
  const COUNTER_TIPY = MAST - (ARM / 2) * Math.sin(ANG); // hauteur du bout de contre-flèche (même hauteur)
  const W = 0.54;                      // mât en caisson 5,4 cm

  // Partie fixe : base, montants, deux plaques avec appuis plans, pivot central
  block(scene, 3, 0.14, 3, cardboard, 0, 0.07, 0);
  block(scene, 3.1, 0.04, 3.1, blue, 0, 0.01, 0);
  // Pieds de la base
  [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(p =>
    block(scene, 0.2, 0.1, 0.2, grey, p[0], 0, p[1]));
  [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(p =>
    bar(scene, V(p[0], 0.14, p[1]), V(p[0], 5.3, p[1]), 0.03, grey));
  [[5.1, 4.8], [0.6, 0.3]].forEach(h => {
    block(scene, 1.7, 0.06, 1.7, green, 0, h[0], 0);      // plaque
    block(scene, 1.7, 0.06, 1.7, cardboard, 0, h[1], 0);  // appui plan
  });
  const manchon = cyl(scene, 0.3, 0.3, 0.8, blue, 0, 1.3, 0); // pivot central
  manchon.material = new THREE.MeshLambertMaterial({ color: 0x12304f, transparent: true, opacity: 0.55 });

  // Partie tournante : axe, mât, palan, flèche, contrepoids
  const swing = new THREE.Group();
  scene.add(swing);

  cyl(swing, 0.06, 0.06, 2.1, grey, 0, 1.0, 0);                         // axe du pivot
  block(swing, W, 4.0, W, glass, 0, 4.0, 0);                             // mât (transparent)
  [0.35, 0.55].forEach((x, i) => [1, 2, 3].forEach(k =>
    cyl(swing, 0.1, 0.1, 0.1, carton, -0.2 + (k - 1) * 0.2, 4.0 + (i ? -0.3 : 0.3), 0).rotation.x = Math.PI / 2)); // 6 poulies du palan
  [5.0, 0.45].forEach(y => cyl(swing, 0.2, 0.2, 0.1, red, 0, y, 0));    // butées

  const tip = V(REACH, TIPY, 0);
  const counterTip = V(-REACH, COUNTER_TIPY, 0);
  bar(swing, counterTip, tip, 0.1, carton);                                // bras continu de 30 cm (15 cm de chaque côté)
  block(swing, 0.35, 0.9, 0.6, sand, -REACH - 0.2, COUNTER_TIPY - 0.5, 0); // contrepoids sur l'extrémité gauche

  const P1 = cyl(swing, 0.15, 0.15, 0.07, red, 0.35, MAST - 0.1 - 0.35 * Math.tan(ANG) + 0.2, 0);
  const P2 = cyl(swing, 0.17, 0.17, 0.07, red, REACH, TIPY + 0.25, 0);
  P1.rotation.x = Math.PI / 2;
  P2.rotation.x = Math.PI / 2;

  // Câble : palan -> poulie de renvoi -> poulie de bout de flèche
  bar(swing, V(-0.2, 4.4, 0.05), V(0.35, P1.position.y + 0.05, 0.05), 0.012, cable);
  bar(swing, V(0.35, P1.position.y + 0.16, 0.05), V(REACH, TIPY + 0.41, 0.05), 0.012, cable);
  // Bout du câble tiré à la main (sortie au bas du mât) : poignée qui descend
  const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), cable);
  swing.add(pull);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), red);
  swing.add(handle);

  // Câble vertical et charge
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), cable);
  swing.add(cord);
  const load = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), red);
  swing.add(load);

  let T = 0, L = 0, theta = 0.7, phi = 1.15, dist = 15;
  const target = V(0.6, 3, 0);

  function pose() {
    swing.rotation.y = -T; // 1 rad de rotation = arc de 2,27 m (22,7 cm sur la maquette)
    const top = TIPY + 0.25;
    const center = 0.4 + L * 4;   // 4 m de levage = 40 cm sur la maquette
    load.position.set(REACH, center, 0.05);
    cord.scale.y = top - (center + 0.28);
    cord.position.set(REACH, (top + center + 0.28) / 2, 0.05);
    // poignée : illustration de la traction à la main (la course est symbolique)
    const hy = 1.7 - L * 0.9;
    pull.position.set(0.6, (4.0 + hy) / 2 - 0.1, 0.05);
    pull.scale.y = 4.0 - hy - 0.2;
    handle.position.set(0.6, hy - 0.1, 0.05);
    oT.textContent = Math.round(T * 57.3) + '° (arc ' + (T * REACH * 10).toFixed(1) + ' cm)';
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
    dist = w < 500 ? 21 : 15;
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
})();