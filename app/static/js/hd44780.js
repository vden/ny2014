// script by Alexey Shulga
// https://github.com/Levsha128/hd44780

// modified by Vladimir Vinogradov <vovan7773@gmail.com>

var canvas, ctx, CGRAM_IMG, background, characters;
var screenWidth = 20, screenHeight = 4;
var cursorX, cursorY;
var clientId = (new Date()).getTime();
var DDRAM = [];
var autoUpdate = 1, updateTimer;
var state = [];	// The current state of the display

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
        parseConsoleAndWriteEscSeq(data);
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
    CGRAM_IMG = document.createElement('canvas');
    CGRAM_IMG.width = 8 * 5 * 2;
    CGRAM_IMG.height = 1 * 8 * 2;  

    state = new Array(screenWidth);
    for (var i = 0; i < screenWidth; i++) {
        state[i] = new Array(screenHeight);
    }
    
    DDRAM = new Array(screenWidth);
    for (var i = 0; i < screenWidth; i++) {
        DDRAM[i] = new Array(screenHeight);
    }
    reset();
   // parseConsoleAndWriteEscSeq('Happy New year\r\nGeeeks!');    
    parseConsoleAndWriteEscSeq('\033[R0\000\000\014\012\014\012\014\000\033[R1\000\000\021\021\031\025\031\000\033[R2\000\000\021\033\025\021\021\000\033[R3\000\000\036\022\020\020\020\000\033[R4\000\000\017\005\011\021\037\021\033[J\033[HC Ho\000\001\002 \003o\004o\002\041');
    
    draw();
}

function clear() {
    for (var j = 0; j < screenHeight; j++) {
        for (var i = 0; i < screenWidth; i++) {
            DDRAM[i][j] = ' '.charCodeAt(0); // fastfix
        }
    }
}
function reset() {
    cursorX = 0;
    cursorY = 0;
    parseConsoleAndWriteEscSeq('\033[J\033[H'); // fastfix
    clear();
}

function draw() {
 // for (var j = 0; j < screenWidth; j++) { console.log(DDRAM[j]); }
    drawBackground();
    drawCharacters(); 
   // ctx.drawImage(CGRAM_IMG,0,0);
}

function drawBackground() {
    ctx.drawImage(background, 0, 0);
}

function drawCharacters() {
    for (var j = 0; j < screenHeight; j++) {
        for (var i = 0; i < screenWidth; i++) {
	  if(DDRAM[i][j] < 8)
	  {
	    drawCharFromCGRAM(DDRAM[i][j], i, j);
	  }
	  else
	  {
            drawCharacter(DDRAM[i][j], i, j);
	  }
        }
    }
}

