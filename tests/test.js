/*global chai, describe, it*/
var expect = chai.expect;

describe("Forrm", function() {
  describe("constructor", function() {
    it("should return array of forrm objects 1 long", function() {
      var form = Forrm.init('.test-form');
      expect(form.length).to.equal(1);
    });
  });
  //options passed and forrm settings
  //groups
  //validationList
  //

});
