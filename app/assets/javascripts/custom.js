//Settings

var enableInstruction=true; // If false the navigation instruction page does not show at all

//Check for touch support
var isTouchDevice=isTouchSupported();

//Check The ie version
var ieFlag=0;
if (eval('/*@cc_on !@*/false') && (document.documentMode === 9))
  {
      ieFlag=1;      
  }

//ajax global setup
$.ajaxSetup({cache:false});

var scrolla;
$('.scrollbar').scroll(function(){
  scrolla=$(this).scrollTop();
  $('body').scrollTop(scrolla);
});
//tooltips needs bootstrap.js
$('[rel="tooltip"]').tooltip();


//Contact form inputs place holder
$(":input[placeholder]").placeholder();

/*Lazy load images
----------------------------------------------*/
$("img.lazy").lazyload({
  threshold : 100,
  effect : "fadeIn",
  container: $('.overflow-wrapper'),
  failure_limit : 30,
  skip_invisible : false
});

//lazyload images
$('.gal2-images-wrapper').each(function(){
  var $this=$(this),
      imgs=$this.find('img.lazy');
  imgs.lazyload({
    threshold : 100,
    effect : "fadeIn",
    container: $this,
    failure_limit : 10,
    skip_invisible : false
  });
});

/*click custom event
 This is a custom event to distinguish between 
 mouse drag and mouse click
----------------------------------------------*/
var cces,cce={
  settings:{
    clickFlag : 1,
    targetEls : '.fullscreen-enable a, a.upstream-post, a.ajax-portfolio'
  },
  init: function(){
    cces = this.settings;
    this.bindUIActions();
  },
  bindUIActions: function(){
    $body = $("body");
    var pStart=0,pDiff=0;
    var pEnd=0,ieStart=0,ieEnd=0;
    $body.on('mousedown touchstart', cces.targetEls ,function(e){
      (e.pageX)?pStart=e.pageX:(pStart=ieStart);
    });

    $body.on('click', cces.targetEls, function(e){
      e.preventDefault();
    });

    $body.on('mouseup touchend', cces.targetEls, function(e){
      (e.pageX)?pEnd=e.pageX:(pEnd=ieEnd);
       pDiff=Math.abs(pEnd-pStart);
       if(pDiff<5){
        $(this).trigger('cs-click');   
       }
    });

    //IE shit stuffs
    var bindEvent = function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else {
            element.attachEvent('on'+type, handler);
        }
    }

    var elements=$('.fullscreen-enable a ,a.upstream-post, a.ajax-portfolio');

    elements.each(function(){
        bindEvent(this,'pointerdown',pdown);
        bindEvent(this,'pointerup',pup);
    });

    function pdown(e){
      ieStart=e.pageX;
      $(this).trigger('mousedown');
      
    }

    function pup(e){
      ieEnd=e.pageX;
      $(this).trigger('mouseup');
    }
  }
}
cce.init();


/*Initialize require methods 
----------------------------------------------*/
var initRequired={

  init:function(){
    menuPannel.init();
    layoutSwiper.init();
    if (!isTouchDevice){
       $('body').addClass('not-touch-device');
       perfectScroll.init();
    }
    this.bindUIActions();
  },
  bindUIActions:function(){
    $(window).on('resized',function(){
      if (!isTouchDevice){
        $('.scrollbar').perfectScrollbar('update');
        perfectScroll.init();
      }
    });
  }
}

/*PreLoader 
----------------------------------------------*/
var prl,preloader = {
  settings: {
    preloader   : $('#preloader'),
    textLoad    : $("#text-load"),
    totalImages : $('img')
  },
  init : function(){
    prl = this.settings;
    this.listeners();
    this.triggers();
  },

  //trigger a custom event when we are ready to go 
  triggers : function(){
        
        var self= this,
            loadedImagesNum = 0,
            totalImagesNum = prl.totalImages.length,
            overlay=prl.preloader.find('#load-overlay'),
            percentage;

        var imgLoad=imagesLoaded($('body'));

        imgLoad.on('progress', function() {
          loadedImagesNum=loadedImagesNum+1;
          percentage=(1-(loadedImagesNum/totalImagesNum))*100+'%';
          TweenMax.to(overlay,0.1,{width:percentage});
        });

        imgLoad.on('always',function(instance){
          $('body').trigger('readytogo');
        });

        //Fallback in case something went wrong
        $(window).load(function(){
          TweenMax.to(overlay,0.5,{width:0,onComplete:function(){
              $('body').trigger('readytogo');
          }});
        });
  },
  
  //listen to custom events
  listeners: function(){
    var self = this,
        $body = $('body');
    
    $body.on('hideloader', function(){
        
        //are you a first commer?
        if ($.cookie("returner") || !enableInstruction){//No?
          self.hideLoader();       
        } else { //Yes? then you should pay attention
          $.cookie("returner", 1, { expires : 1 });
          self.showGuids();
        }
        
    });

    $body.one('readytogo', function(){
        $body.trigger('hideloader');
    });

    $('a.startbtn').on('click',function(){
      self.hideLoader();
    });

  },

  showGuids : function(){
      (new TimelineLite())
        .to(prl.textLoad, 1, {top:"-=60px",scaleX:0.8,scaleY:0.8})
        .to($("#userguid"),1,{top:"60%",autoAlpha:1},"-=1");
  },
  // this is a custom animation effect, this can be whatever you like
  // just make sure you hide(remove) the loader elements
  hideLoader : function(){
    (new TimelineLite())
      .to(prl.preloader,1.5,{height:0, ease: Power4.easeInOut})
      .to($('#text-load,#userguid'),1.5,{opacity:0, ease: Power4.easeInOut,onComplete:function(){
        $('#text-load,#userguid').remove();
      }},'-=1.5')
      .to($('#hello-inner'),1,{left:"25%",ease: Power4.easeOut},'-=1')
      .from($('#hello-contents'),1.5,{left:'300px',autoAlpha:0,ease: Power4.easeOut},'-=0.5')
      .from($('#taskbar'),1.5,{scaleX:2,bottom:'-100px',opacity:0,ease: Power4.easeInOut, onComplete:function(){
        $("#menu-trigger a").trigger("mouseenter");
      }},'-=1.5');  
  }
}

