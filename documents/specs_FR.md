# Spécifications

Le fichier `tree.json` contient une liste de personnes au format JSON.
Les personnes sont représentée par un objet avec les attributs suivants:

| Nom       | Type            | Description                                                       |
| --------- | --------------- | ----------------------------------------------------------------- |
| `id`      | Entier          | Seul attribut OBLIGATOIRE. Numéro UNIQUE identifiant la personne. |
| `first`   | Texte           | Prénom.                                                           |
| `middle`  | Liste de texte  | Liste de prénoms additionels (deuxième et troisième).             |
| `last`    | Texte           | Nom de famille.                                                   |
| `sex`     | Entier          | Sexe. `1=Homme, 2=Femme, 3=Autre`.                                |
| `dob`     | Texte           | Date de naissance au format `AAAA/MM/JJ`.                         |
| `pob`     | Texte           | Lieu de naissance.                                                |
| `dod`     | Texte           | Date de décès au format `AAAA/MM/JJ`.                             |
| `pod`     | Texte           | Lieu de décès.                                                    |
| `parents` | Liste d'entiers | Liste avec les identifiants des parents.                          |
| `spouses` | Liste d'entiers | Liste avec les identifiants de conjoints.                         |