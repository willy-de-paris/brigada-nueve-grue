# La Brigada Nueve : Grue manuelle (maquette 1:10)

Site de présentation de notre projet de la **semaine d'intégration** : concevoir une grue capable de lever **300 kg** sur **4 m** et de les déplacer sur **3 m**, uniquement à la force humaine, validée par une maquette à l'échelle **1:10** (40 cm de levage, 30 cm de translation).

**Site en ligne :** https://willy-de-paris.github.io/brigada-nueve-grue/

## Contenu du site

- Contexte, problématique, contraintes, objectifs, livrables et plan d'action
- Matériel disponible pour la maquette
- Analyse des trois conceptions : portique à chariot, grue pivotante, chèvre à parallélogramme
- Tableau comparatif
- Solution retenue : **portique à chariot** avec treuil manuel et poulies
- Maquette 3D interactive (rotation, chariot, levage, démo animée)
- Calculateur d'effort
- Suite du projet

## Solution retenue

Chaîne cinématique : manivelle → train d'engrenages → tambour → ficelle → poulie(s) → charge.

Le chariot assure la translation horizontale, le treuil démultiplié assure le levage. La structure est stable sans contrepoids important, démontable et utilisable par une seule personne.

Exemple de dimensionnement : avec un rapport de réduction de 1/60, l'effort pour 300 kg est d'environ 300 × 9,81 / 60 ≈ 49 N (5 kg).

## Structure du dépôt

```
index.html        page principale
style.css         mise en forme (responsive)
script.js         menu mobile, onglets, calculateur
crane3d.js        maquette 3D (Three.js)
images/           schéma cinématique et dimensionnement
```

## Technologies

HTML, CSS et JavaScript. La maquette 3D utilise [Three.js](https://threejs.org/) (r128), chargé depuis cdnjs : une connexion internet est nécessaire pour l'afficher.

## Lancer le site en local

Ouvre simplement `index.html` dans un navigateur, ou lance un petit serveur :

```bash
python3 -m http.server 8000
```

puis va sur http://localhost:8000.

## Équipe

La Brigada Nueve : Rezan, Amed, Victoria et les autres membres du groupe *(à compléter)*.