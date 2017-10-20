UdeS Node Orchestrator
======================

[![CircleCI](https://circleci.com/gh/UdeS-STI/udes-node-orchestrator/tree/master.svg?style=svg&circle-token=2bf1290ed52937519d0b7e67dccd4ad10a002a74)](https://circleci.com/gh/UdeS-STI/udes-node-orchestrator/tree/master)
[![npm](https://img.shields.io/npm/v/udes-node-orchestrator.svg?style=flat-square)](https://www.npmjs.com/package/udes-node-orchestrator)
![Node](https://img.shields.io/badge/node-6.10.1-brightgreen.svg)

# Introduction
This node server acts as an API to simplify calls made to a server that has a
complicated infrastructure.

# Prerequisites
* [Node](https://nodejs.org) 6.10.1 (it is recommended to install it via
[NVM](https://github.com/creationix/nvm))
* Ensure you have a development environment setup to use the orchestrator.
Since it uses a socket you cannot run it on a local machine.

# Getting started
## Setup development machine
1. `git clone https://github.com/UdeS-STI/udes-node-orchestrator.git`
2. `cd udes-node-orchestrator`
3. `npm install`

# Usage
## Scripts
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

## API
```javascript
import Orchestrator, { ResponseHelper } from 'udes-node-orchestrator'
import config from './config'

const getPostInfo = async (req, res) => {
  const responseHelper = new ResponseHelper(req, res, config)
  const { post } = responseHelper.getQueryParameters()
  const options = {
    method: 'GET',
    url: `${config.apiUrl}/posts/${post}`,
  }

  try {
    const data = await responseHelper.fetch(options)
    // Send response data back to user.
    responseHelper.handleResponse({ data })
  } catch (err) {
    // Send error back to user.
    responseHelper.handleError(err)
  }
}

// Instantiate an orchestrator with your server configuration.
const orchestrator = new Orchestrator(config)

// Set routes with an array of objects containing route info.
orchestrator.setRoutes([
  { method: 'GET', url: '/post*', fn: getPostInfo },
])

// Your server is now up and running, listening on set routes.
```

## Logging
The logging system uses [Pino](https://www.npmjs.com/package/pino). Log levels used are:
* `error` to display only errors;
* `warn` to display errors and warnings;
* `info` to display all above and request information;
* `debug` to display all above and response information;
* `trace` to display all logs;
* `silent` to disable logs;
* NOTE: `fatal` is not used as it exits node process;

# Documentation
[JSDocs documentation](http://UdeS-STI.github.io/udes-node-orchestrator)

# Example
A minimalist usage example is available in `/boilerplate`

# Contributing
You must use the following guides:
* [UdeS JavaScript Style Guide](https://www.npmjs.com/package/eslint-config-udes)
* [StandardJS](https://standardjs.com/)
* [JSdoc](http://usejsdoc.org/)

This project contains a linting config, you should setup `eslint` into your
editors with `.eslintrc.js`.
