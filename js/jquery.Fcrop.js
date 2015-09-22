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
      onChange: function () {}
    },
    coords: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      w:  0,
      h:  0
    },
    options: null,
    init : function( options ) {
      Fcrop.options = $.extend(Fcrop.defaults, options);
      Fcrop.coords = {
        x1: Fcrop.options.left,
        xy: Fcrop.options.top,
        x2: Fcrop.options.left + Fcrop.options.width,
        y2: Fcrop.options.top + Fcrop.options.height,
        w:  Fcrop.options.width,
        h:  Fcrop.options.height
      };

      $.each(['onChange','onSelect','onRelease'],function(i,e) {
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
                Fcrop.coords.w =   parseInt(options.target.width * options.target.scaleX);
                Fcrop.coords.h =   parseInt(options.target.height * options.target.scaleY);
                Fcrop.coords.x1 =  parseInt(options.target.left);
                Fcrop.coords.y1 =  parseInt(options.target.top);
                Fcrop.coords.x2 =  parseInt(options.target.left + Fcrop.coords.w);
                Fcrop.coords.y2 =  parseInt(options.target.top + Fcrop.coords.h);
              }
              Fcrop.options.onChange(Fcrop.coords);
            });
          }
        };
        obj = this;
        var image = $(obj);
        var src = image.attr('src');
        var a = image.closest('a');

        if (a) {
          a.after('<div style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="fcrop_canvas"></div>');
          a.css('display', 'none');
        }
        else {
          image.after('<div style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="fcrop_canvas"></div>');
          image.css('display', 'none');
        }

        var canvas = new fabric.Canvas("fcrop_canvas", {
          width:  image.width(),
          height: image.height()
        });
        canvas.selection = false;
        if (Fcrop.options.maximizeCrop) {
          var original_aspect = image.width() / image.height();
          var new_height;
          var new_width;
          if ( original_aspect >= Fcrop.options.aspectRatio ) {
            // If image is wider than thumbnail (in aspect ratio sense)
            new_height = image.height();
            new_width  = image.height() / Fcrop.options.aspectRatio;
          }
          else {
            // If the thumbnail is wider than the image
            new_width  = image.width();
            new_height = image.width() / Fcrop.options.aspectRatio;
          }
          Fcrop.options.width = new_width;
          Fcrop.options.height = new_height;
        }
        var rect = new fabric.Rect({
          left:     Fcrop.options.left,
          top:      Fcrop.options.top,
          width:    Fcrop.options.width,
          height:   Fcrop.options.height,
          opacity:  Fcrop.options.opacity,
          padding:  Fcrop.options.padding,
          fill:     Fcrop.options.fill
        });

        if (Fcrop.options.lockAspect) {
          rect.lockUniScaling=true;
        }

        rect.setControlVisible('mtr', false);
        canvas.add(rect);
        canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas));

        crop.observe('object:moving', canvas);
        crop.observe('object:scaling', canvas);
      });
    },
    setOptions: function(opt)
    {
      if (typeof(opt) !== 'object') opt = {};
      Fcrop.options = $.extend(options, opt);
      $.each(['onChange','onSelect','onRelease'],function(i,e) {
        if (typeof(Fcrop.options[e]) !== 'function') Fcrop.options[e] = function () {};
      });
    },
    destroy : function( ) {
      return this.each(function(){
        $(window).unbind('.fcrop');
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