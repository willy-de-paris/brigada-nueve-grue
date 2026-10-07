/**
 * Maquette 3D interactive d'une grue à flèche relevable
 * Utilise la bibliothèque Three.js pour le rendu WebGL
 * 
 * Fonctionnalités :
 * - Rotation de la caméra à la souris/tactile
 * - Contrôle de la rotation du mât via curseur
 * - Contrôle du levage via curseur
 * - Démo animée automatique
 */

(function () {
  // Fonction principale d'initialisation de la scène 3D
  function init() {
    // Récupération du conteneur HTML pour la scène 3D
    const box = document.getElementById('crane3d');
    if (!box) {
      console.error('Conteneur #crane3d non trouvé dans le DOM');
      return;
    }
    
    // Vérification que Three.js est chargé
    if (typeof THREE === 'undefined') {
      box.innerHTML = '<p style="padding:1rem">La 3D nécessite une connexion internet (Three.js).</p>';
      return;
    }

    // === Création de la scène Three.js ===
    const scene = new THREE.Scene();
    
    // Configuration de la caméra (FOV, ratio, plan proche, plan lointain)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    
    // Configuration du renderer WebGL avec antialiasing et fond transparent
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // Optimisation pour écrans haute densité
    box.appendChild(renderer.domElement);

    // === Éclairage de la scène ===
    // Lumière hémisphérique (lumière ambiante + lumière directionnelle depuis le haut)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
    
    // Lumière directionnelle principale (simule le soleil)
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(4, 8, 5);
    scene.add(sun);

    // === Matériaux pour les différents éléments ===
    const cardboard = new THREE.MeshLambertMaterial({ color: 0xc79a5b }); // Carton (marron)
    const blue = new THREE.MeshLambertMaterial({ color: 0x12304f });      // Bleu foncé (métal/structure)
    const red = new THREE.MeshLambertMaterial({ color: 0xc0392b });       // Rouge (pièces mobiles)
    const grey = new THREE.MeshLambertMaterial({ color: 0x55606c });      // Gris (lest/tirant)
    const rope = new THREE.MeshLambertMaterial({ color: 0xe8dcc0 });       // Corde (beige clair)

    // Grille de référence au sol
    scene.add(new THREE.GridHelper(10, 20, 0x12304f, 0xb8c4d0));

    // === Fonctions utilitaires pour créer des formes 3D ===
    
    // Ajoute un mesh à un parent et retourne le mesh
    function add(parent, m) { parent.add(m); return m; }
    
    // Crée un bloc (parallélépipède rectangle)
    function block(parent, w, h, d, mat, x, y, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      return add(parent, m);
    }
    
    // Crée un cylindre (barre) entre deux points
    function bar(parent, a, b, r, mat) {
      const d = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      return add(parent, m);
    }
    
    // Raccourci pour créer un vecteur 3D
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    // === Construction de la grue ===
    
    // Base lestée (fixe au sol)
    block(scene, 2.6, 0.14, 2.6, cardboard, 0, 0.07, 0); // Base en carton
    block(scene, 2.7, 0.04, 2.7, blue, 0, 0.01, 0);      // Bordure bleue

    // Partie tournante : mât, flèche, tirant, treuil, lest, poulie
    // Tout est regroupé dans un "Group" qui peut tourner
    const swing = new THREE.Group();
    scene.add(swing);

    // Dimensions de la grue
    const MAST = 6.2;    // Hauteur du mât
    const REACH = 3;     // Portée horizontale
    const TIP = 5.4;     // Hauteur de l'extrémité de la flèche

    // Mât vertical (cylindre)
    const mastMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, MAST, 16), cardboard);
    mastMesh.position.set(0, 0.14 + MAST / 2, 0);
    add(swing, mastMesh);
    
    // Pivot au sol (sphère bleue)
    const pivotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), blue);
    pivotMesh.position.set(0, 0.14, 0);
    add(swing, pivotMesh);
    
    // Articulation de la flèche (sphère rouge)
    const jointMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), red);
    jointMesh.position.set(0, 4.4, 0);
    add(swing, jointMesh);

    // Flèche (barre en carton)
    bar(swing, V(0, 4.4, 0), V(REACH, TIP, 0), 0.07, cardboard);
    
    // Tirant (câble de soutien de la flèche)
    bar(swing, V(0, MAST + 0.1, 0), V(REACH, TIP, 0), 0.025, grey);
    
    // Renfort au sommet du mât
    block(swing, 0.3, 0.06, 0.3, blue, 0, MAST + 0.12, 0);

    // Poulie en bout de flèche (cylindre rouge)
    const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 20), red);
    pulley.position.set(REACH, TIP - 0.05, 0);
    pulley.rotation.x = Math.PI / 2; // Rotation pour orienter la poulie
    add(swing, pulley);

    // Lest (contrepoids) du côté opposé à la flèche
    block(swing, 0.8, 0.5, 0.8, grey, -0.9, 0.4, 0);

    // === Treuil sur le mât ===
    // Tambour (cylindre bleu)
    const drum = add(swing, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 20), blue));
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0.45, 1.3, 0);
    
    // Manivelle (groupe avec bras et poignée)
    const crank = new THREE.Group();
    crank.position.set(0.45, 1.3, 0.38);
    block(crank, 0.5, 0.05, 0.05, red, 0.25, 0, 0); // Bras de la manivelle
    const handle = add(crank, new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), red));
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0.5, 0, 0.1); // Poignée
    swing.add(crank);

    // === Ficelles ===
    // Ficelle fixe : treuil -> haut du mât -> le long de la flèche
    bar(swing, V(0.45, 1.5, 0.05), V(0.3, 4.45, 0.12), 0.012, rope);
    bar(swing, V(0.3, 4.45, 0.12), V(REACH, TIP + 0.1, 0.06), 0.012, rope);

    // Ficelle verticale et charge (longueur variable)
    const cord = add(swing, new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), rope));
    const load = block(swing, 0.5, 0.5, 0.5, red, REACH, 0.3, 0);

    // === Variables d'animation et de contrôle ===
    let T = 0, L = 0;           // T = rotation du mât, L = levage
    let theta = 0.7, phi = 1.15; // Angles de la caméra (sphérique)
    let dist = 14;              // Distance de la caméra
    const target = V(0, 2.8, 0); // Point visé par la caméra

    // === Fonction de mise à jour de la pose ===
    function pose() {
      // Rotation du mât (1 radian ≈ 57.3° = arc de 3 m sur la maquette)
      swing.rotation.y = -T * 1;
      
      // Calcul de la position de la charge
      const top = TIP - 0.2;
      const loadTop = 0.55 + L * 4;
      load.position.set(REACH, loadTop - 0.25, 0);
      
      // Ajustement de la longueur de la corde
      cord.scale.y = top - loadTop;
      cord.position.set(REACH, (top + loadTop) / 2, 0);
      
      // Rotation du treuil (visuelle)
      crank.rotation.z = -L * 12;
      drum.rotation.y = -L * 12;
      
      // Mise à jour des affichages
      oT.textContent = Math.round(T * 57.3) + '° (arc ' + Math.round(T * 30) + ' cm)';
      oL.textContent = Math.round(L * 40) + ' cm';
    }

    // === Fonction de positionnement de la caméra ===
    function cam() {
      camera.position.set(
        target.x + dist * Math.sin(phi) * Math.sin(theta),
        target.y + dist * Math.cos(phi),
        target.z + dist * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    }

    // === Gestion du redimensionnement ===
    function resize() {
      const w = box.clientWidth, h = box.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dist = w < 500 ? 19 : 14; // Distance adaptée à la taille d'écran
      cam();
    }
    addEventListener('resize', resize);

    // === Contrôle de la caméra à la souris/tactile ===
    let drag = false, lx = 0, ly = 0;
    box.addEventListener('pointerdown', e => { 
      drag = true; 
      lx = e.clientX; 
      ly = e.clientY; 
      box.setPointerCapture(e.pointerId); 
    });
    box.addEventListener('pointerup', () => (drag = false));
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      theta -= (e.clientX - lx) * 0.008;
      phi = Math.min(1.5, Math.max(0.3, phi - (e.clientY - ly) * 0.008));
      lx = e.clientX; ly = e.clientY;
      cam();
    });

    // === Liaison avec les contrôles HTML ===
    const sT = document.getElementById('sT'), sL = document.getElementById('sL');
    const oT = document.getElementById('oT'), oL = document.getElementById('oL');
    const demo = document.getElementById('demo');
    
    // État de la démo animée
    let playing = false, t0 = 0;
    
    // Écouteurs sur les curseurs
    sT.addEventListener('input', () => { T = +sT.value; pose(); });
    sL.addEventListener('input', () => { L = +sL.value; pose(); });
    
    // Bouton de démo
    demo.addEventListener('click', () => {
      playing = !playing;
      t0 = performance.now();
      demo.textContent = playing ? 'Arrêter la démo' : 'Lancer la démo';
    });

    // === Optimisation : ne dessiner que si visible ===
    let visible = true;
    new IntersectionObserver(en => (visible = en[0].isIntersecting)).observe(box);

    // === Boucle d'animation principale ===
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return; // Pause si non visible
      
      if (playing) {
        // Cycle d'animation : lever, tourner le mât, descendre, revenir
        const c = ((now - t0) / 1000 % 12) / 12; // Cycle de 12 secondes
        const ease = v => v * v * (3 - 2 * v); // Fonction d'easing smoothstep
        const seg = (a, b) => ease(Math.min(1, Math.max(0, (c - a) / (b - a))));
        
        L = seg(0, 0.25) - seg(0.5, 0.75); // Levage
        T = seg(0.25, 0.5) - seg(0.75, 1);   // Rotation
        sL.value = L; sT.value = T;
        pose();
      }
      
      renderer.render(scene, camera);
    }

    // === Démarrage ===
    resize();
    pose();
    requestAnimationFrame(loop);
  }

  // === Gestion du chargement ===
  // Attend que le DOM soit prêt ET que Three.js soit chargé
  function checkAndInit() {
    if (document.readyState !== 'loading' && typeof THREE !== 'undefined') {
      init();
    }
  }

  // Essayer d'initialiser au chargement du DOM
  document.addEventListener('DOMContentLoaded', checkAndInit);
  // Fallback : réessayer au chargement complet de la page
  window.addEventListener('load', checkAndInit);
})();