/* page slider
----------------------------------------------*/
var ls,layoutSwiper = {
  
  settings : {
    swiperNavThumbs : $(".swiper-nav-thumbs"),
    menuPannel      : $("#menu-pannel"),
    menuTrigger     : $("#menu-trigger"),
    menuClose       : $("#close-menu"),
    swiperNext      : $("#pagenav .swip-next"),
    swiperPrev      : $("#pagenav .swip-prev"),
    contentSwiper   : $('div#swiper-content'),
    guide           : $('#enhancer'),
    swiperContetn   : $('#swiper-content'),
    swiperNav       : $('.swiper-nav')
  },

  init : function (){
    ls = this.settings;
    this.makeNavIndicators();
    this.updateContent();
    this.runSwiper();
    this.bindUIActions();
  },
  runSwiper : function() {
    var self = this;
    self.swiperit = ls.contentSwiper.swiper({
      speed :400,
      keyboardControl: true,
      noSwiping: true,
      simulateTouch : true,
      hashNav: true,
      onSlideChangeStart: function(swiper,direction){
		    self.updateNavPosition(swiper.activeIndex);
        menuPannel.moveNavMenu(swiper.activeIndex);
      },
      onSlideChangeEnd: function(swiper){
        self.menuDown();
      }
    });
  },

  bindUIActions : function () {
    
    var self = this;
    //menu
    ls.menuTrigger.on('touchstart click', 'a', function(e){
      e.preventDefault();
      $(this).trigger('mouseleave');
      self.menuIn();
    });
    ls.menuClose.on('touchstart click', 'a', function(e){
      e.preventDefault();
      self.menuDown();
    });

    //swiper next and prev
    ls.swiperNext.on('click',function(e){
      e.preventDefault();
      self.swiperit.swipeNext();
    });
    ls.swiperPrev.on('click',function(e){
      e.preventDefault();
      self.swiperit.swipePrev();
    });

    //guide user 
    ls.guide.on('click',function(){
      self.swiperit.swipeTo( 1 );
    });

    $(window).resize(function(){
      self.updateContent();
    });
    $(window).on('resized',function(){
      var activeSlide=$(self.swiperit.activeSlide());
    });

  },
  updateNavPosition : function (index) {
      ls.swiperNavThumbs.children().removeClass('active-nav').eq(index).addClass('active-nav');
  },
  menuDown : function () {
    TweenMax.to(ls.menuPannel,0.5,{bottom:"-450px",ease:Power4.easeOut});
  },

  menuIn : function () {
    TweenMax.to(ls.menuPannel, 0.5, {bottom:"0",ease:Power4.easeOut});  
  },

  makeNavIndicators : function () {
    var pageCount = $('.swiper-wrapper').children(".sub-page").length,
        thumb = "<div></div>",
        thumbs="";
    for (var i = pageCount - 1; i >= 0; i--) {
      thumbs = thumbs+thumb;
    };
    ls.swiperNavThumbs
      .css('width','100%')
      .html(thumbs).children().first().addClass('active-nav');
    ls.swiperNavThumbs.children('div').css('width',100/pageCount+"%");
  },
  updateContent : function(){
    ls.swiperContetn.css({
      height: $(window).height()-ls.swiperNav.height()
    });
  }
}//end of layoutSwiper obj


/*Build and handle perfect scrollbar*/
var pss,perfectScroll={
  settings:{
    scrollWrappers:$('.scrollbar')
  },
  init:function(){
    pss=this.settings;
    this.bindUIActions();    
  },
  bindUIActions:function(){
    var self=this;
    self.buildScroll();
  },
  buildScroll:function($elem){
     if ($elem !== undefined) {
        $elem=$elem.find('.scrollbar');
        $elem.perfectScrollbar();
     }else{
        pss.scrollWrappers.each(function(){
          $(this).imagesLoaded(function(){
            var $elem=$(this);
            $elem.perfectScrollbar();
            var yScroll=$elem.find('.ps-scrollbar-y'),
                yScrollWrapper=$elem.find('.ps-scrollbar-y-rail'),
                xScroll=$elem.find('.ps-scrollbar-x'),
                xScrollWrapper=$elem.find('.ps-scrollbar-x-rail');
            yScroll.each(function(){
              if ($(this).height()==0)
                $(this).parent().addClass('remove-scroll');
            });
             xScroll.each(function(){
              if ($(this).width()==0)
                $(this).parent().addClass('remove-scroll');
            });
          })
          
        });  
     }
    
  }
}

/* Menu pannel  
----------------------------------------------*/
var ms,menuPannel = {

  settings: {
    menuContainer : $('#menu-pannel'),
    menuImageContainer : $("#menu-pannel-image").find(".hex-3"),
    menuThumbs : $(".menu-pannel-thumb"),
    menuSliderContainer : $("#slider-container"),
    menuPannelNavs : $('#menu-pannel-navigation')
  },

  init: function(){
    ms = this.settings;
    this.prepare();
    this.bindUIActions();
  },

  bindUIActions : function () {
    var self = this;

    ms.menuPannelNavs.on('mouseenter','.item',function(){
      var index = $(this).index();
      self.moveNavMenu(index);
    });

    ms.menuPannelNavs.on('click','.item',function(){
      var $this = $(this),
        index = $this.index();
      layoutSwiper.swiperit.swipeTo( index );
    });  

    ms.menuThumbs.on('touchstart',function(){
      var index = $(this).index();
      layoutSwiper.swiperit.swipeTo( index );
    });    

    $(window).on('resized',function(){
      self.updateContent();
    });

  },
  moveNavMenu:function(index){
    var $container = ms.menuSliderContainer,
        move = -(index-1)*ms.itemwidth-300,
        activeIndex = $('#slider-container .active').index();

      if(index!==activeIndex){
        ms.menuPannelImages.addClass('hide').eq(index).removeClass('hide');
      ms.menuThumbs.removeClass('active').eq(index).addClass('active');
      ms.menuPannelNavs.find(".item").removeClass('active').eq(index).addClass('active');

      (new TimelineLite())
        .to($container,1.5,{marginLeft: move, ease:Power4.easeOut})
        .from(ms.menuPannelImages.eq(index),1.5,{top:"-80px",opacity:0.2, ease:Power1.easeOut},'-=2');    
      }  
  },

  updateContent : function(){
    ms.menuContainer = $('#menu-pannel');
    ms.itemwidth = (ms.menuContainer.outerWidth()/3)+200;
    ms.menuThumbs.each(function(){
      $(this).css('width', ms.itemwidth);
    });
    ms.menuSliderContainer.css('margin-left', ms.itemwidth-300);
    $("#menu-trigger a").trigger("mouseenter");
  },

  prepare : function(){
    
    //prepare images
    ms.menuImageContainer.html('');
    ms.menuPannelNavs.html('');
    ms.menuThumbs.each(function(){
      var img = $(this).find('img').first();
      ms.menuImageContainer.append(img);
      ms.menuPannelNavs.append('<div class="item"></div>').children().first().addClass('active');
    });
    ms.menuPannelImages = $("#menu-pannel-image img");

    ms.itemwidth = (ms.menuContainer.outerWidth()/3)+200;
    ms.menuThumbs.each(function(){
      $(this).css('width', ms.itemwidth);
    });

    ms.menuSliderContainer.css('margin-left', ms.itemwidth-300);

    ms.menuPannelImages.addClass('hide').eq(0).removeClass('hide');

  }
} // End of menuPannel obj


