UdeS Node Orchestrator
======================

![Node](https://img.shields.io/badge/node-6.10.1-brightgreen.svg)

# Introduction
This node server acts as an API to simplify calls made to a server that has a
compliated infrastructure.

# Prerequisites
* [Node](https://nodejs.org) 6.10.1 (it is recommended to install it via
[NVM](https://github.com/creationix/nvm))
* Ensure you have a development environment setup to use the orchestrator.
Since it uses a socket you cannot run it on a local machine.

# Getting started
## Setup development machine
1. `git clone git@github.com:UdeS-STI/udes-node-orchestrator`
2. `cd udes-node-orchestrator`
3. `npm install`

# Usage
* Start app
  * `npm start`
* Run eslint
  * `npm run lint`
* Run unit tests
  * `npm run test`
* Run code coverage
  * `npm run coverage`
* Build library for distribution
  * `npm run build`
* Generate documentation for public API
  * `npm run documentation`

# Documentation
[JSDocs documentation](http://UdeS-STI.github.io/udes-node-orchestrator)
No documentation is available at the moment.

# Example
A minimalist usage example is available in `/boilerplate`

# Contributing
You must use the following guides:
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

This project contains a linting config, you should setup `eslint` into your
editors with `.eslintrc`.
