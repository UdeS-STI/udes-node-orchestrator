UdeS Node Orchestrator Boilerplate
==================================
![Node](https://img.shields.io/badge/node-6.10.1-brightgreen.svg)

## Introduction
This is a boilerplate for instantiating an orchestrator using the
`udes-node-orchestrator` library. It has a very minimalistic example.

## Prerequisites
* [Node](https://nodejs.org) 6.10.1 (it is recommended to install it via
[NVM](https://github.com/creationix/nvm))
* Ensure you have a development environment setup to use the orchestrator.
Since it uses a socket you cannot run it on a local machine.

## Getting started
### Setup development machine
1. `git clone git@github.com:UdeS-STI/udes-node-orchestrator`
2. `cd udes-node-orchestrator/boilerplate`
3. `npm install`
4. Update information in `config.js` to match used server configuration.

## Usage
* Start app
  * `npm start`
* Run eslint
  * `npm run lint`