/* upstream triggers
----------------------------------------------*/
var upstreamOut = function(){
  var $ups = $("#upstream");
  $('#swiper-content').removeClass('not-visible');
  TweenMax.to($ups,1.5,{height:0, ease:Power4.easeOut, onComplete:function(){
      $ups.html('').hide();
  }});
}
var upstreamIn = function(html,callback){
  $('#swiper-content').addClass('not-visible');
  var $ups = $("#upstream").show().html(html);
  TweenMax.to($ups,1.5,{height:'50%', ease:Power4.easeOut,onComplete:function(){
    if( typeof callback == "function" ){callback()};
  }});
}

//listener for upstream fullscreen gallery
$("body").on('cs-click','.fullscreen-enable a',function(event){

    event.preventDefault();
    var upstreamContent = '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls">'
      +'<div class="slides"></div>'
      +'<h3 class="title"></h3>'
      +'<div class="counter"><span class="counter-current"></span><span class="counter-divider">/</span><span class="counter-total"></span></div>'
      +'<a class="prev"><i class="fa fa-angle-left"></i></a>'
      +'<a class="next"><i class="fa fa-angle-right"></i></a>'
      +'<a class="close"><img src="assets/img/close-cursor.png" title="close" alt="x"></a>'
      +'<a class="play-pause"></a>'
      +'</div>';
    upstreamIn(upstreamContent);

    var link = this,
        links = $(this).parents(".fullscreen-enable").find('a'),
        options = {
          index: link, 
          event: event,
          enableKeyboardNavigation: false,
          closeOnSlideClick: false,
          stretchImages: "cover",
          onclose:function(){
            upstreamOut();        
          },
          onopen: function () {
            
          },
          onslide: function (index, slide) {
            $("#blueimp-gallery .counter-current").html(index);
            $("#blueimp-gallery .counter-total").html(gallery.getNumber());
          },
        };
    var gallery = blueimp.Gallery(links, options);
  
});
     


/* audio player
----------------------------------------------*/
var as,audioBackground = {
  settings : {
    autoplay : true, // false or true
    audioPlayerContainer : $("#jp_container_1"),
    audioControlsInOut : $("#audioplayback, .jp-controls")
  },

  init: function(){
    as = this.settings;
    this.playlistPrepare();
    if (as.autoplay){
      as.playlist.select(0);
      as.playlist.play(0);  
    } 
    this.bindUIActions();
  },

  playlistPrepare : function(){
    as.playlist = new jPlayerPlaylist(
      {
        jPlayer: "#jquery_jplayer_1",
        cssSelectorAncestor: "#jp_container_1"
      }, 
      [
  {
    title:"Thin Ice",
    mp3:"assets/music/00.mp3"
  },
  {
    title:"Thin Ice",
    mp3:"assets/music/01.mp3"
  }*//* Uncomment following line to add more musics to play list,
  {
    title:"Thin Ice",
    mp3:"assets/music/02.mp3"
  },
  {
    title:"Thin Ice",
    mp3:"assets/music/03.mp3"
  }
],
      {
        playlistOptions: {
          enableRemoveControls: true, 
          autoPlay: true,
          loopOnPrevious: true
        },
        loop:true,
        swfPath: "../js",
        supplied: "oga, mp3",
        wmode: "window",
        smoothPlayBar: false,
        keyEnabled: false
      });
  },

  bindUIActions : function(){
    var self = this;
    as.audioControlsInOut.on('click','a',function(){
      
      var player = as.audioPlayerContainer,
        playerStatus = player.data('status');

      if (!playerStatus || playerStatus=="Off"){
        self.playerIn();
        player.data('status','On');
        $("#audioplayback").addClass('onside').removeClass('offside');
      }else{
        self.playerOut();
        player.data('status','Off');
        $("#audioplayback").addClass('offside').removeClass('onside');
      }

    });

  },

  playerOut: function(){
    TweenMax.to(as.audioPlayerContainer,1,{right:"-100px",ease:Power4.easeOut});
  },

  playerIn: function(){
    TweenMax.to(as.audioPlayerContainer,1,{right:"127px",ease:Power4.easeOut});
  },
} //end of audioBackground obj




/* home kenburn slider
----------------------------------------------*/
var kbs,kenburn = {
  settings : {
    viewport : $('#kb-container')
  },
  init :function(){
    kbs = this.settings;
    this.bindUIActions();
    this.buildKenburn();
    
  },
  buildKenburn : function(){
    var kb = kbs.viewport.kenburnIt({
      images : [
          "assets/img/home/22.jpg",
          "assets/img/home/21.jpg",
          "assets/img/home/23.jpg",
          "assets/img/home/27.jpg",
          "assets/img/home/29.jpg"
      ],
      zoom: 1.2,
      duration: 10
    });
  },
  bindUIActions : function(){
    
  },
  updateContent : function(){
    
  }
}


/* home video background
----------------------------------------------*/
var vs, videoBackground = {
  settings : {
    videoName : 'goldpai/goldpai',
  },

  init : function(){
    vs = this.settings;
    //IOS does not allow fullscreen video background so here we are just replacing video with the poster image.
    var ios = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
    if (ios){
      $('#home').prepend('<div class="video-background-poster" style="background-image:url(assets/video/'+vs.videoName+'.jpg)"></div><div class="video-background-overlay"></div>');    
    }else{

      $('#home').prepend('<div class="video-background"></div><div class="video-background-overlay"></div>');    
      $('.video-background').videobackground({
        videoSource: [
          ['assets/video/'+vs.videoName+'.mp4', 'video/mp4'],
          ['assets/video/'+vs.videoName+'.ogv', 'video/ogg'],
          ['assets/video/'+vs.videoName+'.webm', 'video/webm']
        ], 
        loop: true,
        preload:'auto',
        poster: 'assets/video/'+vs.videoName+'.jpg',
        loadedCallback: function() {
          $(this).videobackground('mute');
        }
      });
    }
    
  },

} //end of videoBackground obj



