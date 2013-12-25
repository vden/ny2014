// script by Alexey Shulga
// https://github.com/Levsha128/hd44780

var canvas, ctx, background, characters;
var screenWidth = 20, screenHeight = 4;
var cursorX, cursorY;
var clientId = (new Date()).getTime();
var DDRAM = [];
var autoUpdate = 0, updateTimer;
$(document).ready(function () {
    if (isCanvasSupported()) {
        init();
    } else {
        alert('HTML5 Canvas is not supported, sorry.');
    }
    $('#update').click(function () {
        update();
    });
    $('#reset').click(function () {
        reset();
        draw();
    });

    update();
    updateTimer = setInterval(update, 3000);

    $('#autoupdate').click(function () {
        if (autoUpdate == 0) {
            autoUpdate = 1;
            $('#autoupdate').text('Auto update off');
            updateTimer = setInterval(update, 3000);
        } else {
            autoUpdate = 0;
            $('#autoupdate').text('Auto update on');
            window.clearInterval(updateTimer);
        }
    });
});
function update() {
    $.get('http://geeksnewyear.tk/messages/' + clientId + '-web/next', function (data) {
        reset();
        writeESQString(data);
        draw();
    });
}
function isCanvasSupported() {
    canvas = $('.hd44780_canvas')[0];
    return !!(canvas.getContext && canvas.getContext('2d'));
}

function init() {
    ctx = canvas.getContext('2d');
    background = $('.hd44780_background')[0];
    characters = $('.hd44780_characters')[0];
    DDRAM = new Array(screenWidth);
    for (var i = 0; i < screenWidth; i++) {
        DDRAM[i] = new Array(screenHeight);
    }
    reset();
    // writeESQString('Hello');
    draw();
}
function clear() {
    for (var j = 0; j < screenHeight; j++) {
        for (var i = 0; i < screenWidth; i++) {
            DDRAM[i][j] = 0;
        }
    }
}
function reset() {
    cursorX = 0;
    cursorY = 0;
    clear();
}

function draw() {
    drawBackground();
    drawCharacters();
}

function drawBackground() {
    ctx.drawImage(background, 0, 0);
}

function drawCharacters() {
    for (var j = 0; j < screenHeight; j++) {
        for (var i = 0; i < screenWidth; i++) {
            drawCharacter(DDRAM[i][j], i, j);
        }
    }
}

function drawCharacter(character, x, y) {
    var characterPosition = getCharacterPosition(character);
    var placeholderPosition = getPlaceholderPosition(x, y);

    ctx.drawImage(characters, characterPosition.x, characterPosition.y, 10, 16, placeholderPosition.x, placeholderPosition.y, 10, 16);
}

function getCharacterPosition(character) {
    var x = Math.floor(character / 16);
    var y = character % 16;
    return {x: 10 * x,
        y: 16 * y
    }
}

function getPlaceholderPosition(x, y) {
    return{x: 51 + x * 11, y: 58 + y * 17};
}

function convertUnicodeToKS0066(character) {
    var charIndex = 0;
    var englishCharactersAndSpecialSymbols = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[@]^_`abcdefghijklmnopqrstuvwxyz';
    var russianCharacters = 'АБВГДЕЁЭЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    var russianCharactersCodes = [0x41, 0xA0, 0x42, 0xA1, 0xE0, 0x45, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0x4B, 0xA7, 0x4D, 0x48, 0x4F, 0xA8, 0x50, 0x43, 0x54, 0xA9, 0xAA, 0x58, 0xE1, 0xAB, 0xAC, 0xE2, 0xC2, 0xAE, 0xC4, 0xAF, 0xB0, 0xB1, 0x61, 0xB2, 0xB3, 0xB4, 0xE3, 0x65, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xBB, 0xBC, 0xBD, 0x6F, 0xBE, 0x70, 0x63, 0xBF, 0x79, 0xE4, 0x78, 0xE5, 0xC0, 0xC1, 0xE6, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7];
    var t = englishCharactersAndSpecialSymbols.indexOf(character);
    if (t >= 0) {
        charIndex = 33 + t;
    } else {
        t = russianCharacters.indexOf(character);
        if (t >= 0) {
            charIndex = russianCharactersCodes[t];
        }
    }
    return charIndex;
}

function write(string) {
    for (var i in string) {
        DDRAM[cursorX][cursorY] = convertUnicodeToKS0066(string.charAt(i));
        cursorX++;
        if (cursorX >= screenWidth) {
            cursorX = 0;
            cursorY++;
            if (cursorY >= screenHeight) {
                cursorX = screenWidth - 1;
                cursorY = screenHeight - 1; //TODO
            }
        }
    }
}
function newLine() {
    cursorX = 0;
    cursorY++;
    if (cursorY >= screenHeight) {
        cursorY = screenHeight - 1;
    }
}

/*
 Some magic happens here.
 I will rewrite this code .. soon.
 */
function writeESQString(string) {
    var i = 0;
    while (i < string.length) {
        var b = string.charAt(i);
        if (b != '\\') {
            write(b);
        } else {
            i++;
            if (i >= string.length) break;
            b = string.charAt(i);
            switch (b) {
                case "r":   // \r
                    cursorX = 0;
                    break;
                case "n":   // \n
                    newLine();
                    break;
                case "t":   // \t
                    write('   ');
                    break;
                case "0":   // 0
                    if (string.slice(i + 1, i + 3) == '33') { // 33
                        i += 3;
                        if (i >= string.length) break;
                        if (string.charAt(i) != '[') {  // [
                            write(string.charAt(i));
                            break;
                        }
                        i += 1;
                        if (i >= string.length) break;
                        var bb = string.charAt(i);
                        switch (bb) {
                            case "A":   // A
                                cursorY--;
                                if (cursorY < 0) cursorY = 0;
                                break;
                            case "B":   // B
                                cursorY++;
                                if (cursorY >= screenHeight) cursorY = screenHeight - 1;
                                break;
                            case "C":   // C
                                cursorX++;
                                if (cursorX >= screenWidth) cursorX = screenWidth - 1;
                                break;
                            case "D":   // D
                                cursorX--;
                                if (cursorX < 0) cursorX = 0;
                                break;
                            case "J":   // J
                                clear();
                                break;
                            case "K":   // K
                                for (var u = cursorX; u < screenWidth; u++) {
                                    DDRAM[u][cursorY] = 0;
                                    cursorX++;
                                }
                                if (cursorX >= screenWidth) cursorX = screenWidth - 1;
                                break;
                            case "X":   // X
                                i += 4;
                                if (i >= string.length) break;
                                cursorX = parseInt(string.slice(i - 2, i + 1), 8) - parseInt('037', 8);
                                if (cursorX >= screenWidth) cursorX = screenWidth - 1;
                                break;
                            case "Y":      // Y
                                i += 4;
                                if (i >= string.length) break;
                                cursorY = parseInt(string.slice(i - 2, i + 1), 8) - parseInt('037', 8);
                                if (cursorY >= screenHeight) cursorY = screenHeight - 1;
                                break;
                        }
                    }
                    break;
                default:
                    write('\\' + b);
            }
        }
        i++;
    }
}





