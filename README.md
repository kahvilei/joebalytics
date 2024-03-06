Notion board tracking my progress [here](https://kathrynhuff.notion.site/Summoner-Cloud-0d2b2deb5f824162aa518b8902e3dee2)

Note: the source above includes all needed files to run the app aside from .env and app.yaml for deployment to google cloud.

If you plan to run this yourself, you will need to create a .env file at the root level with the following variables:
```bash
# .env
RIOT_KEY=
JWT_SECRET=
MONGO_CONNECT=
PORT="3000"
```
You will need your own mongo atlas account and a riot games api key.

The app.yaml file is structured as follows:
```yaml
runtime: nodejs14
env_variables:
    RIOT_KEY: "your_riot_key"
    JWT_SECRET: "your_jwt"
    MONGO_CONNECT: "your_mongo_connect"
    ROOT: ""

handlers:
- url: /static
  static_dir: build/static
```

[Live version here](https://summon-cloud.uc.r.appspot.com/)