/* video portfolio
----------------------------------------------*/
var vps, videoPortfolio = {
  settings : {
    targetel : $('.videofolio')
  },
  init : function (){
     vps = this.settings;
     var self = this;
     vps.targetel.each(function(){
       var $overlay=$(this).find('.da-overlay').clone();
       self.buildVideo($(this),$overlay);
     });
  },
  buildVideo: function($el,$overlay){
    var filename = $el.attr('data-filename') || 'no-filename-supplied';
    $el.videobackground({
      videoSource: [
        ['assets/video/'+filename+'.mp4', 'video/mp4'],
        ['assets/video/'+filename+'.ogv', 'video/ogg'],
        ['assets/video/'+filename+'.webm', 'video/webm']
      ], 
      loop: true,
      preload:'auto',
      poster: 'assets/video/'+filename+'.jpg',
      loadedCallback: function() {
        $(this).videobackground('mute');
        $el.prepend($overlay);
        if(ieFlag){
          $overlay.css('top','-100%');  
        }else{
          TweenMax.to($overlay,0,{rotationX:180,transformOrigin:"left bottom"});
        }
        
      }
    });
  }
}//end of video portfolio



/* About me page image slider
----------------------------------------------*/
var aboutMeSlider = {
  settings: {
    slidesContainer : $('#about-slides')
  },

  init: function(){
    imageFill.init(this.settings.slidesContainer);
    this.settings.slidesContainer.slidesjs({
      width: 600,
      height: 900,
      navigation: {
        effect: "fade",
        active: false,
      },
      pagination: false,
      effect: {
        slide: {
          speed: 400
        }
      },
      play: {
        active: false,
        auto: true,
        effect : 'fade'
      }
    });
  }
}

/* grid portfolio
----------------------------------------------*/
// grid portfolio
  var gp,gridPortfolio = {
    settings:{
      masonryContainer : $('.masonryGrid'),
      galItems : $(".masonryGrid .da-item")
    },
    init: function(){
      gp = this.settings;
      this.buildMasonry();
      var prePos;
      if (ieFlag){
          prePos={top:'-100%'};
      }else{
        prePos={rotationX:180,transformOrigin:"left bottom"};
      }
      TweenMax.to(gp.galItems.find(".da-overlay"), 0.2,prePos);
      this.bindUIActions();
    },
    bindUIActions: function(){
      var self = this;
        
        gp.galItems.on('mouseenter', function (ev) { 
          var dir = self._getDirection($(this),{ x : ev.pageX, y : ev.pageY });
          var fromto = self._getAnimation(dir,'in');
          TweenMax.fromTo($(this).find(".da-overlay"), 0.7,fromto.from,fromto.to);
          TweenMax.to($(this).find('img'),0.6,{scaleX:1.2,scaleY:1.2});

        });

        gp.galItems.on('mouseleave', function (ev) {
          var dir = self._getDirection($(this),{ x : ev.pageX, y : ev.pageY });
          var fromto = self._getAnimation(dir,'out');
          TweenMax.fromTo($(this).find(".da-overlay"),0.7,fromto.from,fromto.to);
          TweenMax.to($(this).find('img'),0.6,{scaleX:1,scaleY:1});
        });

        $(window).on('resized',function(){
          var $vidoefolios = gp.masonryContainer.find('.videofolio');
          var height = gp.masonryContainer.find('img').first().height();
          $vidoefolios.parent('.da-item').height(height);
        });
      
    },
    buildMasonry: function(){
      gp.masonryContainer.imagesLoaded(function () {

        //check if we have a video as a portfolio item 
        // and correct the size of tha containing <a>
        var $vidoefolios = gp.masonryContainer.find('.videofolio');
        if ( $vidoefolios.length > 0 ){
          var height = gp.masonryContainer.find('img').first().height();
          $vidoefolios.parent('.da-item').height(height);
        }

        gp.masonryContainer.masonry({
            itemSelector: '.da-item',
            columnWidth: '.da-item',
            transitionDuration: 0
        });
      });
    },
    _getDirection : function ($el, coordinates) {
      var w = $el.width(),
          h = $el.height(),
          x = ( coordinates.x - $el.offset().left - ( w/2 )) * ( w > h ? ( h/w ) : 1 ),
          y = ( coordinates.y - $el.offset().top  - ( h/2 )) * ( h > w ? ( w/h ) : 1 ),
          d = Math.round( ( ( ( Math.atan2(y, x) * (180 / Math.PI) ) + 180 ) / 90 ) + 3 ) % 4;
    
      return d;
    },
    _getAnimation : function(dir,status){
      var output = {};
      if (status ==="in") {
        switch( dir ) {
          case 0:
            // from top
            if(ieFlag){
              output = {
                from:{top:'-100%',left:0},
                to: {top:0,left:0,ease:Power4.easeOut}
              }
            }else{
              output = {
                from:{rotationX:180, rotationY:0, transformOrigin:"right top", ease:Power4.easeOut},
                to: {rotationX:360, rotationY:0, transformOrigin:"right top", ease:Power4.easeOut}
              }
            }
            
            break;
          case 1:
            // from right
            if(ieFlag){
              output = {
                from:{top:0,left:'100%'},
                to: {top:0,left:0,ease:Power4.easeOut}
              }
            }else{
              output = {
                from:{rotationY:180, rotationX:0, transformOrigin:"right top", ease:Power4.easeOut},
                to: {rotationY:360, rotationX:0, transformOrigin:"right top", ease:Power4.easeOut}
              }
            }
            break;
          case 2:
            // from bottom
            if(ieFlag){
              output = {
                from:{top:'100%',left:0},
                to: {top:0,left:0,ease:Power4.easeOut}
              }
            }else{
              output = {
                from:{rotationX:180, rotationY:0, transformOrigin:"left bottom", ease:Power4.easeOut},
                to: {rotationX:0, rotationY:0, transformOrigin:"left bottom", ease:Power4.easeOut}
              }
            }
            
            break;
          case 3:
            // from left
            if(ieFlag){
              output = {
                from:{top:0,left:'-100%'},
                to: {top:0,left:0,ease:Power4.easeOut}
              }
            }else{
              output = {
                from:{rotationY:180, rotationX:0, transformOrigin:"left bottom", ease:Power4.easeOut},
                to: {rotationY:0, rotationX:0, transformOrigin:"left bottom", ease:Power4.easeOut}
              }
            }
            
            break;
        };
      }else{
        switch( dir ) {
          case 0:
            // to top
            if(ieFlag){
              output = {
                  from:{},
                  to: {top:'-100%', ease:Power4.easeOut}
              }
            }else{
               output = {
                  from:{rotationX:360, transformOrigin:"right top", ease:Power4.easeOut},
                  to: {rotationX:180, transformOrigin:"right top", ease:Power4.easeOut}
               } 
            }
                
            break;
          case 1:
            // to right
            if(ieFlag){
              output = {
                  from:{},
                  to: {left:'100%', ease:Power4.easeOut}
              }
            }else{
               output = {
                from:{rotationY:360, transformOrigin:"right bottom", ease:Power4.easeOut},
                to: {rotationY:180, transformOrigin:"right bottom", ease:Power4.easeOut}
              } 
            }
            
            break;
          case 2:
            // to bottom
            if(ieFlag){
              output = {
                  from:{},
                  to: {top:'100%', ease:Power4.easeOut}
              }
            }else{
               output = {
                from:{rotationX:0, transformOrigin:"left bottom", ease:Power4.easeOut},
                to: {rotationX:180, transformOrigin:"left bottom", ease:Power4.easeOut}
              } 
            }
            
            
            break;
          case 3:
            // to left
            if(ieFlag){
              output = {
                  from:{},
                  to: {left:'-100%', ease:Power4.easeOut}
              }
            }else{
              output = {
                from:{rotationY:0, transformOrigin:"left bottom", ease:Power4.easeOut},
                to: {rotationY:180, transformOrigin:"left bottom", ease:Power4.easeOut}
              } 
            }
            
            break;
        };
      };

      return output;
    }

  }

