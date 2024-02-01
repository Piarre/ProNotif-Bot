# ProNotif

# PREVENTION | ONLY IN FRENCH 🇫🇷

## Comment sa marche
Alors, pour récupérer devoirs, messages, et emploie de temps je passe par le serveur, [justtryon/papillonserver](https://github.com/PapillonApp/papillon-python), c'est fait par la team [@PapillonApp](https://github.com/PapillonApp), et les calls API se passent comme ça:
- Au démarage de l'app, je genère un token et je récupère: `messages` dans `$PWD/pronote/news.json`, l'emploie du temps dans `$PWD/pronote/timetable.json`.
- Ensuite, toutes les 15 minutes je re génère un token Pronote et je les re reécupère, c'est à ce moment là que je compare les différentes données que je récupère [(dans se fichier)](https://github.com/Piarre/ProNotif-Bot/blob/main/src/utils/pronote.ts), du coup s'il quelque chose à changer j'envoie un message, le message Pronote arrive même avant que Pronote envoie la notification sur l'App mobile.

## Utilisation

### 🐳 Docker

Voir le `docker-compose.dev.yml` et modifie les variable:

#### Partie Pronote
- PRONOTE_API_URL: L'URL du serveur pour l'API Pronote, ici j'utilise [justtryon/papillonserver](https://github.com/PapillonApp/papillon-python), donc l'URL ou le nom de votre container Docker (Si sa run dans le même network)
- PRONOTE_USERNAME= Votre nom d'utilisateur Pronote (Pour se connecter à votre compte et pouvoir faire des calls API)
- PRONOTE_PASSWORD= Mot de passe Pronote
- PRONOTE_URL= URL de votre URL Pronote exemple: `https://demo.index-education.net/pronote/eleve.html`

#### Partie Discord
- TOKEN= Bot de votre Token à créer [ici](https://discord.com/developers/applications).
- CHANNEL_WEBHOOK_URL_HOMEWORKS= L'URL de WebHook Discord pour recevoir les devoirs.
- CHANNEL_WEBHOOK_URL_NEWS= L'URL de WebHook Discord pour recevoir les nouveaux messages.
- CHANNEL_WEBHOOK_URL_TIMETABLE= **`[BETA]`** L'URL de WebHook Discord pour recevoir les voir les changements dans l'emploie du temp.
- PRONOTE_SCHOOL_THUMBNAIL_URL= L'URL de l'image en haut à droite sur Pronote, elle sera sur chaque embed.
