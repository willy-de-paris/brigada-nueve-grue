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

  const cardboard = new THREE.MeshLambertMaterial({ color: 0xc79a5b });
  const blue = new THREE.MeshLambertMaterial({ color: 0x12304f });
  const red = new THREE.MeshLambertMaterial({ color: 0xc0392b });
  const grey = new THREE.MeshLambertMaterial({ color: 0x55606c });
  const sand = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
  const green = new THREE.MeshLambertMaterial({ color: 0x1a9e5c });
  const rope = new THREE.MeshLambertMaterial({ color: 0xe8dcc0 });

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
  const MAST = 6.2;      // hauteur du mât (62 cm)
  const ARM = 1.5;       // flèche côté charge : 15 cm sur la maquette
  const ANG = 25 * Math.PI / 180; // inclinaison au-dessus de l'horizontale
  const REACH = ARM * Math.cos(ANG); // portée horizontale ≈ 1,36 m (13,6 cm)
  const RISE = ARM * Math.sin(ANG);  // hauteur gagnée ≈ 0,63 m
  const BACK = 1.2;      // bras côté contrepoids (12 cm)
  const armY = x => MAST + 0.1 + x * Math.tan(ANG); // hauteur de l'axe de la flèche
  const LOW = 1.0, HIGH = 3.6; // hauteur des deux plaques de guidage

  // Partie fixe : base, montants, deux plaques avec appuis plans, pivot central
  block(scene, 3, 0.14, 3, cardboard, 0, 0.07, 0);
  block(scene, 3.1, 0.04, 3.1, blue, 0, 0.01, 0);
  [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(p =>
    bar(scene, V(p[0], 0.14, p[1]), V(p[0], HIGH + 0.1, p[1]), 0.03, grey));
  [LOW, HIGH].forEach(y => {
    block(scene, 1.6, 0.06, 1.6, green, 0, y, 0);        // plaque
    block(scene, 1.6, 0.06, 1.6, cardboard, 0, y - 0.1, 0); // appui plan
  });
  const manchon = cyl(scene, 0.26, 0.26, 1.1, blue, 0, 2.3, 0); // pivot central
  manchon.material = new THREE.MeshLambertMaterial({ color: 0x12304f, transparent: true, opacity: 0.55 });

  // Partie tournante : mât, butées, bras, contrepoids, treuil, poulies
  const swing = new THREE.Group();
  scene.add(swing);

  cyl(swing, 0.12, 0.12, MAST, cardboard, 0, 0.14 + MAST / 2 - 0.07, 0);
  [LOW - 0.2, HIGH - 0.2].forEach(y => cyl(swing, 0.2, 0.2, 0.1, red, 0, y, 0)); // butées

  bar(swing, V(0, MAST + 0.1, 0), V(REACH, armY(REACH), 0), 0.11, cardboard);          // flèche inclinée
  bar(swing, V(0, MAST + 0.1, 0), V(-BACK, MAST + 0.1 - BACK * Math.tan(ANG), 0), 0.11, cardboard); // bras du contrepoids incliné
  cyl(swing, 0.07, 0.07, 0.3, red, -BACK, MAST + 0.1 - BACK * Math.tan(ANG), 0);  // attache du fil de fer à l'extrémité

  // Fil de fer du petit bras vers la base (ancré au milieu de l'arc de rotation)
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 6), grey);
  scene.add(wire);
  const aMid = -0.5;
  const anchor = V(-BACK * Math.cos(aMid), 0.14, BACK * Math.sin(aMid));
  block(scene, 0.25, 0.1, 0.25, red, anchor.x, 0.19, anchor.z);
  function setBar(m, a, b) {
    const d = new THREE.Vector3().subVectors(b, a);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.scale.y = d.length();
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  }

  // Poulies
  const P1 = cyl(swing, 0.16, 0.16, 0.07, red, 0.3, armY(0.3) + 0.25, 0);
  const P2 = cyl(swing, 0.16, 0.16, 0.07, red, REACH, armY(REACH) + 0.25, 0);
  P1.rotation.x = Math.PI / 2;
  P2.rotation.x = Math.PI / 2;

  // Treuil sur le mât (côté charge)
  block(swing, 0.9, 0.9, 0.1, grey, 0.5, 1.9, 0.0);
  const drum = cyl(swing, 0.2, 0.2, 0.5, blue, 0.45, 1.9, 0.3);
  drum.rotation.x = Math.PI / 2;
  const crank = new THREE.Group();
  crank.position.set(0.45, 1.9, 0.6);
  block(crank, 0.5, 0.05, 0.05, red, 0.25, 0, 0);
  const handle = cyl(crank, 0.04, 0.04, 0.2, red, 0.5, 0, 0.1);
  handle.rotation.x = Math.PI / 2;
  swing.add(crank);

  // Ficelle fixe : tambour -> haut du mât -> bout de bras
  bar(swing, V(0.3, 2.1, 0.3), V(0.3, armY(0.3) + 0.25, 0.12), 0.012, rope);
  bar(swing, V(0.3, armY(0.3) + 0.41, 0.12), V(REACH, armY(REACH) + 0.41, 0.12), 0.012, rope);

  // Ficelle verticale et charge
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), rope);
  swing.add(cord);
  const load = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), red);
  swing.add(load);

  let T = 0, L = 0, theta = 0.7, phi = 1.15, dist = 15;
  const target = V(0.8, 3, 0);

  function pose() {
    swing.rotation.y = -T; // 1 rad de rotation = arc de 1,36 m (13,6 cm sur la maquette)
    const top = armY(REACH) + 0.25;
    const loadTop = 0.9 + L * 4; // 4 m de levage
    load.position.set(REACH, loadTop - 0.28, 0.12);
    cord.scale.y = top - loadTop;
    cord.position.set(REACH, (top + loadTop) / 2, 0.12);
    const a = swing.rotation.y;
    const wireEnd = V(-BACK * Math.cos(a), MAST + 0.1 - BACK * Math.tan(ANG), BACK * Math.sin(a));
    setBar(wire, wireEnd, anchor);
    crank.rotation.z = -L * 12;
    drum.rotation.y = -L * 12;
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

  // Rotation de la vue à la souris / au doigt
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
})();