/* upstream portfolio
----------------------------------------------*/
var ups, upstreamPortfolio = {
  settings : {
    portfolioTrigger:$('.ajax-portfolio')
  },
  
  init: function(){
    ups = this.settings;
    this.bindUIActions();
  },

  bindUIActions: function(){
    var self=this;

    ups.portfolioTrigger.on('cs-click',function(event){

      ups.e=event;
      var url=$(this).attr('href');
      var video = $(this).hasClass('video-item');
      upstreamIn('<div class="upstreamclose"></div><div class="upstream-folio"><div class="loading"></div></div>',function(){
          $('.upstream-folio').height($(window).height());
          self.makeAjax(url,video);
        });
    });
  },
  
  buildGallery:function(){
    var blueimpContents = '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls">'
    +'<div class="slides"></div>'
    +'<h3 class="title"></h3>'
    +'<div class="counter"><span class="counter-current"></span><span class="counter-divider">/</span><span class="counter-total"></span></div>'
    +'<a class="prev"><i class="fa fa-angle-left"></i></a>'
    +'<a class="next"><i class="fa fa-angle-right"></i></a>'
    +'<a class="close"><img src="assets/img/close-cursor.png" title="close" alt="x"></a>'
    +'<a class="play-pause"></a>'
    +'</div>';
    var galContainer=$('.portfolio-main'),
        galItems=$('#portfolio-gallery').find('a');
    galContainer.html(blueimpContents);  
    var options = { 
        event: ups.e,
        enableKeyboardNavigation: false,
        closeOnSlideClick: false,
        stretchImages: "cover",
        carousel : true,
        onclose:function(){
          upstreamOut();        
        },
        onopen: function () {
          
        },
        onslide: function (index, slide) {
          $("#blueimp-gallery .counter-current").html(index);
          $("#blueimp-gallery .counter-total").html(gallery.getNumber());
        },
      };
    var gallery = blueimp.Gallery(galItems, options);   

  },
  makeAjax:function(desUrl,video){
      var self=this;
      $.ajax({
        type:'GET',
        url:desUrl,
        datatype:'html',
        success:function(data){
          self.ajaxSuccess(data,video);
        }
      })
  },
  ajaxSuccess:function(data,video){
    var self=this,
        $upstream=$('#upstream');        
    $('.upstream-folio').html(data);
    if (!video){
      self.buildGallery(); 
    }else{
      $("#jquery_jplayer_1").jPlayer("pause", 0);
      $upstream.find('iframe').height($(window).height()-5);
    }
    self.setCommentsHeight();
    if (!isTouchDevice){
       perfectScroll.buildScroll($upstream);
    }
   
    
  },
  setCommentsHeight:function(){
    var $commentWrapper=$('#upstream').find('.comments-wrapper'),
        sideHeadHeight=$('#upstream').find('.ps-wrapper>.head').height(),
        Wheight=$(window).height();

    $commentWrapper.height(Wheight-sideHeadHeight);    
  }
}



/* vertical gallery
----------------------------------------------*/
var vgs, verticalGallery = {
  settings:{
    galThumbs : $('.gal2-thumb-carousel'),
    galThumbWrapper:$('.gal2-thumb-container'),
    galImagesWrapper : $('.gal2-images-wrapper'),
    offset : -70, // this is the offset to scroll 
    scrollTime : 800
  },

  init:function(){
    vgs = this.settings;
    this.makeCarousel();
    this.bindUIActions();

    vgs.galThumbWrapper.find('img').each(function(){
        $(this).attr('data-index',$(this).index());
    });
  },

  makeCarousel: function(){
    vgs.galThumbs.carouFredSel({
      circular:false,
      infinite: false,
      responsive: false,
      direction: 'down',
      height: '100%',
      auto : false,
      items: {
        height: 100,
        width: 90
      },
      scroll: {
        items: '-1'
      },
      prev: ".gal2-prev",
      next: ".gal2-next"
    },{
      wrapper :{
        element : 'div',
        classname : 'gal2_caroufredsel_wrapper'
      }
    });
  },

  bindUIActions: function(){
    var self=this;
    vgs.galThumbs.each(function(){
      $(this).on('click','img',function(e){
        $(this).addClass('active-thumb').siblings().removeClass('active-thumb');
        $imgWrapper=$(this).parents('.page-container').find('.gal2-images-wrapper');
        var target = $imgWrapper.children().eq($(this).attr('data-index'));
        $imgWrapper.scrollTo( target, vgs.scrollTime,{ offset:vgs.offset } ).perfectScrollbar('update');
      });  
    });

    
    vgs.galThumbWrapper.each(function(){
    var $this=$(this),
        $carousel=$this.find('.gal2-thumb-carousel'),
        availableHeight = $this.height(),
        totalHeight=0;
        
      $carousel.imagesLoaded(function(){
          totalHeight=0;
          $carousel.children().each(function(){
            totalHeight+=$(this).outerHeight();
          });
          var dif = availableHeight - totalHeight;        
          $this.on('mousemove',function(event){
            var mod = event.pageY / availableHeight;
                mtop=mod * (dif-availableHeight*0.65);

            mtop=Math.min(Math.max(mtop,dif),0);
            TweenMax.to($carousel,1.5,{top:mtop});
          });  
      });   
    });

    $(window).on('resized',function(){
      self.updateContent();
    });

  },
  updateContent :function(){

    vgs.galThumbs.trigger("updateSizes");
  }
}

