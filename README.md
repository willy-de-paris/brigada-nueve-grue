# La Brigada Nueve : Grue manuelle (maquette 1:10)

Site de présentation de notre projet de la **semaine d'intégration** : concevoir une grue capable de lever **300 kg** sur **4 m** et de les déplacer sur un rayon de **3 m**, uniquement à la force humaine, validée par une maquette à l'échelle **1:10** (40 cm de levage, 30 cm de déplacement horizontal).

**Site en ligne :** https://willy-de-paris.github.io/brigada-nueve-grue/

## Contenu du site

- Contexte, problématique, contraintes, objectifs, livrables et plan d'action
- Matériel disponible pour la maquette
- Analyse des trois conceptions : portique à chariot, grue à flèche relevable, chèvre à parallélogramme
- Tableau comparatif
- Solution retenue : **grue à flèche relevable avec treuil à manivelle**
- Maquette 3D interactive (rotation du mât, levage, démo animée)
- Calculateur d'effort
- Suite du projet et historique des actions

## Solution retenue

Un mât vertical pivotant porte une flèche articulée, maintenue par un vérin ou un tirant. Le levage se fait par un treuil à tambour avec manivelle démultipliée, et le mouvement horizontal par rotation du mât (rayon 3 m). La base est lestée ou ancrée.

Chaîne cinématique : manivelle → train d'engrenages → tambour → ficelle → poulie en bout de flèche → charge.

Point de vigilance : le moment de renversement, environ 300 × 9,81 × 3 ≈ 8 800 N·m pour la charge seule.

## Structure du dépôt

```
index.html        page principale
style.css         mise en forme (responsive)
script.js         menu mobile, onglets, calculateur
crane3d.js        maquette 3D (Three.js)
images/           schémas cinématiques et dimensionnement
```

## Technologies

HTML, CSS et JavaScript. La maquette 3D utilise [Three.js](https://threejs.org/) (r128), chargé depuis cdnjs : une connexion internet est nécessaire pour l'afficher.

## Lancer le site en local

Ouvre `index.html` dans un navigateur, ou lance un petit serveur :

```bash
python3 -m http.server 8000
```

puis va sur http://localhost:8000.

## Équipe

La Brigada Nueve : Rezan, Amed, Victoria et les autres membres du groupe *(à compléter)*.