/**
 * jquery.Fcrop.js v0.0.1
 * jQuery Image Cropping Plugin - released under MIT License
 * Author: Andrew Godin <covoxx@gmail.com>
 * https://github.com/covox/fcrop
 * Copyright (c) 2015 ITFrogs {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * }}}
 */

(function( $ ){
  var Fcrop = {
    defaults: {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      opacity: 0.2,
      padding: 0,
      fill: 'green',
      aspectRatio: 1,
      maximizeCrop: false,
      lockAspect: false,
      onChange: function () {},
      getApi: function () {}
    },
    coords: {
      x:  0,
      y:  0,
      x2: 0,
      y2: 0,
      w:  0,
      h:  0
    },
    options: null,
    rect: null,
    canvas: null,
    image: null,
    init : function( options ) {
      Fcrop.options = $.extend(Fcrop.defaults, options);
      $.each(['onChange','onSelect','onRelease', 'getApi'],function(i,e) {
        if (typeof(Fcrop.options[e]) !== 'function') Fcrop.options[e] = function () {};
      });

      if(!fabric){
        $.error( 'fabric.js not found' );
      }

      return this.each(function(c) {
        var crop = {
          json: null,
          observe: function (eventName, canvas) {
            canvas.on(eventName, function(options){
              if (options.target.left < 1) {
                options.target.set({
                  left: 0
                });
              }
              if (options.target.top < 1) {
                options.target.set({
                  top: 0
                });
              }
              if (options.target.left > (canvas.getWidth() - options.target.width * options.target.scaleX)) {
                options.target.set({
                  left: canvas.getWidth() - options.target.width * options.target.scaleX
                });
              }
              if (options.target.top > (canvas.getHeight() - options.target.height * options.target.scaleY)) {
                options.target.set({
                  top: canvas.getHeight() - options.target.height * options.target.scaleY
                });
              }
              if (options.target.left) {
                Fcrop.coords.w =    parseInt(options.target.width * options.target.scaleX);
                Fcrop.coords.h =    parseInt(options.target.height * options.target.scaleY);
                Fcrop.coords.x =    parseInt(options.target.left);
                Fcrop.coords.y =    parseInt(options.target.top);
                Fcrop.coords.x2 =   parseInt(options.target.left + Fcrop.coords.w);
                Fcrop.coords.y2 =   parseInt(options.target.top + Fcrop.coords.h);
              }
              Fcrop.options.onChange(Fcrop.coords);
            });
          }
        };
        obj = this;
        var image = Fcrop.image = $(obj);
        var src = image.attr('src');
        var a = image.closest('a');

        if (image.closest('a')) {
          a.after('<div class="fcropCanvasBlock" style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="fcrop_canvas"></div>');
          a.css('display', 'none');
        }
        else {
          image.after('<div class="fcropCanvasBlock" style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="fcrop_canvas"></div>');
          image.css('display', 'none');
        }

        Fcrop.canvas = new fabric.Canvas("fcrop_canvas", {
          width:  image.width(),
          height: image.height()
        });
        Fcrop.canvas.selection = false;
        Fcrop.canvas.setBackgroundImage(src, Fcrop.canvas.renderAll.bind(Fcrop.canvas), {
          width: image.width(),
          height: image.height()
        });

        Fcrop.drawRect();

        crop.observe('object:moving', Fcrop.canvas);
        crop.observe('object:scaling', Fcrop.canvas);

        Fcrop.options.getApi(Fcrop);
      });
    },
    drawRect: function() {
      if (Fcrop.options.maximizeCrop) {
        var original_aspect = Fcrop.image.width() / Fcrop.image.height();
        var new_height;
        var new_width;
        if ( original_aspect >= Fcrop.options.aspectRatio ) {
          // If image is wider than thumbnail (in aspect ratio sense)
          new_height = Fcrop.image.height();
          new_width  = Fcrop.image.height() * Fcrop.options.aspectRatio;
        }
        else {
          // If the thumbnail is wider than the image
          new_width  = Fcrop.image.width();
          new_height = Fcrop.image.width() / Fcrop.options.aspectRatio;
        }
        Fcrop.options.width = new_width;
        Fcrop.options.height = new_height;

        Fcrop.coords = {
          x:  Fcrop.options.left,
          y:  Fcrop.options.top,
          x2: Fcrop.options.left + Fcrop.options.width,
          y2: Fcrop.options.top + Fcrop.options.height,
          w:  Fcrop.options.width,
          h:  Fcrop.options.height
        };
      }
      Fcrop.options.onChange(Fcrop.coords);

      if (!Fcrop.rect) {
        Fcrop.rect = new fabric.Rect({
          left:     Fcrop.options.left,
          top:      Fcrop.options.top,
          width:    Fcrop.options.width,
          height:   Fcrop.options.height,
          opacity:  Fcrop.options.opacity,
          padding:  Fcrop.options.padding,
          fill:     Fcrop.options.fill
        });
        Fcrop.canvas.add(Fcrop.rect);
      }
      else {
        Fcrop.rect.set({
          left:     Fcrop.options.left,
          top:      Fcrop.options.top,
          width:    Fcrop.options.width,
          height:   Fcrop.options.height,
          opacity:  Fcrop.options.opacity,
          padding:  Fcrop.options.padding,
          fill:     Fcrop.options.fill
        });
      }

      if (Fcrop.options.lockAspect) {
        Fcrop.rect.lockUniScaling=true;
      }

      Fcrop.rect.setControlVisible('mtr', false);
      Fcrop.canvas.renderAll();
      Fcrop.canvas.calcOffset();
      Fcrop.canvas.setActiveObject(Fcrop.rect);
    },
    setOptions: function(opt)
    {
      if (typeof(opt) !== 'object') opt = {};
      Fcrop.options = $.extend(Fcrop.options, opt);
      $.each(['onChange','onSelect','onRelease', 'getApi'],function(i,e) {
        if (typeof(Fcrop.options[e]) !== 'function') Fcrop.options[e] = function () {};
      });
      Fcrop.drawRect();
    },
    destroy : function() {
      return this.each(function(){
        var image = $(this);
        var src = image.attr('src');
        var a = image.closest('a');

        if (a) {
          a.css('display', 'block');
        }
        else {
          image.css('display', 'block');
        }
        $('.fcropCanvasBlock').remove();
        $(window).unbind('.fcrop');
        Fcrop.canvas = null;
        Fcrop.rect = null;
      })
    }
  };
  $.fn.fcrop = function( method ) {
    // логика вызова метода
    if ( Fcrop[method] ) {
      return Fcrop[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return  Fcrop.init.apply( this, arguments );
    } else {
      $.error( 'Метод с именем ' +  method + ' не существует для jQuery.fcrop' );
    }
  };

})( jQuery );