/* horizontal gallery
----------------------------------------------*/
var hgs, HorizontalGallery = {
  settings : {
    galThumbs : $('.gal3-thumb-carousel'),
    galThumbWrapper:$('.gal3-thumb-container'),
    galImagesWrapper : $('.gal3-images-wrapper'),
    galImages : $('.gal3-images'),
    scrollTime : 800,
    overflowWrapper : $('.overflow-wrapper')
  },

  init: function(){
    hgs = this.settings;
    hgs.availableWidth = hgs.galImages.width();
    this.prepare();
    this.setSize();
    this.buildMouseWeel();
    this.makeCarousel();
    this.bindUIActions();

    hgs.galThumbs.find('img').each(function(){
        $(this).attr('data-index',$(this).index());
    });
  },

  bindUIActions: function(){
    
    var self=this;

    hgs.galThumbs.on('click','img',function(e){
      
      $(this).addClass('active-thumb').siblings().removeClass('active-thumb');
      var target = hgs.galImagesWrapper.children().eq($(this).attr('data-index'));
      hgs.overflowWrapper.scrollTo( target, hgs.scrollTime );

    });

    hgs.galThumbWrapper.imagesLoaded(function(){
        //Compute how much we need to scroll the thumbnails
        var availableW = hgs.galThumbWrapper.width(),
              bayas=$(window).width()-availableW,
              totalW = hgs.galThumbs.children().length * hgs.galThumbs.children().first().outerWidth(),
              dif = availableW - totalW;

        hgs.galThumbWrapper.on('mousemove',function(event){
            mod = (event.pageX-bayas) / availableW,
            left = mod * (dif-availableW*0.65);
            left=Math.min(Math.max(left,dif),0);
            TweenMax.to(hgs.galThumbs,1.5,{left:left});    
        });
    });
    

    $(window).on('resized',function(){
      self.updateContent();
      self.setSize();
    });
  },
  updateContent :function(){
    hgs.galThumbs.trigger("updateSizes");
    hgs.availableWidth = $('.gal3-images').width();
    this.prepare();
  },
  makeCarousel: function(){
    hgs.galThumbs.carouFredSel({
      circular:true,
      infinite: true,
      responsive: true,
      auto:false,
      items: {
        width: 100,
        visible: {
          min: 3,
          max: 10
        }
      },
      scroll: {
        items: '-1'
      },
      prev: "#gal3-prev",
      next: "#gal3-next",
      onCreate: function(){
        var $carousel = $(".gal3-thumb-carousel");
        $carousel.css('left',"-50%");
      }
    },{
      wrapper :{
        element : 'div',
        classname : 'gal3_caroufredsel_wrapper'
      }
    });
  },
  setSize:function(){
    var self=this;
    var aspectRatio=$(window).width()/$(window).height(),
        $images=hgs.galImages.find('img');
    if (aspectRatio<1){
      $images.css({height:'auto',width:'100%'});
    }else{
      $images.css({height:'100%',width:'auto'});
    }
  },
  prepare: function(){
    hgs.galThumbs.children().first().addClass("active-thumb");
    hgs.galImagesWrapper.children().css('width',hgs.availableWidth);
    hgs.galImagesWrapper.css({'width' : hgs.galImagesWrapper.children().length*hgs.availableWidth + 'px'});    

  },

  buildMouseWeel: function(){
    hgs.overflowWrapper.mousewheel(function(event, delta) {
      this.scrollLeft -= (delta * 150);
      event.preventDefault();
    });    
  }
}

