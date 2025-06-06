# Infos concernant le projet

## Objectif

Transformer la macro Excell en application Web.

## Cahier des charges

### Ce qui est fait

-   PHP: récuppération des données de l'API Hubeau + stockage dans la base
-   PHP: récupération des données de la base pour l'affichage
-   PHP: ajout/suppression d'une configuration
-   PHP: calcul des débits moyens de J0 à J-8.
-   React: affichage des graphiques des débit (normaux + moyen).
-   React: récuppération + affichage du résultat de SilvRPeak
-   React: export du rapport sous format Excell.
-   Python: le script permettant l'envoie des données à l'automate.

### Ce qu'il reste à faire

-   PHP: stockage dans la base des données utilisées pour le rapport.
-   Python: la fonction qui va envoyer les informations à l'automate avec l'outil Snap7.

```python
import snap7
from snap7.util import *
import struct

plc = snap7.client.Client()
plc.connect("192.168.51.104",0,2)

def flip():
    tab = plc.db_read(109,0,6) # Il y a 26 octets en tout
    arrReducDemain = ((tab[0] & 0x01)!=0)
    print(str(arrReducDemain))

    snap7.util.set_bool(tab, 0, 0, not(arrReducDemain))
    plc.db_write(108, 0, tab)
    return 0;

flip()
```

Cette fonction est à mettre dans la partie des fonctions métiers dans le code python « script.py ».

-   React: Frontend à améliorer pour faire évoluer l'expérience utilisateur.
-   React: élaboration automatique du rapport.
