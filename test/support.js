'use strict';

let chai = require('chai'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);

global.chai   = chai;
global.expect = chai.expect;
global.sinon  = require('sinon');