/* team carousel
----------------------------------------------*/
var tcs, teamCarousel = {
    settings : {
      imagesContainer : $('.team-image-wrapper'),
      carouslWrapper  : $(".team-carousel-wrapper"),
      itemsContainer  : $('.team-carousel'),
      teamSide        : $('.team-side'), 
      nextButton      : $('.team-next'),
      prevButton      : $('.team-prev'),
      counterTotal    : $(".team-counter .counter-total"),
      counterCurrent  : $(".team-counter .counter-current")
    },


    init: function(){
      this.settings.items=this.settings.itemsContainer.find('.item');
      tcs = this.settings;
      this.prepare();
      this.handleBgColors();

      this.bindUIActions();
      
      //reverse the order of images since we want them to scroll from the very first at the bottom.
      tcs.imagesContainer.children().each(function(i,item){tcs.imagesContainer.prepend(item)});
      
    },

    handleBgColors : function(){
      
      var parentColor = tcs.carouslWrapper.css("backgroundColor");
      var parts = parentColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if(parts){
        delete(parts[0]);
        var hsv = this.rgbToHsv(parts[1],parts[2],parts[3]);
      }else{
        var hsv = [0,0,0];
      }

      tcs.items.each(function(){
        var bgColor='hsl('+hsv[0]+','+hsv[1]+'%,'+rand(hsv[2]-10,hsv[2]+10)+ '%)';
        $(this).css('background',bgColor);
      });
      function rand(min, max) {
        return parseInt(Math.random() * (max-min+1), 10) + min;
      }
      
    },
    rgbToHsv : function(r,g,b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }

      return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    },

    prepare : function(){
      imageFill.init(tcs.teamSide.find('.item'));
      //height of each image and des
      tcs.imageHeight = tcs.teamSide.height();
      tcs.desHeight = tcs.itemsContainer.children(".item").first().outerHeight();

      tcs.itemsContainer.find(".item-wrapper").each(function(){
        var minusMarginTop = $(this).outerHeight()/-2;
        $(this).css('margin-top',minusMarginTop);
      });
      //just to make sure
      //tcs.itemsContainer.children(".item").css('height',tcs.desHeight);

      //slides count
      tcs.slideCount = tcs.imagesContainer.find('.item').length;
      tcs.currentSlideIndex = 0;
      
      tcs.counterTotal.html(tcs.slideCount);
      tcs.counterCurrent.html(1);

      //Show/hide Controllers
      tcs.nextButton.fadeIn();
      tcs.prevButton.fadeOut();

      //pull the images container all the way up.
      tcs.initMargin = tcs.imageHeight*(tcs.slideCount-1);
      tcs.imagesContainer.css('margin-top',-tcs.initMargin);
      tcs.itemsContainer.css('margin-top',0);
    },

    nextSlide : function(){
      
      tcs.currentSlideIndex++;
      this.updateCounter(tcs.currentSlideIndex);

      if (tcs.currentSlideIndex+1==tcs.slideCount)
        tcs.nextButton.fadeOut();
      tcs.prevButton.fadeIn();
      
      (new TimelineLite())
        .to(tcs.imagesContainer,1,{marginTop:'+='+tcs.imageHeight,ease:Power4.easeOut})
        .to(tcs.itemsContainer,0.8,{marginTop:'-='+tcs.desHeight,ease:Power4.easeOut},'-=1');     
    },

    prevSlide : function(){
      tcs.currentSlideIndex--;
      this.updateCounter(tcs.currentSlideIndex);
      if (tcs.currentSlideIndex==0){
        //hide the nexr arrow
        tcs.prevButton.fadeOut();
      }
      tcs.nextButton.fadeIn();
      (new TimelineLite())
        .to(tcs.imagesContainer,1,{marginTop:'-='+tcs.imageHeight,ease:Power4.easeOut})
        .to(tcs.itemsContainer,0.8,{marginTop:'+='+tcs.desHeight,ease:Power4.easeOut},'-=1');     
    },
    updateCounter : function(currentSlideIndex){
      tcs.counterCurrent.html(currentSlideIndex+1);
    },
    bindUIActions: function(){/**/
      self = this;
      tcs.nextButton.on('click',function(){
        self.nextSlide();
      })
      tcs.prevButton.on('click',function(){
        self.prevSlide();
      })

      $(window).on('resized',function(){
        self.prepare();
        /*
        tcs.imageHeight = tcs.teamSide.height();
        tcs.desHeight = tcs.itemsContainer.children(".item").first().outerHeight();

        tcs.itemsContainer.find(".item-wrapper").each(function(){
          var minusMarginTop = $(this).outerHeight()/-2;
          $(this).css('margin-top',minusMarginTop);
        });
        tcs.initMargin = tcs.imageHeight*(tcs.slideCount-1);
        tcs.imagesContainer.css('margin-top',-tcs.initMargin);
        tcs.itemsContainer.css('margin-top',0);
        tcs.currentSlideIndex = 0;
        tcs.counterCurrent.html(1);*/

      });
    }
}

/* blog
----------------------------------------------*/
var bs,blog = {
  
  settings : {
    isotopeContainer : $('#blog-posts'), 
    blogFilters : $('#blog-filters'),
    blogMore : $("a#blog-more")
  },

  init : function(){
    bs = this.settings;
    this.buildIsotope();
    this.bindUIActions();
  },

  buildIsotope : function(){
    bs.isotopeContainer.imagesLoaded(function(){
      bs.isotopeContainer.isotope({
        // options
          itemSelector : '.blog-item',
          transformsEnabled:true,
          duration:750,
          resizable:true,
          resizesContainer:true,
          layoutMode:'masonry'
        });
    });   
  },

  bindUIActions : function(){
    var self = this;
    
    // click event in isotope filters
    bs.blogFilters.on('click', 'a',function(e){
      e.preventDefault();
      $(this).parent('li').addClass('active-cat').siblings().removeClass('active-cat');
      var selector = $(this).attr('data-filter');
      bs.isotopeContainer.isotope({ filter: selector });
    });

    //add items 
    //
    // You should implement this as an ajax callback
    //
    bs.blogMore.on('click',function(e){
        e.preventDefault();
        
        var $newItems = $('<div class="blog-item diary expo daily"><div class="inside"><img src="assets/img/blog/posts/thumb/01.jpg" alt="image" class="img-responsive"><div class="blog-item-contents"><h3><a href="ajax_pages/single-post.html" class="upstream-post">My latest Portraits of Angella</a></h3><div class="post-meta"><div class="post-author"><i class="fa fa-edit"></i>Erica Franklin</div><div class="post-date"><i class="fa fa-calendar"></i>2014/01/01</div><div class="post-cat"><i class="fa fa-folder"></i>Portraits</div></div><div class="post-intro">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div><div class="post-more"><a href="ajax_pages/single-post.html" class="upstream-post">read more</a></div></div></div></div><div class="blog-item diary expo daily"><div class="inside"><img src="assets/img/blog/posts/thumb/01.jpg" alt="image" class="img-responsive"><div class="blog-item-contents"><h3><a href="ajax_pages/single-post.html" class="upstream-post">My latest Portraits of Angella</a></h3><div class="post-meta"><div class="post-author"><i class="fa fa-edit"></i>Erica Franklin</div><div class="post-date"><i class="fa fa-calendar"></i>2014/01/01</div><div class="post-cat"><i class="fa fa-folder"></i>Portraits</div></div><div class="post-intro">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div><div class="post-more"><a href="ajax_pages/single-post.html" class="upstream-post">read more</a></div></div></div></div>');
        bs.isotopeContainer.isotope( 'insert', $newItems, function(){
          bs.isotopeContainer.isotope( 'reLayout' );
        });
        
        return false;
    });
    

    //open upstream for single post
    $("body").on('cs-click','a.upstream-post', function(e){

      var post_url = $(this).attr('href');
      upstreamIn('<div class="inner-wrapper scrollbar"><div class="upstreamclose"></div><div class="single-post"><div class="loading"></div></div></div>',function(){
        if (!isTouchDevice){
          perfectScroll.buildScroll($('#upstream'));
        }
      });
      $(".single-post").load(post_url);

    });
    
    $("body").on('click','.upstreamclose',function(e){
      e.preventDefault();
      upstreamOut();
      $("#jquery_jplayer_1").jPlayer("play");
    });
          
    // $(window).resize(function(){
    //   self.updateContent();
    // });

  },
  updateContent :function(){
    //bs.isotopeContainer.isotope( 'reLayout' );
  }
}


