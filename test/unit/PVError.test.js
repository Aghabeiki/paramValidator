const should=require('should');
describe("Module Export", () => {
    it('should check PVerror interface is exported correctly', () => {
        require('../../ParamValidator').PVError.should.be.eql(require('../../lib/Error/PVError'))
    })
})