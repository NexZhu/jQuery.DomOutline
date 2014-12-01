$(function () {
    var myExampleClickHandler = function (element) {
        console.log('Clicked element:', element);
    }
    var myDomOutline = new DomOutline({
        onClick: myExampleClickHandler
    });

    // Start outline:
    myDomOutline.start();

    // Stop outline (also stopped on escape/backspace/delete keys):
    //myDomOutline.stop();

    $('#start').click(function () {
        myDomOutline.start();
        return false;
    })

    $('#stop').click(function () {
        myDomOutline.stop();
        return false;
    })
});