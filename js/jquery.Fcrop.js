/**
 * jquery.Fcrop.js v0.0.1
 * jQuery Image Cropping Fcrop - released under MIT License
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

(function( $, window, document, undefined ){
  // our plugin constructor
  var Fcrop = function( elem, options ){
    this.elem = elem;
    this.$elem = $(elem);

    this.options = options;
    // This next line takes advantage of HTML5 data attributes
    // to support customization of the plugin on a per-element
    // basis. For example,
    // <div class=item' data-plugin-options='{"message":"Goodbye World!"}'></div>
    this.metadata = this.$elem.data( 'plugin-options' );
  };
  // the plugin prototype
  Fcrop.prototype = {
    defaults: {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      opacity: 0.2,
      padding: 0,
      fill: 'gray',
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
    config: null,
    id: null,
    init : function( options ) {
      var self = this;
      self.config = $.extend({}, this.defaults, this.options,
          this.metadata);
      $.each(['onChange','onSelect','onRelease', 'getApi'],function(i,e) {
        if (typeof(self.config[e]) !== 'function') self.config[e] = function () {};
      });

      if(!fabric){
        $.error( 'fabric.js not found' );
      }
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
            self.coords.w =    parseInt(options.target.width * options.target.scaleX);
            self.coords.h =    parseInt(options.target.height * options.target.scaleY);
            self.coords.x =    parseInt(options.target.left);
            self.coords.y =    parseInt(options.target.top);
            self.coords.x2 =   parseInt(options.target.left + self.coords.w);
            self.coords.y2 =   parseInt(options.target.top + self.coords.h);

            self.config.onChange(self.coords);
          });
        }
      };

      var image = self.image = self.$elem;
      var src = image.attr('src');
      var a = image.closest('a');
      self.id = self.generateUUID();
      if (a[0]) {
        a.after('<div class="fcropCanvasBlock" style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="' + self.id + '"></div>');
        a.css('display', 'none');
      }
      else {
        image.after('<div class="fcropCanvasBlock" style="width: '+ image.width() +'px; height: '+ image.height() +'px; -moz-user-select: none; -webkit-user-select: none;"><canvas id="' + self.id + '"></div>');
        image.css('display', 'none');
      }

      self.canvas = new fabric.Canvas(self.id, {
        width:  image.width(),
        height: image.height()
      });

      self.canvas.selection = false;
      self.canvas.setBackgroundImage(src, self.canvas.renderAll.bind(self.canvas), {
        width: image.width(),
        height: image.height()
      });

      self.drawRect();

      crop.observe('object:moving', self.canvas);
      crop.observe('object:scaling', self.canvas);
    },
    drawRect: function() {
      var self = this;

      if (self.config.maximizeCrop && self.image.height() > 0) {
        var original_aspect = self.image.width() / self.image.height();
        var new_height;
        var new_width;
        if ( original_aspect >= self.config.aspectRatio ) {
          // If image is wider than thumbnail (in aspect ratio sense)
          new_height = self.image.height();
          new_width  = self.image.height() * self.config.aspectRatio;
        }
        else {
          // If the thumbnail is wider than the image
          new_width  = self.image.width();
          new_height = self.image.width() / self.config.aspectRatio;
        }
        self.config.width = new_width;
        self.config.height = new_height;

        self.coords = {
          x:  self.config.left,
          y:  self.config.top,
          x2: self.config.left + self.config.width,
          y2: self.config.top + self.config.height,
          w:  self.config.width,
          h:  self.config.height
        };
      }

      self.config.onChange(self.coords);

      if (!self.rect) {
        self.rect = new fabric.Rect({
          left:     self.config.left,
          top:      self.config.top,
          width:    self.config.width,
          height:   self.config.height,
          opacity:  self.config.opacity,
          padding:  self.config.padding,
          fill:     self.config.fill
        });
        self.canvas.add(self.rect);
      }
      else {
        self.rect.set({
          left:     self.config.left,
          top:      self.config.top,
          width:    self.config.width,
          height:   self.config.height,
          opacity:  self.config.opacity,
          padding:  self.config.padding,
          fill:     self.config.fill
        });
      }

      if (self.config.lockAspect) {
        self.rect.lockUniScaling=true;
      }

      self.rect.setControlVisible('mtr', false);
      self.canvas.renderAll();
      self.canvas.calcOffset();
      self.canvas.setActiveObject(self.rect);
    },
    setOptions: function(opt) {
      var self = this;
      if (typeof(opt) !== 'object') opt = {};
      self.config = $.extend(self.config, opt);
      $.each(['onChange','onSelect','onRelease', 'getApi'],function(i,e) {
        if (typeof(self.config[e]) !== 'function') self.config[e] = function () {};
      });
      self.drawRect();
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
    },
    generateUUID: function() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }
  };
  Fcrop.defaults = Fcrop.prototype.defaults;
  $.fn.fcrop = function(options) {
    return this.each(function() {
      new Fcrop(this, options).init();
    });
  };
  //optional: window.Fcrop = Fcrop;
})( jQuery, window , document );