/**
 * Video player
 */
;(function($){
	
	$.fn.Vimeo_VideoPlayer = function(options){
		
		if( 0 == this.length ){ 
				return false; 
		}
		
		// support multiple elements
       	if (this.length > 1){
            this.each(function() { 
            	$(this).Vimeo_VideoPlayer(options);
			});
            return;
       	}
		
       	// common params
		var vidDefaultParams = {
			'width'		: 500,
			'height'	: 375,
			'play'		: 0, // play on active
			'volume'	: 30, // default volume
			'fullscreen': 1, // fullscreen capability
			'loop'		: 0, // loop on finish,
			'autoplay'	: 0, // this stays 0. Otherwise, once loaded, videos will start playing
			// events
			stateChange : function(){}
		};
       	// variables       	
		var self 			= this,
			options 		= $.extend({}, vidDefaultParams, options),
			playerId 		= false, // stores the player ID generated by the script
			containerId 	= false, // stores ID of the container
			player 			= false, // stores the player reference
			playerData 		= false, // stores player data from HTML
			playerStatus 	= false; // false - not loaded, 1 - ready, 2 - playing, 3 - paused, 4 - stopped			
		
		var initialize = function(){
			
			// store video data on video container				
			var data = decodeParams( $(self).html() ), // video details from element
				id = generateIds(); // container and player unique ids
								
			// set unique id on container
			$(self).attr('id', id.cid).empty().append('<div id="'+id.pid+'"></div>');
			
			// store players ids for later reference
			containerId = id.cid;
			playerId 	= id.pid;
			playerData	= data;
			
			// set the options
			options = getParams( 'vimeo' );
			options.source = 'vimeo';
			
			// load the player
			loadFlashPlayer();
			
			// responsive
			resizePlayer();			
			$(window).resize(function(){
				resizePlayer();
			});
			
			return self;
		};
		
		var resizePlayer = function(){
			var width = $('#'+containerId).width(),
				height;
			
			switch( options.aspect_ratio ){
				case '16x9':
				default:
					height = (width *  9) / 16;
				break;
				case '4x3':
				height = (width *  3) / 4;
				break;
			}
			
			$('#'+containerId).height( Math.floor( height ) );			
		}
		
		/**
		 * Parses raw params stored inside the element as HTML comment
		 * and returns an object.
		 */
		var decodeParams = function( raw_data ){			
			return $.parseJSON( raw_data.replace(/<!--|-->/g, '') );
		}
				
		/**
		 * Combines general params ( vidDefaultParams ) with player
		 * specific params for either supported platforms
		 * */
		var getParams = function(){
			var defaults = {};
			// vimeo specific params
			var vimeoDefaults = {
				'api'		: 1, // this stays 1. enables js to interact with the player
				'title'		: 0, // show video title
				'byline'	: 0, // show video author
				'portrait'	: 0, // show author avatar
				'color'		: '', // controls color
				'player_id'	: playerId,
				'clip_id'	: options.video_id || playerData.video_id
			};		
			
			defaults = $.extend({}, options, vimeoDefaults, playerData);
			return defaults;
		}
		
		/**
		 * Generates unique ID's for player and player container
		 */
		var generateIds = function(){
			var cid 	= 'FA_videoPlayerContainer_', // container id prefix
				pid 	= 'FAVideoPlayer', // player id prefix
				uid 	= Math.floor(Math.random()*1000),
				result 	= {}; // unique ID
			
			result.cid = cid+uid;
			result.pid = pid+uid;
			
			return result;
		}
		
		/**
		 * Embeds the flash player using swfobject
		 */
		var loadFlashPlayer = function(){
			// player params
			var params = {
				allowfullscreen		: "true", 
				wmode				: "transparent", 
				allowScriptAccess	: "always"
			};
			// player atts
			var attributes = {
				id	: playerId, 
				name: playerId
			};
			
			swfobject.embedSWF(
				'https://vimeo.com/moogaloop.swf', 
				playerId, 
				'100%',
				'100%', 
				'8', 
				false,
				options,
				params,
				attributes,
				swfobjectCallback // callback funciton to check if Flash player has loaded
			);			
		}
		
		var swfobjectCallback = function(d){
			// if swf loaded successfully, proceed with flash player actions
			if( d.success ){
				doAction('load');
			}else{
				generateIframe( options.clip_id );				
			}	
		}
		
		var generateIframe = function( clip_id ){
			
			var params = {
				'api' 		: 1,
				'autoplay'	: options.autoplay,
				'title'		: options.title,
				'byline'	: options.byline,
				'portrait'	: options.portrait,
				'color'		: options.color,
				'fullscreen': options.fullscreen,
				'player_id' : playerId					
			};
			
			var src = 'https://player.vimeo.com/video/' + clip_id + '?' + $.param( params );			
			var ifr = '<iframe style="visibility:visible;" id="'+playerId+'" src="'+src+'" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
			$('#'+containerId).empty().append(ifr);
			//doAction('load');
			if( !this.isHTML5 ){
				this.isHTML5 = true;
			}	
			
		}
		
		/**
		 * Plays, pauses or stops video
		 */
		var doAction = function( action, value ){
			
			if( this.isHTML5 && 'loadVideo' == action ){				
				doAction('pause');
				generateIframe( value );
				playerStatus = false;
				return;				
			}
			
			
			// when player is ready, it will set ready param on container. Check it.
			if( !playerStatus ){
				setTimeout( function(){
					doAction( action, value );
				}, 100);
				return;
			}
			
			// status of player is ready
			playerStatus = 1;
			var funcs = {
				'play' 			: 'api_play',
				'pause' 		: 'api_pause',
				'stop' 			: 'api_stop',
				'volume' 		: 'api_setVolume',
				'loadVideo'		: 'api_loadVideo',
				'unload'		: 'api_unload',
				'volumeDivider' : 100
			};			
			
			// get the player object
			if( !player ){
				player = document.getElementById(playerId);
				// if player isn't set, must be first run. Set the player volume
				var volFunc = funcs['volume'],
					volume = ( playerData.volume || 10 ) / funcs['volumeDivider'];				
				
				if( this.isHTML5 ){
					FA_post_action( volFunc.replace('api_', ''), volume, playerId );
				}else{				
					player[volFunc](volume);
				}	
			}
			
			if( 'volume' == action ){
				value /= funcs['volumeDivider'];
			}
			
			// if loading action was triggered, stop here
			if( 'load' == action ){
				return;
			}
			
			// function of player to call
			var func = funcs[action];
			
			if( !this.isHTML5 ){
				
				if( 'loadVideo' == action ){
					playerStatus = false;
				}
				
				// call function
				if( typeof value != 'undefined' ){
					player[func]( value );
				}else{
					player[func]();
				}
			}else{
				var func_val = typeof value != 'undefined' ? value : '';
				FA_post_action( func.replace('api_', ''), func_val, playerId );
			}	
			
			// change player status
			switch( action ){
				case 'play':
					playerStatus = 2;
				break;
				case 'pause':
					playerStatus = 3;
				break;
				case 'stop':
					playerStatus = 4;
				break;
			}	
			options.stateChange.call(self, playerStatus);
		}
		
		/**
		 * Play video
		 */
		this.play = function(){			
			doAction('play');			
		};
		
		/**
		 * Pause video
		 */
		this.pause = function(){
			doAction('pause');
		};		
		
		/**
		 * Stop video
		 */
		this.stop = function(){
			doAction('stop');
		};
		
		/**
		 * Load video by id
		 */
		this.load = function( video_id ){
			doAction('loadVideo', video_id);
		}
		
		this.setVolume = function( vol ){
			doAction('volume', vol);
		}
		
		/**
		 * Returns the player settings
		 */
		this.getData = function(){
			return playerData;
		}
		
		/**
		 * Returns the current player status.
		 * Values: 
		 * - false 	: player not initialized
		 * - 1 		: player is ready
		 * - 2		: playing
		 * - 3		: paused
		 * - 4		: ended
		 */
		this.getStatus = function(){
			return playerStatus;
		}
		
		this.updateStatus = function( status ){
			playerStatus = status;
			options.stateChange.call(self, status);				
		}
		
		$(this).data('ref', this);
		return initialize();			
	};	
})(jQuery);

