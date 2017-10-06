UdeS Node Orchestrator
======================

![Node](https://img.shields.io/badge/node-6.10.1-brightgreen.svg)

# Introduction
This node server acts as an API to simplify calls made to a server that has a
compliated infrastructure.

# Prerequisites
* [Node](https://nodejs.org) 6.10.1 (it is recommended to install it via
[NVM](https://github.com/creationix/nvm))
* [Yarn](https://yarnpkg.com)
* Ensure you have a development environment setup to use the orchestrator.
Since it uses a socket you cannot run it on a local machine.

# Getting started
## Setup development machine
1. `git clone git@github.com:UdeS-STI/udes-node-orchestrator`
2. `cd udes-node-orchestrator`
3. `yarn`

# Usage
* Start app
  * `yarn start`
* Run eslint
  * `yarn run lint`
* Run unit tests
  * `yarn run test`
* Run code coverage
  * `yarn run coverage`
* Build library for distribution
  * `yarn run build`
* Generate documentation for public API
  * `yarn run documentation`

# Documentation
[JSDocs documentation](http://UdeS-STI.github.io/udes-node-orchestrator)

# Example
A minimalist usage example is available in `/boilerplate`

# Contributing
You must use the following guides:
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

This project contains a linting config, you should setup `eslint` into your
editors with `.eslintrc`.
