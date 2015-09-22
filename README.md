# Fcrop
JQuery plugin for crop image

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
