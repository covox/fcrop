# Fcrop
 jquery.Fcrop.js v0.0.1<br />
 jQuery Image Cropping Plugin - released under MIT License<br />
 Author: Andrew Godin <covoxx@gmail.com><br />
 https://github.com/covox/fcrop<br />
 Copyright (c) 2015 ITFrogs<br />

# Usage

    $('#fcrop').fcrop();
    
    or
    
    $('#fcrop').fcrop({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        opacity: 0.2,
        padding: 0,
        fill: 'green',
        aspectRatio: 0.5,
        onChange: function(c) {
          console.log(c);
        }
    });