function drawCharFromCGRAM(character, x, y) {
    var characterPosition = getCharacterInCGRAMPosition(character);
    var placeholderPosition = getPlaceholderPosition(x, y);

    ctx.drawImage(CGRAM_IMG, characterPosition.x, characterPosition.y, 10, 16, placeholderPosition.x, placeholderPosition.y, 10, 16);
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

function getCharacterInCGRAMPosition(character) {
    return {x:  character * 5 * 2, y: 0}
}

function getPlaceholderPosition(x, y) {
    return{x: 51 + x * 11, y: 58 + y * 17};
}

function newLine() {
    cursorX = 0;
    cursorY++;
    if (cursorY >= screenHeight) {
        cursorY = screenHeight - 1;
    }
}

// very powerful magic...
// my first JS code :)

// lcd engine routines
function lcd_clear_scr() {
  //console.log("lcd_clear_scr()");
  clear();
}

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function lcd_write_CGRAM(cgram_pixels, cgram_index) {
  //console.log("lcd_write_CGRAM(" + cgram_pixels + ", " + cgram_index + ")");
  var textureContext = CGRAM_IMG.getContext('2d');
  var imageData = textureContext.getImageData(0, 0, 5*2*8, 8*2);
  
  var offsetY = 0;
  for(var i = 0; i < 8; ++i){
    var line = cgram_pixels[i];       
    var offsetX = cgram_index * 5 * 2;     
    for(var j = 4; j >= 0; --j) {      
      var pxOpaq;
      if (((line >> j) & 1) == 1)
      {
	pxOpaq = 255; // black	
      }
      else
      {
	pxOpaq = 0; // white
      }      
      setPixel(imageData, offsetX,offsetY,0,0,0,pxOpaq);
      setPixel(imageData, offsetX+1,offsetY,0,0,0,pxOpaq);	
      setPixel(imageData, offsetX,offsetY+1,0,0,0,pxOpaq);
      setPixel(imageData, offsetX+1,offsetY+1,0,0,0,pxOpaq);
      
      offsetX = offsetX + 2;      
    }
    offsetY = offsetY + 2;
  }
  textureContext.putImageData(imageData, 0, 0);  
}

function lcd_goto(row, column) {
 // console.log("lcd_goto(" + row +", "+ column + ")");  
  cursorX = column;
  cursorY = row;
}

function lcd_put_char(data) {
 // console.log("lcd_put_char(" + data + ")");  
  DDRAM[cursorX][cursorY] = data; // integer
  cursorX++;
}

// other

/*
 * Character mapping for HD44780 devices by Mark Haemmerling <mail@markh.de>.
 *
 * Translates ISO 8859-1 to HD44780 charset.
 * HD44780 charset reference: http://markh.de/hd44780-charset.png
 *
 * Initial table taken from lcd.o Linux kernel driver by
 * Nils Faerber <nilsf@users.sourceforge.net>. Thanks!
 *
 * This file is released under the GNU General Public License. Refer to the
 * COPYING file distributed with this package.
 *
 * Following translations are being performed:
 * - maps umlaut accent characters to the corresponding umlaut characters
 * - maps other accent characters to the characters without accents
 * - maps beta (=ringel-S), micro and Yen
 *
 * Alternative mappings:
 * - #112 ("p") -> #240 (large "p"), orig. mapped -> #112
 * - #113 ("q") -> #241 (large "q"), orig. mapped -> #113
 *
 * HD44780 misses backslash
 *
 */

var charmap = [
/* #0 */
  0,  1,  2,  3,
  4,  5,  6,  7,
  8,  9, 10, 11,
 12, 13, 14, 15,
 16, 17, 18, 19,
 20, 21, 22, 23,
 24, 25, 26, 27,
 28, 29, 30, 31,
/* #32 */
 32, 33, 34, 35,
 36, 37, 38, 39,
 40, 41, 42, 43,
 44, 45, 46, 47,
 48, 49, 50, 51,
 52, 53, 54, 55,
 56, 57, 58, 59,
 60, 61, 62, 63,
/* #64 */
 64, 65, 66, 67,
 68, 69, 70, 71,
 72, 73, 74, 75,
 76, 77, 78, 79,
 80, 81, 82, 83,
 84, 85, 86, 87,
 88, 89, 90, 91,
/* #92 */
 47, 93, 94, 95,
 96, 97, 98, 99,
100,101,102,103,
104,105,106,107,
108,109,110,111,
112,113,114,115,
116,117,118,119,
120,121,122,123,
124,125,126,127,
/* #128 */
128,129,130,131,
132,133,134,135,
136,137,138,139,
140,141,142,143,
144,145,146,147,
148,149,150,151,
152,153,154,155,
156,157,158,159,
/* #160 */
160, 33,236,237,
164, 92,124,167,
 34,169,170,171,
172,173,174,175,
223,177,178,179,
 39,249,247,165,
 44,185,186,187,
188,189,190, 63,
/* #192 */
 65, 65, 65, 65,
225, 65, 65, 67,
 69, 69, 69, 69,
 73, 73, 73, 73,
 68, 78, 79, 79,
 79, 79,239,120,
 48, 85, 85, 85,
245, 89,240,226,
/* #224 */
 97, 97, 97, 97,
225, 97, 97, 99,
101,101,101,101,
105,105,105,105,
111,110,111,111,
111,111,239,253,
 48,117,117,117,
245,121,240,255];

/// Defines
var DFLT_DISP_ROWS = screenHeight		// Default number of rows the display has
var DFLT_DISP_COLS = screenWidth		// Default number of columns the display has
var TABSTOP = 3		// Length of tabs

var MAX_DISP_ROWS = screenHeight		// The HD44780 supports up to 4 rows
var MAX_DISP_COLS = screenWidth		// The HD44780 supports up to 40 columns
/* input_state states */
var NORMAL = 0
var ESC = 1   	// Escape sequence start
var DCA_Y = 2   	// Direct cursor access, the next input will be the row
var DCA_X = 3   	// Direct cursor access, the next input will be the column
var CGRAM_SELECT = 4		// Selecting which slot to enter new character
var CGRAM_ENTRY = 5		// Adding a new character to the CGRAM
var CGRAM_GENERATE = 6		// Waiting fot the 8 bytes which define a character
var CHAR_MAP_OLD = 7		// Waiting for the original char to map to another
var CHAR_MAP_NEW = 8		// Waiting for the new char to replace the old one with
var ESC_ = 10		// Waiting for the [ in escape sequence

/// global vars
var disp_rows = MAX_DISP_ROWS;
var disp_cols = MAX_DISP_COLS;
var disp_row = 0; 
var disp_column = 0; 						// Current actual cursor position
var row = 0;
var column = 0; 								// Current virtual cursor position
var wrap = 0;

var cgram_index = 0;
var cgram_row_count;
var cgram_pixels = new Array(8);
var char_map_old;
var input_state = NORMAL; 			// the current state of the input handler

function writeData(data) {
  //console.log("writeData(" + data + ")");
	/* check and see if we really need to write anything */
	if( state[ row ][ column ] !== data )
	{
		state[ row ][ column ] = data;
		/* set the cursor position if need be.
		 * Special case for 16x1 displays, They are treated as two
		 * 8 charcter lines side by side, and dont scroll along to
		 * the second line automaticly.
		 */
		if( disp_row != row || disp_column != column ||
				( disp_rows == 1 && disp_cols == 16 && column == 8 ) )
		{
		/* Some transation done here so 4 line displays work */
			
			lcd_goto(row, column);
			
			disp_row = row;
			disp_column = column;
		}
		lcd_put_char(data);
		disp_column++;
	}
	if ( column < disp_cols - 1 )
		column++;
	else if ( wrap && column == disp_cols - 1 && row < disp_rows - 1 )
	{
		column = 0;
		row++;
	}
}

function handleInput(input)
{
    //console.log("handleInput(" + input + ")"); 
	var i;
	var j;
	var temp;

	if ( input_state == NORMAL )
	{
		switch ( input )
		{
			case 0x08: 	// Backspace
				if ( column > 0 )
				{
					column--;
					writeData( ' ' );
					column--;
				}
				break;
			case 0x09: 	// Tabstop
				column = ( ( ( column + 1 ) / TABSTOP ) * TABSTOP ) + TABSTOP - 1;
				break;
			//case \n  : 	// Newline
			case 0x0a:	//new line
				if ( row < disp_rows - 1 )
					row++;
				else
				{
					/* scroll up */
					temp = column;
					for ( i = 0; i < disp_rows - 1; i++ )
					{
						row = i;
						for( j = 0; j < disp_cols; j++ )
						{
							column = j;
							writeData( state[ i + 1 ][ j ] );
						}
					}
					row = disp_rows - 1;
					column = 0;
					for ( i = 0; i < disp_cols; i++ )
					{
						writeData( ' ' );
					}
					column = temp;
				}
				/* Since many have trouble grasping the \r\n concept... */
				column = 0;
				break;
			//case \r: 	// Carrage return
			case 0x0d:
				column = 0;
				break;
			case 0x1b: 	// esc ie. start of escape sequence
				input_state = ESC_;
				break;
			default:
				/* The character is looked up in the */
				writeData(  charmap[ input ]  ); 
		}
	}
	else if ( input_state == ESC_ )
	{
		input_state = ESC;
	}
	else if ( input_state == ESC )
	{
		if( input <= 0x37/*'7'*/ && input >= 0x30/*'0'*/ )
		{
			/* Chararacter from CGRAM */
			writeData( input - 0x30 );
		} else {
			switch ( String.fromCharCode(input) )
			{
				case 'A': 		// Cursor up
					if ( row > 0 )
						row--;
					break;
				case 'B': 		// Cursor down
					if ( row < disp_rows - 1 )
						row++;
					break;
				case 'C': 		// Cursor Right
					if ( column < disp_cols - 1 )
						column++;
					break;
				case 'D': 		// Cursor Left
					if ( column > 0 )
						column--;
					break;
				case 'H': 		// Cursor home
					row = 0;
					column = 0;
					break;
				case 'J': 		// Clear screen, cursor doesn't move
					// memset( state, ' ', sizeof( state ) );
					for(var i = 0; i < DFLT_DISP_ROWS; ++i)
					{
					  for (var j = 0; j < DFLT_DISP_COLS; ++j)
					  {
					    state[i, j] = 0;
					  }
					}					
					lcd_clear_scr();
					break;
				case 'K': 		// Erase to end of line, cursor doesn't move
					temp = column;
					for ( i = column; i < disp_cols; i++ )
						writeData( ' ' );
					column = temp;
					break;
				case 'M':		// Charater mapping
					input_state = CHAR_MAP_OLD;
					break;
				case 'Y': 		// Direct cursor access
					input_state = DCA_Y;
					break;
				case 'R':		// CGRAM select
					input_state = CGRAM_SELECT;
					break;
				case 'V':		// Linewrap on
					wrap = 1;
					break;
				case 'W':		// Linewrap off
					wrap = 0;
					break;
				case 'b':       // blacklight
					//blacklight();
					break;
				default:
					console.log( "LCD: unrecognized escape sequence: code = " + input);
			}
		}
		if ( input_state != DCA_Y &&
				input_state != CGRAM_SELECT &&
				input_state != CHAR_MAP_OLD )
		{
			input_state = NORMAL;
		}
	}
	else if ( input_state == DCA_Y )
	{
		if ( input - 0x1f < disp_rows )
			row = input - 0x1f;
		else
		{
			console.log( "LCD: tried to set cursor to off screen location\n" );
			row = disp_rows - 1;
		}
		input_state = DCA_X;
	}
	else if ( input_state == DCA_X )
	{
		if ( input - 0x1f < disp_cols )
			column = input - 0x1f;
		else
		{
			console.log( "LCD: tried to set cursor to off screen location\n" );
			column = disp_cols - 1;
		}
		input_state = NORMAL;
	}
	else if ( input_state == CGRAM_SELECT )
	{
		if( input > 0x37/*'7'*/ || input < 0x30/*'0'*/ )
		{
			console.log( "LCD: Bad CGRAM index" + (input - 0x30) );
			input_state = NORMAL;
		} else {
			cgram_index = input - 0x30;
			cgram_row_count = 0;
			input_state = CGRAM_GENERATE;
		}
	}
	else if( input_state == CGRAM_GENERATE )
	{
		cgram_pixels[ cgram_row_count++ ] = input;
		if( cgram_row_count == 8 )
		{
			lcd_write_CGRAM(cgram_pixels, cgram_index);
			input_state = NORMAL;
		}
	}
	else if( input_state == CHAR_MAP_OLD )
	{
		char_map_old = input;
		input_state = CHAR_MAP_NEW;
	}
	else if( input_state == CHAR_MAP_NEW )
	{
		charmap[ char_map_old ] = input;
		input_state = NORMAL;
	}
}

function parseConsoleAndWriteEscSeq(string) {
    var i = 0;
    console.log(string);
    while (i < string.length) {
        var b = string.charAt(i);
	var charcode = b.charCodeAt(0);	
        if (b == '\\')
	{	  
	  i++;
	  b = string.charAt(i);
	  switch (b) {
	    case "r": // \r
	      charcode = 13;
	      break;	      
	    case "n": // \n
	      charcode = 10;
	      break;
	    case "x": // \xAB
	      charcode = parseInt(string.substr(i+1, 2), 16);	      
	      i = i + 2;
	      break;
	    case "0": // \033
	      charcode = parseInt(string.substr(i, 3), 8);	      
	      i = i + 2;
	      break;
	    default: // \\
	      i++;
	  }
	}	            
        handleInput(charcode);
        i++;
    }
}
