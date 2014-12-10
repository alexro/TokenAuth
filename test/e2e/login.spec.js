describe('Login', function () {

    var ptor;

    beforeEach(function () {
        browser.get('http://127.0.0.1:8080/');
        ptor = protractor.getInstance();
    });

    it('should load the login page', function() {
        var el = by.id('username');
        expect(ptor.isElementPresent(el)).toBe(true);
    });

    it('navigate to main on submit', function() {
        ptor.findElement(protractor.By.id('username')).sendKeys('admin');
        ptor.findElement(protractor.By.id('password')).sendKeys('password');

        var elem = ptor.findElement(protractor.By.id('submit'));
        elem.click().then(
            expect(ptor.getCurrentUrl()).toMatch(/\//)
        );
    });
});