var imageFill={

  init:function($container){
    this.container=$container;
    this.setCss();
    this.bindUIActions();
  },
  setCss:function(){
    $container=this.container;
    $container.imagesLoaded(function(){
      var containerWidth=$container.width(),
        containerHeight=$container.height(),
        containerRatio=containerWidth/containerHeight,
        imgRatio;

      $container.find('img').each(function(){
        var img=$(this);
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
      })
    });
  },
  bindUIActions:function(){
    var self=this;
    $(window).on('resized',function(){
        self.setCss();
    });
  }
}
/* google map
----------------------------------------------*/
var $gmap = $("#gmap"); 
$gmap.gmap3({
  map: {
      options: {
          maxZoom:15,
          streetViewControl: false,
          mapTypeControl: false,
      }
  },
  styledmaptype: {
      id: "mystyle",
      options: {
          name: "Style 1"
      },
      styles: [
          {
              featureType: "all",
              stylers: [
                  {"saturation": -100}, {"gamma": 0.9}
              ]
          }
      ]
  },
  overlay:{
    //Edit following line and enter your own address
    address: "Footscray VIC 3011 Australia",
    options:{
      content: '<div id="map-marker"><i class="fa fa-map-marker"></i></div>',
      offset:{
        y:-65,
        x:-20
      }
    }
  }},"autofit");
$gmap.gmap3('get').setMapTypeId("mystyle");


/* home slider for quotes
----------------------------------------------*/
var hs, helloSlider = {
  settings : {
    slides : $("#headingslides").children('div'),
    sliderIndex : 1,
    transitionTime : 1, // seconds
    showTime : 3, // secons time which a slide remains on the screen
    move : 30, //pixels
    easing : "Power4.easeOut" // see easings of tweenmax
    //speed = 4 //1,2,3,4,5
  },

  init : function(){
    hs = this.settings;
    hs.howmany = hs.slides.length;
    
    this.showHeading(hs.slides.eq(0));
  },

  showHeading : function(runSlide){
    var self = this;
    
    hs.slides.css('top',0);
    (new TimelineLite())
      .to(runSlide, hs.transitionTime, { autoAlpha:1, top: "+="+hs.move+"px", ease:hs.easing})
      .to(runSlide, hs.transitionTime, { autoAlpha:0, top: "+="+hs.move+"px", ease:hs.easing},"+="+hs.showTime);
    hs.sliderIndex=(hs.sliderIndex+1)%(hs.howmany);

    //repeat yourself
    setTimeout(function(){
      var slideToRun = hs.slides.eq(hs.sliderIndex-1);
      self.showHeading(slideToRun);
    }, hs.showTime*1600);
  }
}


submitContact();
//Ajax contact form 
function submitContact() {
    var contactForm = $('form#contact-form');

    contactForm.submit(function(e) {
        e.preventDefault();

        if ($("#alert-wrapper").length) {
            return false;
        }

        var alertWrapper = $('<div id="alert-wrapper"><button type="button" class="close" data-dismiss="alert">X</div>').appendTo(contactForm);
        $('form#contact-form .alert').remove();

        var hasError = false,
            ajaxError = false;

        //form input validation     
        contactForm.find('.requiredField').each(function() {
            if ($.trim($(this).val()) == '') {
                var labelText = $(this).attr('placeholder');
                alertWrapper.append('<div class="alert">You forgot to enter your ' + labelText + '.</div>');
                hasError = true;
            } else if ($(this).hasClass('email')) {
                var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                if (!emailReg.test($.trim($(this).val()))) {
                    var labelText = $(this).attr('placeholder');
                    alertWrapper.append('<div class="alert"> You\'ve entered an invalid ' + labelText + '.</div>');
                    hasError = true;
                }
            }
        });

        //Showing alert popup
        var showAlert = new TimelineLite({paused: true});
        hideAlert = new TimelineLite({paused: true});
        showAlert.to(alertWrapper, 0.3, {opacity: 1, top: '30%'});
        hideAlert.to(alertWrapper, 0.3, {opacity: 0, top: '60%', onComplete: function() {
                alertWrapper.remove();
        }});

        if (hasError) {
            //Thers is  error in form inputs show alerts
            showAlert.play();
            alertWrapper.find('button').on('click', function() {
                hideAlert.play();
            })
        }
        else {
            //Validation passed send form data to contact.php file via ajax
            var formInput = $(this).serialize();
            $.ajax({
                type: 'POST',
                url: $(this).attr('action'),
                dataType: 'json',
                data: formInput,
                success: function(data) {
                    //Ajax request success
                    if (data.status == "error") {
                        ajaxError = true;
                        alertWrapper.append('<div class="alert"><strong>Sorry</strong> There was an error sending your message!</div>');
                    } else if (data.status == 'ok') {
                       
                        alertWrapper.append('<div class="alert"><strong>Thanks</strong> Your email has been delivered. </div>');
                        
                    }
                    showAlert.play();
                },
                error: function() {
                    //Ajax request success
                    ajaxError = true;
                    alertWrapper.append('<div class="alert"><strong>Sorry</strong> There was an error sending your message!</div>');
                    showAlert.play();
                }
            });
        }
        if (ajaxError) {
            //Ajax request had some errors
            showAlert.play();
            alertWrapper.find('button').on('click', function() {
                hideAlert.play();
            });
        }
        return false;
    });

}


//check if device supports touch
function isTouchSupported() {
      var msTouchEnabled = window.navigator.msMaxTouchPoints;
      var generalTouchEnabled = "ontouchstart" in document.createElement("div");
   
      if (msTouchEnabled || generalTouchEnabled) {
          return true;
      }
      return false;
}

//Handle window resize
var resizeFlag=0;  
$(window).resize(function(){
    resizeFlag=1;
})
checkSizeChange();
function checkSizeChange(){
    if (resizeFlag) {
      resizeFlag=0;
      $(window).trigger('resized');
    }
    setTimeout(function(){
      checkSizeChange();
    }, 200);
}


  