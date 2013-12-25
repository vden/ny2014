<!DOCTYPE html>
<html lang="en" dir="ltr">
    <head>
        <title>Send a congratulation to geeks!</title>
        <style>
          html, body { height: 100%; margin:0; padding:0}
          li.link {
            font-family: monospace;
            padding: .4em 0;
          }
          ul {margin-top: 0}
        </style>
    </head>
    <body style="background-color: rgb(238, 238, 238)">
      <div style="width:800px;text-align:center;margin: 0 auto;position:relative;min-height:100%;">
        <div style="margin-bottom:-40px">
          <h1 style="margin-top:0">New year congratulations<br/>from geeks to geeks!</h1>

          <div class="hd44780" style="margin:0 auto; width:314px;">
            <img src="//raw.github.com/Levsha128/hd44780/master/images/hd44780_Screen.png" class="hd44780_background" width="314" height="169" style="visibility: hidden; position: absolute">
            <img src="//raw.github.com/Levsha128/hd44780/master/images/hd44780_RU_Characters_5x8.png" class="hd44780_characters" width="160" height="256" style="visibility: hidden; position: absolute">
            <canvas class="hd44780_canvas" width="314" height="169"></canvas>
            <button id="autoupdate">Auto update off</button>
            <button id="update">Update</button>
            <button id="reset">Reset</button>
          </div>
          
          <div style="margin-top: 3em; text-align:left;border-top:1px dashed #ccc">
            <pre>
To send your message just use curl:
<i>$ curl -d text='Your congratulation' http://geeksnewyear.tk/messages/</i>
            </pre>
          </div>

          <div style="margin-top: 2em; text-align:left;border-top:1px dashed #ccc">
            <pre style="margin-bottom: .4em">
How to make one of DIY displays and watch congratulations on your table:</pre>
            <ul>
              <li class="link"><a target="_blank" href="http://habrahabr.ru/post/206148/">http://habrahabr.ru/post/206148/</a></li>
              <li class="link"><a target="_blank" href="http://habrahabr.ru/post/206692/">http://habrahabr.ru/post/206692/</a></li>
              <li class="link"><a target="_blank" href="http://habrahabr.ru/post/206782/">http://habrahabr.ru/post/206782/</a></li>
              <li class="link"><a target="_blank" href="http://habrahabr.ru/post/207136/">http://habrahabr.ru/post/207136/</a></li>
              <li class="link"><a target="_blank" href="https://groups.google.com/forum/#!forum/lpt-lcd-geeks">https://groups.google.com/forum/#!forum/lpt-lcd-geeks</a></li>
            </ul>
          </div>

          <div style="height:40px">&nbsp;</div>
          
        </div>
        <div style="text-align:left;position:absolute;bottom:0;width:100%;height:40px;">
          <pre>
&copy; 2013, 2014. Backend by <a style="color: #444" href="mailto:denis.voskvitsov@gmail.com">Denis Voskvitsov</a>, frontend by <a style="color: #444" href="mailto:levsha128@gmail.com">Alexey Shulga</a></pre>
        </div>
      </div>
      <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
      <script src="/static/js/hd44780.js" charset="utf-8"></script>      
    </body>
</html>


