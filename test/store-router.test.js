const server = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');

const should = chai.should();

chai.use(chaiHttp);

describe('/GET stores', () => {
  it('it should GET all the stores', (done) => {
    chai
      .request(server)
      .get('/api/v1/stores')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
  });
});
