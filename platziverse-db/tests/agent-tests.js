'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const agentFixtures = require('./fixtures/agent');

let config = {
  logging: function () {}
};

let MetricStub = {
  belongsTo: sinon.spy()
};

let single = Object.assign({}, agentFixtures.single);
let id = 1;
let uuid = 'yyy-yyy-yyy';
let AgentStub = null;
let db = null;
let sandbox = null;


let uuidArgs = {
    where: {
        uuid
    }
};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy()
  };


    // Model findOne Stub
    AgentStub.findOne = sandbox.stub();
    AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)));


    // Model findById Stub
    AgentStub.findById = sandbox.stub();
    AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)));


    // Model update Stub
    AgentStub.update = sandbox.stub();
    AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));


  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  });

  db = await setupDatabase(config)
});

test.afterEach(() => {
  sandbox && sandbox.restore()
});

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exits')
});

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the Metric Model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the Agent model')
});

// Test
test.serial('Agent#findById', async t => {

    let agent = await db.Agent.findById(id);
    t.true(AgentStub.findById.called, 'findById should be called on model');
    t.true(AgentStub.findById.calledOnce, 'findById should be called once');
    t.true(AgentStub.findById.calledWith(id), 'findById should be called with id');

    t.deepEqual(agent, agentFixtures.byId(id), 'should be the same');
});


test.serial('Agent#createOrUpdate - exists', async t => {

    let agent = await db.Agent.createOrUpdate(single);

    t.true(AgentStub.findOne.called, 'findOne fue llamado.');
    t.true(AgentStub.findOne.calledTwice, 'finOne fue llamado 2 veces');
    t.true(AgentStub.update.calledOnce, 'update fue llamado una sola vez.');

    t.deepEqual(agent, single, 'Agent should be the same');
});