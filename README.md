# ChatX
[![Build Status](https://travis-ci.org/foliea/chatx.svg?branch=master)](https://travis-ci.org/foliea/chatx)

A simple web chat application with [Express.js](https://expressjs.com/) and
[socket.io](http://socket.io/).

## Prerequisites

You need [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed
on your machine to run this project.

## Installation

    npm install

## Usage

To launch the web application:

    npm start

The web application should now be available at the following url:

    http://localhost:3000

## Tests

To run the test suite:

    npm test

## Docker

Alternatively you can get a preconfigured environment to run the above commands if
you have [Docker](http://docker.com) installed on your machine.

To get this environment:

    docker run -ti -p 3000:3000 -v $PWD:/app node /bin/bash

Then to get into the application directoy, run:

    cd /app

## Author

**Adrien Folie**

* http://twitter.com/folieadrien
* http://github.com/foliea

## Licensing

chatX is licensed under the MIT License. See [LICENSE](LICENSE) for
full license text.
