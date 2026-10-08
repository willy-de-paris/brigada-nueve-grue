# La Brigada Nueve : Grue manuelle (maquette 1:10)

Site de présentation de notre projet de la **semaine d'intégration** : concevoir une grue capable de lever **300 kg** sur **4 m** et de les déplacer sur un rayon de **3 m**, uniquement à la force humaine, validée par une maquette à l'échelle **1:10** (40 cm de levage, 30 cm de déplacement horizontal).

**Site en ligne :** https://willy-de-paris.github.io/brigada-nueve-grue/

## Contenu du site

- Contexte, problématique, contraintes, objectifs, livrables et plan d'action
- Matériel disponible pour la maquette
- Analyse des trois conceptions : portique à chariot, grue à flèche relevable, chèvre à parallélogramme
- Tableau comparatif
- Solution retenue : **grue pivotante à flèche inclinée, fil de fer vers la base et treuil à manivelle**
- Maquette 3D interactive (rotation du mât, levage, démo animée)
- Boucle 2 : dimensionnement, réduction des charges, instructions de montage, nomenclature, liaisons, essais
- Calculateur d'effort
- Suite du projet et historique des actions

## Solution retenue

Un mât vertical pivotant, guidé par deux plaques et un pivot central, porte une flèche de 15 cm inclinée de 25° côté charge et un petit bras horizontal de 12 cm de l'autre côté. Un fil de fer relie le bout du petit bras à la base et équilibre le moment de la charge. Le levage se fait par un treuil à tambour avec manivelle démultipliée, et le mouvement horizontal par rotation du mât.

Chaîne cinématique : manivelle → train d'engrenages → tambour → ficelle → poulie de renvoi → poulie en bout de flèche → charge.

Point d'attention : la portée de la maquette est de 15 × cos 25° ≈ 13,6 cm, pour 30 cm visés.

## Structure du dépôt

```
index.html        page principale
style.css         mise en forme (responsive)
script.js         menu mobile, onglets, calculateur
crane3d.js        maquette 3D (Three.js)
images/           schémas cinématiques (grue et portique) et dimensionnement
Projet_grue_Brigada_Nueve.docx   document Word complet
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