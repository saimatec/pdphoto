/*!
 *  Kenburn slider Plugin for JQuery
 *  Version   : 0.9
 *  Date      : 2014-01-02
 *  Licence   : All rights reserved 
 *  Author    : owwwlab (Ehsan Dalvand & Alireza Jahandideh)
 *  Contact   : owwwlab@gmail.com
 *  Web site  : http://themeforest.net/user/owwwlab
 */

// Utility
if ( typeof Object.create !== 'function'  ){ // browser dose not support Object.create
    Object.create = function (obj){
        function F(){};
        F.prototype = obj;
        return new F();
    };
};

(function($, window, document, undefined) {
    
    var Kenburn = {
        init: function( options , elem ){
            var self = this; //store a reference to this

            self.elem = elem;
            self.$elem = $(elem);
            self.options = $.extend( {}, $.fn.kenburnIt.options, options);

            //images list
            self.list = {};
            for (var i = 0; i <= self.options.images.length; i++) {
                self.list[i] = {
                    imgSrc : self.options.images[i],
                    loaded : false
                }
            };

            //max number of images in the set
            self.maxImg = self.options.images.length;

            //set the current slide 
            self.currentSlide = self.options.beginWith ? self.options.beginWith : 0;

            //zoom prefix preset ( 1:zoom-in 0: zoom-out )
            self.zoomPrefix = 1;

            //prepare timing 
            self.calcTime();

            //run
            self.run();

            //Window resize handler
            self.checkSizeFlag=0;
            self.checkSizeChange();
            self.windowResize();

            
        },

        run: function(){

            
            var self = this;

            //Images
            for (var i = 0; i <= self.options.images.length; i++) {
                self.fetchImg(i);
            };

            //handle iteration
            
            var core = function(){
                if (!self.list[self.currentSlide+1].loaded){
                    self.fetchImg(self.currentSlide+1);
                }
                self.setNerOrigin(self.currentSlide);
                self.kbIt();
                self.currentSlide++;
                self.currentSlide = self.currentSlide%self.maxImg;
                self.zoomPrefix = !self.zoomPrefix;
            };

            core();

            var interval = self.timing.iterate*1000;
            
            setInterval(function(){
                core();
            }, interval);

        },

        kbIt: function(){

            var self = this,
                current = self.currentSlide,
                z = self.options.zoom,
                dt = self.timing,
                $w1 = self.list[current].wrapper,
                $img1 = self.list[current].img;

            var anim = (new TimelineLite({onComplete:function(){
                self.reset(current);    
            }}));
            
            anim.to($w1, dt.fadeTime, {autoAlpha:1});

            if ( self.zoomPrefix){
                //zoomin
                anim.to($img1, dt.zoomTime, {scaleX:z, scaleY:z, ease: Linear.easeNone},'-='+dt.fadeTime);
            }else{
                //zoomout
                anim.from($img1, dt.zoomTime, {scaleX:z, scaleY:z, ease: Linear.easeNone},'-='+dt.fadeTime);
            }
            
            anim.to($w1, dt.fadeTime,{autoAlpha:0}, '-='+dt.fadeTime );
            

        },

        fetchImg: function(index){
            
            var self = this,
                imgSrc = self.list[index].imgSrc;
            
            var wrapper = $("<div/>");
            wrapper.attr('class','owl-slide')
                .css({'opacity':0,'visibility':'hidden'});

            var img = $("<img />");
            img.attr('src', imgSrc);
            img.attr('alt', '');
            
            //inject into DOM
            self.$elem.append(wrapper.html(img));

            self.list[index] = {
                wrapper : wrapper,
                img : img,
                loaded : true
            };
            img.on('load',function(){
                self.imageFill(index);
            });
        },
        imageFill :function(index,inputImg){
            var self=this,
                img=self.list[index].img,
                containerWidth=self.$elem.width(),
                containerHeight=self.$elem.height(),
                containerRatio=containerWidth/containerHeight,
                imgRatio;
            if(inputImg!=undefined){
                img=inputImg;
            }
            imgRatio=img.width()/img.height();
            if (containerRatio < imgRatio) {
              // taller
              img.css({
                  width: 'auto',
                  height: containerHeight,
                  top:0,
                  left:-(containerHeight*imgRatio-containerWidth)/2
                });
            } else {
              // wider
              img.css({
                  width: containerWidth,
                  height: 'auto',
                  top:-(containerWidth/imgRatio-containerHeight)/2,
                  left:0
                });
            }
        },
        checkSizeChange:function() {
          var self=this;
          if (self.checkSizeFlag) {
            self.checkSizeFlag=0;
            self.$elem.find('img').each(function(){
                self.imageFill(0,$(this));
            })
          }
          setTimeout(function(){
            self.checkSizeChange();
          }, 200);
        },
        windowResize :function(){
            var self=this;
            $(window).resize(function(){
                self.checkSizeFlag=1;
            });
            
        },
        reset : function(index){
            TweenMax.to(this.list[index].img, 0,{scaleY:1,scaleX:1});
        },

        calcTime: function(){
            
            var time = this.options.duration;
            
            this.timing = {
                fadeTime            : time/5,
                zoomTime            : time,
                iterate             : time-time/5
            }
            
        },

        prepare: function(){

        },

        setNerOrigin: function(index){
            var x=0,y= 0;
            
            function rand(min1, max1, min2, max2) {
                var ret = 0;
                var dec = (Math.random()<0.5)? 0 :1;
                if ( dec==1){
                    ret = parseInt(Math.random() * (max1-min1+1), 10) + min1;    
                }else{
                    ret = parseInt(Math.random() * (max2-min2+1), 10) + min2;    
                }
                return ret;
                
            }

            x = rand(0,25,75,100);
            y = rand(0,25,75,100);
            var css = {
                "-moz-transform-origin"     : x+"% "+y+"%",
                "-webkit-transform-origin"  : x+"% "+y+"%",
                "-o-transform-origin"       : x+"% "+y+"%",
                "-ms-transform-origin"      : x+"% "+y+"%",
                "transform-origin"          : x+"% "+y+"%"
            };
            this.list[index].img.css(css);
        }

    }

    
    $.fn.kenburnIt = function( options ) {
        return this.each(function(){
            var kenburn = Object.create( Kenburn ); //our instance of Kenburn
            kenburn.init( options, this );
        }); 
    };

    $.fn.kenburnIt.options = {
        images : [],
        zoom : 1.2,
        duration : 5,
        onLoadingComplete:function(){},
        onSlideComplete:function(){},
        onListComplete:function(){},
        getSlideIndex:function(){
            return currentSlide;
        }
    };

})(jQuery, window, document);