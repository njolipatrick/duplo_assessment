# You need

- NPM
- Node.js
- NestJS
- Docker
- Postgres
- Mongodb

# Start Commands for docker-compose file

## Docker

Builds, (re)creates, starts, and attaches to containers for a service.  
`sudo docker compose up`

## Locally

create a postgres datase and provide it in the env as
`npm run prisma:migrate:postgres && npm run prisma:migrate:mongodb && npm run start:dev`

# Postman Documentation
`https://documenter.getpostman.com/view/24152341/2sAY4x9Ly9`