/****************************************************************************
 * FLASH PLAYERS
 ****************************************************************************/

/* Vimeo Flash Player callback */
function vimeo_player_loaded( pid ){
	var playerContainer = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
	jQuery(playerContainer).data('ref').updateStatus( 1 );

	var player = document.getElementById( pid );	
	player.api_addEventListener('play', 'FA_VIMEO_CALLBACKS.onPlay');
	player.api_addEventListener('pause', 'FA_VIMEO_CALLBACKS.onPause');
	player.api_addEventListener('finish', 'FA_VIMEO_CALLBACKS.onFinish');
}
/* Callbacks for Vimeo Flash Player */
var FA_VIMEO_CALLBACKS = {
	'onPlay': function(pid){
		var p = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
		p.data('ref').updateStatus( 2 );
	},
	'onPause': function(pid){
		var p = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
		p.data('ref').updateStatus( 3 );
	},
	'onFinish': function(pid){
		var p = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
		p.data('ref').updateStatus( 4 );
	}
}

/******************************************************************************
 * HTML5 PLAYERS
 ******************************************************************************/
// Vimeo
//Listen for messages from the player
if (window.addEventListener){
    window.addEventListener('message', FA_receiveMessage, false);
}else{
    window.attachEvent('onmessage', FA_receiveMessage, false);
}

