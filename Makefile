# make fe          # build + start fe
# make fe-no-deps  # build + start fe only, no rebuild deps
# make up           # start all services
# make down         # stop all
# make logs         # follow fe logs
# make ps           # show running containers

ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
COMPOSE = docker compose -f $(ROOT_DIR)ci/docker-compose.yml --env-file $(ROOT_DIR).env

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

build:
	$(COMPOSE) up -d --build

fe:
	$(COMPOSE) up -d --build fe

fe-no-deps:
	$(COMPOSE) up -d --build --no-deps fe

logs:
	$(COMPOSE) logs -f fe

ps:
	$(COMPOSE) ps
