const should=require('should');
describe("Module Export", () => {
    it('should check PVerror interface is exported correctly', () => {
        require('../../lib/paramValidator/index').PVError.should.be.eql(require('../../lib/Error/PVError'))
    })
})