function FA_receiveMessage(e){
	
	var o = e.origin.indexOf('vimeo');
	if( -1 == o ){
		return;
	}	
	
	var data 	= jQuery.parseJSON(e.data),
		pid 	= data.player_id;
	
	switch(data.event) {
	    case 'ready':
	    	var playerContainer = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
	    	jQuery(playerContainer).data('ref').updateStatus( 1 );
	    	// add event listeners
	    	FA_post_action('addEventListener', 'pause', 	pid);
	    	FA_post_action('addEventListener', 'finish', 	pid);
	    	FA_post_action('addEventListener', 'play', 		pid);
	    break;
	       
	    case 'play':	        
	    	var playerContainer = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
	    	jQuery(playerContainer).data('ref').updateStatus( 2 );	    	
	    break;
	        
	    case 'pause':	
	    	var playerContainer = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
	    	jQuery(playerContainer).data('ref').updateStatus( 3 );	    	
	    break;
	       
	    case 'finish':	
	    	var playerContainer = jQuery( pid.replace('FAVideoPlayer', '#FA_videoPlayerContainer_') );
	    	jQuery(playerContainer).data('ref').updateStatus( 4 );	    	
	    break;
	}
}
//Helper function for sending a message to the player
function FA_post_action(action, value, pid) {
    var data = { method: action };
    
    if (value) {
        data.value = value;
    }
    
    var f = jQuery('#'+pid)[0];
    
    f.contentWindow.postMessage(JSON.stringify(data), jQuery(f).attr('src').split('?')[0]);
}

;(function($){
	$(document).ready(function(){
		$('div.cvm_single_video_player').Vimeo_VideoPlayer({'elem_data' : true});		
	})
})(jQuery);







;(function($){
	
	$.fn.CVM_Player_Default = function( options ){
		
		if( 0 == this.length ){ 
			return false; 
		}
		
		// support multiple elements
       	if (this.length > 1){
       		this.each(function() { 
				$(this).CVM_Player_Default(options);				
			});
       		return;
       	}
       	
       	var defaults = {
       		'player' 	: '.cvm-player',
       		'items'	 	: '.cvm-playlist-item a',
       		'attr'		: 'rel'       			
       	};
       	
       	var options 	= $.extend({}, defaults, options),
       		self		= this,
       		player 		= $(this).find( options.player ),
       		video_player = false,
       		state 		= false,
       		items		= $(this).find( options.items );
       	
       	var initialize = function(){
       		
       		var playerData = decode_data( $(player).html() );
       		$.each( items, function(i, item){
       			
       			var itemData = decode_data( $(this).attr( options.attr ) );
       			$(this).data('video_data', itemData).removeAttr( options.attr );
       			if( 0 == i ){
       				var d 				= playerData;
       					d.video_id 		= itemData.video_id;
       					d.volume 		= itemData.volume; 
       					d.stateChange 	= playerState; 
       					
       				video_player = $(player).Vimeo_VideoPlayer(d); 
       				if( '1' == itemData.autoplay && !is_apple() ){
       					video_player.play();
       				}
       			}
       			
       			$(this).click(function(e){
       				e.preventDefault();
       				video_player.load( itemData.video_id );
       				video_player.setVolume( itemData.volume );
       				
       				if( '1' == itemData.autoplay && !is_apple() ){
       					video_player.play();
       				}
       			})
       			
       		});
       		
       		return self;
       	}
       	
       	var decode_data = function( raw_data ){
       		return $.parseJSON( raw_data.replace(/<!--|-->/g, '') );
       	}
       	
       	var playerState = function( s ){
       		state = s;
       	}
       	
       	var is_apple = function(){
			return /webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);			
		}
       	
       	return initialize();
	}	
})(jQuery);
