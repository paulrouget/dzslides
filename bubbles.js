/*
	name		: bubbles.js
	description	: Adds Captions and Subtitles support to HTML5 video
	url		: bubbles.childnodes.com
	Version	: 1.02 ( 28 / 07 / 2012 )
	
	//Change Log: 
		* VideoJS 3.0 Support
		* Added Audio Descriptionss
	____________________________________________________
	Author	:  Pantelis Kalogiros
	MIT Licensed <http://www.opensource.org/licenses/mit-license.php>
*/

function videoBubbles() {
	"use strict";
	
	var bubbles = this,	//private : refference to the main class
	    doc = document;	//private : keeping the document object stored
	
	this.all = {}; 		//public : instances of all of the videos / bubbles
	this.subs = {}; 	//public : instances of all of the videos / subtitles
	this.txt_desc = {}; //public : instances of all of the audio descriptions
	this.effects = {};  //public : list of all possible effects
	
	/**********************************
	 * instance 	- (node) instance of video node 
	 * id		- (string) id of element
	 * class_name - (string) extra class name for the container
	 *
	 * wraps the video in a vanila div container
	 * and returns a refference to it
	 * also initializes the bubbles for this specific video
	 *********************************/
	this.wrapObject = function( instance, id, class_name ) {
		var div = doc.createElement('div'),
		    parent = instance.parentNode,
		    nextEl = instance.nextSibling,
		    instPar = nextEl.parentNode,
		    inst2 = instance.cloneNode(true);
		
		div.className = "bubblesContainer " + class_name;
		//div.style.cssText = "width:" + instance.width + 'px;height:' + instance.height + 'px';
		
		div.appendChild( inst2 );
		instPar.insertBefore( div, nextEl );

		instPar.removeChild( instance );	

		return div;
	}
	
	/**********************************
	 * elem - (node) subtitle's div 
	 * test - (string) subtitle text/data 
	 * bool - (bool) if true, subtitle is display, if false subtitle's text is cleared
	 * 
	 * wraps the video in a vanila div container
	 * and returns a refference to it
	 * also initializes the bubbles for this specific video
	 *********************************/
	this.subtitleSHOW = function( elem, text, bool ) {
		if( bool )
			elem.innerHTML = text;
		else
			elem.innerHTML = "";
	};
	
	/**********************************
	 * obj 	- (node) video element
	 * id 		- (string) id of the element where the "templates" will be appened to
	 * template	- (string) placed within, will be the name of the subtitle's language
	 * 
	 * Appends to element with id ( id ), the various language names, for subtitles language selection
	 *********************************/
	this.subsLangSelect = function( obj, id, template ) {
		this.subsSelectData = { "obj" : obj, "id" : id, "template" : template }; 
		var el = doc.getElementById( id );
		
			this.subsPrepare = function( key, type ) {
				var subObj = bubbles[ type ][ obj.id ],
					tmpi = 0,
					tmpEl,
					str="";
					
				tmpEl = template.replace( "####", key );
				str += tmpEl;

				el.innerHTML += str;
				var elChildren = el.childNodes,
					elClen = elChildren.length;
				while( elClen-- > 0 )
				{
					elChildren[ elClen ].addEventListener('click', function() {
						var tmp = this.textContent;
						bubbles[ type ][ obj.id ].lang = tmp;
						
						if( bubbles[ type ][ obj.id ].showing )
							bubbles.subtitleSHOW( bubbles[ type ][ obj.id ].subCont, bubbles[ type ][ obj.id ][ tmp ][ bubbles[ type ][ obj.id ].active ].text, true ); //on
					}, false);
				}
			};
	};
	
	/**********************************
	 * strName 	- (string) name of the videoBubble that is going to be closed, 
	 * vidId 	- (string) id of the video object
	 * 
	 * removes (temporarilly a video bubble on mouse click of the 'close' link tag)
	 *********************************/
	this.close = function( strName, vidId  ) {
		var fullObj = bubbles.all[ vidId ][ strName ], //{ "data" : data, "object" : el, "flag" : false };
			effect = fullObj.data.effect[ 1 ];
		
		!effect && ( effect = "default" );
		bubbles.effects[ effect ]( fullObj.object,  fullObj.data, false ); //off with the fade effect
		
		if( fullObj.data.callbackEnd )
			fullObj.data.callbackEnd();
	};
	
	/**********************************
	 * args - (string) Array[ 0 ] = name of the bubble
	 * args - (object) Array[ 1 ] = json object data
	 *
	 * Creates and initializes a new videoBubble
	 *********************************/
	this.add = function( args ) {
		var data = args[ 1 ],
			el;
		
		data.className = "bubl " + data.className;
		
		switch( data.type ) {
			case "link" :
				el = doc.createElement('a');
				el.href = data.content;
				break;
				
			case "content" :
				el = doc.createElement('div');
				el.innerHTML = data.content + '<a class="close" onClick="Bubbles.close(' + "'" + args[ 0 ] + "'" + ',' + "'" + this.id + "'" + ');">X</a>';
				break;
				
			default:
				break;
		}
		var elStyle = el.style,
			dimensions = data.dimensions,
			position = data.position;
		
		if( dimensions.length > 0 ){
			//elStyle.width = dimensions[ 0 ];
			//elStyle.height = dimensions[ 1 ];
		}
		elStyle.top = position[ 0 ];
		elStyle.left = position[ 1 ];
		
		el.className = data.className;
		
		this.container.appendChild( el );
		
		if( typeof data.effect === "string" )
			data.effect = [ data.effect, data.effect ];
			
		bubbles.all[ this.id ][ (args[ 0 ]) ] = { "data" : data, "object" : el, "flag" : false };
	};
	
	/**********************************
	 * Name - (string) name of the bubble
	 *
	 * Removes (and destroys the element) of the specified videoBubble
	 *********************************/
	this.remove = function( Name ) {
		bubbles.all[ this.id ][ Name ].object.parentNode.removeChild( bubbles.all[ this.id ][ Name ].object );
		delete bubbles.all[ this.id ][ Name ];
	};
	
	/**********************************
	 * interval
	 *
	 * interval that iterates through all objects and checks 
	 * for toggling between active and inactive bubbles
	 *********************************/
	this.interval  = function() {
		/**********************************
		 * Calls itself - processes everything
		 *********************************/
		bubbles.timeout = setInterval( function() {
			//bubbles iteration
			
			for( var obj in bubbles.all) {
				//obj = video object id
				for( var key in bubbles.all[ obj ] ){
					//key = bubble name, bubbles.all[ obj ][ key ] --> data : data, object : obj-reff
					var tmp = bubbles.all[ obj ][ key ],
						el = doc.getElementById( obj ),
						recordedTime =  tmp.curTime,
						currentTime = el.currentTime,
						time = tmp.data.config,
						timeLen = time.length;
						
					if( currentTime === recordedTime )
						continue;
					else {
						tmp.curTime = currentTime;
					
						for( var i = 0; i < timeLen; )
						{
							if( !time[ i + 1 ] )
								time[ i + 1 ] = el.duration;
							
							if( currentTime > time[ i ] && currentTime < time[ i + 1 ] )
							{
								if( !tmp.flag )
									tmp.flag = true;
								break;
							}
							else
							{
								if( tmp.flag )
									tmp.flag = false;
							}					
							i += 2;
						}
						if( tmp.flag ){
							if( tmp.edit ){
								bubbles.effects[ (tmp.data.effect[ 0 ]) ]( tmp.object, tmp.data, true ); //on
								if( tmp.data.callback )
									tmp.data.callback();
								tmp.edit = false;
							}
						}
						else {
							if( !tmp.edit ){
								tmp.edit = true;
								bubbles.effects[ (tmp.data.effect[ 1 ]) ]( tmp.object, tmp.data, false ); //off
								if( tmp.data.callbackEnd )
									tmp.data.callbackEnd();
							}
						}
					}
				}
			}
			
			//subtitles iteration
			for( var obj in bubbles.subs) {
				
				var subsObj = bubbles.subs[ obj ],
					lang = subsObj.lang;
					
					if( !subsObj[ lang ] ) return 0; //not loaded yet
				
				var subLen = subsObj[ lang ].length,
					elem = subsObj.subCont,
					recordedTime = subsObj[ lang ].curTime,
					currentTime = doc.getElementById( obj ).currentTime + subsObj.syncNumber,
					i;
				
				if( currentTime === recordedTime )
					continue;
				else {
					i = subsObj.active;
					subsObj[ lang ].curTime = currentTime;
					
					if( recordedTime < currentTime ) { 
						if( ( subsObj[ lang ][ i ].end > currentTime && subsObj.showing ) ) continue;
						
						for( var dd = i; dd < subLen; dd++ )
							if( !bubbles.subtitleLoop( subsObj, currentTime, dd, lang, elem ) ) break;

						for( var dd = 0; dd < i; dd++ )
							if( !bubbles.subtitleLoop( subsObj, currentTime, dd, lang, elem ) ) break;
					}
					else if( recordedTime > currentTime )
						for( i = i; i >= 0; i-- )
							if( !bubbles.subtitleLoop( subsObj, currentTime, i, lang, elem ) ) break;
				}
			}
			
			for( var obj in bubbles.txt_desc) {
				var txt_desc = bubbles.txt_desc[ obj ],
					lang = txt_desc.lang;
					
					if( !txt_desc[ lang ] ) return 0; //not loaded yet
				
				var subLen = txt_desc[ lang ].length,
					elem = txt_desc.subCont,
					recordedTime = txt_desc[ lang ].curTime,
					currentTime = doc.getElementById( obj ).currentTime + txt_desc.syncNumber,
					i;
				
				if( currentTime === recordedTime )
					continue;
				else {
					i = txt_desc.active;
					txt_desc[ lang ].curTime = currentTime;
					
					if( recordedTime < currentTime ) { 
						if( ( txt_desc[ lang ][ i ].end > currentTime && txt_desc.showing ) ) continue;
						
						for( var dd = i; dd < subLen; dd++ )
							if( !bubbles.subtitleLoop( txt_desc, currentTime, dd, lang, elem ) ) break;

						for( var dd = 0; dd < i; dd++ )
							if( !bubbles.subtitleLoop( txt_desc, currentTime, dd, lang, elem ) ) break;
					}
					else if( recordedTime > currentTime )
						for( i = i; i >= 0; i-- )
							if( !bubbles.subtitleLoop( txt_desc, currentTime, i, lang, elem ) ) break;
				}
			}
			//setTimeout( bubbles.timeout, 340 ); //calls itself - not using set Timeout anymore because of a horrible Firefox 6 bug
		},	362);
		
		//bubbles.timeout(); -- same as above - it seemed that firefox 6 was misbehaving with setTimeout so it was dropped alltogether, despite it being the most "logic"-safe method
		
		//iterates through all subtitles objects
		this.subtitleLoop = function(subsObj, currentTime, i, lang, elem ){
			var tmp = subsObj[ lang ][ i ],
				timeStart = tmp.start,
				timeEnd = tmp.end;
				
			//mark subtitle as active
			if( currentTime > timeStart && currentTime < timeEnd )
			{	
				if( subsObj.active !== i || subsObj.showing === false )
				{	
					subsObj.active = i;
					bubbles.subtitleSHOW( elem, tmp.text, true ); //on
					subsObj.showing = true;
				}
				return false;
			}
			else
			{
				if( subsObj.active === i )
				{
					bubbles.subtitleSHOW( elem, tmp.text, false ); //off
					subsObj.showing = false;
				}
			}
			return true;	
		}
	};
	
	this.interval(); //initializing the interval
	
	/**********************************
	 * id 			- (string) video id
	 * container_class  	- (string) special class for the container?
	 * bubbleObject 	- (object) name, and json data
	 *
	 * VideoJS constructor
	 *********************************/
	this.videoJS = function( id, container_class, bubbleObject ) {
		return new bubbles.video( id, container_class, bubbleObject, true );
	};
	/**********************************
	 * id 			- (string) video id
	 * container_class  	- (string) special class for the container?
	 * bubbleObject 	- (object) name, and json data
	 *
	 * Video constructor
	 *********************************/
	this.video = function( id, container_class, bubbleObject, wrap ) {
		this.id = id;
		this.el = doc.getElementById( id );
		
		/**********************************
		 * bubbleObject	- (object) the captions to be added
		 *
		 * Adds a caption
		 *********************************/
		this.add = function( bubbleObject ) {
			for( var key in bubbleObject )
				 bubbles.add.call( this, [ key, bubbleObject[ key ] ] );
		};
		/**********************************
		 * Name	- (string) named of an existing object
		 *
		 * Deletes the caption with the specified name
		 *********************************/
		this.remove = function( Name ) {
			bubbles.remove.call( this,  Name );
		};
		/**********************************
		 * sec	- (int) time in seconds
		 * percent - (string / bool) 
		 *
		 * jumps to the specified second or percent value (for example 50, '%' or 50, true 
		 * jumpts to the middle of the video.
		 *********************************/
		this.jump = function( sec, percent ) {
			if( percent === true || percent === '%' )
				this.el.currentTime = (this.el.duration / 100) * sec;
			else
				this.el.currentTime = sec;
		};
		/**********************************
		 * id		- (string) id of container where the languages menu should be placed
		 * template	- (string) simple html code, needs to have #### as a marker
		 *
		 * Creates a basic and simple subtitles/language change menu
		 *********************************/
		this.subsLanguageSelect = function( id, template ) {
			bubbles.subsLangSelect( this.obj, id, template );
		}
		/**********************************
		 * number	- (float) numnber in seconds to "move" the subtitles
		 *
		 * For number -->   1, subtitles are delayed for 1 second
		 * For number ---> -1, subs appear faster by 1 second
		 *********************************/
		this.subsSync = function( number ) {
			bubbles.subs[ this.id ].syncNumber = number * -1;
		}
		/**********************************
		 * Toggles subtitles (hide/show)
		 *********************************/
		this.subsToggle = function() {
			var subContStyle = bubbles.subs[ this.id ].subCont.style;
			if( subContStyle.display == "none" )
				subContStyle.display = "block";
			else
				subContStyle.display = "none";
		};
		/**********************************
		 * bool	- (bool) true/false for hiding or showing
		 *
		 * If bool === true, then the subtitles are displayed
		 * otherwise hidden
		 *********************************/
		this.subsShow = function( bool ) {
			if( bool )
				subContStyle.display = "block";
			else
				subContStyle.display = "none";
		};	
		/**********************************
		 * newLang	- (string) name of subtitle language
		 *
		 * Makes the specified language, active
		 *********************************/
		this.langChange = function( newLang ) {
			bubbles.subs[ this.id ].lang = newLang;
						
			if( bubbles.subs[ this.id ].showing )
				bubbles.subtitleSHOW( bubbles.subs[ this.id ].subCont, bubbles.subs[ this.id ][ newLang ][ bubbles.subs[ this.id ].active ].text, true ); //on
		};
		
		//TEXT AUDIO DESCRIPTION
		this.text_description = function( request, object, lang, ariaLive ) {
			if( request === 1 )	//if request is set to 1, we use my own backend function
				this.request = "http://isqueel.com/bubbles/jsonsrt.php";
			else
				this.request = request;	//else we use the one specified (if set to false though we use the built in JS decoder)
				
			if( !lang )
				for( var kk in object )
				{
					lang = kk;
					break;
				}
			
			ariaLive = !ariaLive ? "assertive" : ariaLive;
			
			//adding the node
			var subHolder = doc.createElement( 'div' ),
				$th = this;
				
			this.el.parentNode.appendChild( subHolder );
			this.el.parentNode.style.overflow = "visible";
			
			subHolder.className = 'subtitles audio-description';
			subHolder.id = this.id  + '_audio-description';
			subHolder.setAttribute( 'aria-live', ariaLive );
			subHolder.setAttribute( 'aria-label', "Description Display" );
			subHolder.setAttribute( 'role', "region" );
			
			subHolder.style.cssText = 'opacity:0;display:block;';
			
			bubbles.txt_desc[ this.id ] = { "lang" : lang, "subCont" : subHolder, 'active' : 0, 'showing' : false, syncNumber : 0 };
			
			for( var key in object )
				  this.subsAdd( key, object[ key ], 'txt_desc' );
				  
			return this;
		};
		
		/**********************************
		 * request	- (int) type of srt parser :: 1 for pre-set, false, for JS, and url for custom
		 * object	- (object) subtitle initialization data/object
		 * lang 	- (string) default language
		 *
		 * Subtitles constructor
		 *********************************/
		this.subtitles = function( request, object, lang ) {
			
			if( request === 1 )	//if request is set to 1, we use my own backend function
				this.request = "http://isqueel.com/bubbles/jsonsrt.php";
			else
				this.request = request;	//else we use the one specified (if set to false though we use the built in JS decoder)
				
			if( !lang )
				for( var kk in object )
				{
					lang = kk;
					break;
				}
			
			//adding the node
			var subHolder = doc.createElement('div'),
				$th = this;
				
			this.el.parentNode.appendChild( subHolder );
			this.el.parentNode.style.overflow = "visible";
			
			subHolder.className = "subtitles";
			subHolder.id = this.id  + '_subs';
			
			bubbles.subs[ this.id ] = { "lang" : lang, "subCont" : document.getElementById( this.id  + '_subs' ), 'active' : 0, 'showing' : false, syncNumber : 0 };
			
			for( var key in object )
				  this.subsAdd( key, object[ key ], 'subs' );
				  
			return this;
		};
		this.subsAdd = function( key, obj, type ) {	//type can be subs or desc
		
			if( this.request ) //json object download from specified url
			{
				var http =  new XMLHttpRequest(),
					params = 'url=' + obj.file,
					qq = this;
				
				http.open('POST', this.request, true);
				http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				
				http.onreadystatechange = function() { 
					if (http.readyState == 4)
						if (http.status == 200)
							qq.subsReady( eval( http.responseText ), key, type );
				}
				http.send( params );
			}
			else //javascript parser call
			{
				var http =  new XMLHttpRequest(),
					qq = this;

				http.open( "GET", obj.file, true );
				
				http.onreadystatechange = function() {
					if (http.readyState == 4)
						if (http.status == 200)
							qq.subsReady( qq.subsParser( http.responseText ), key, type );
				}
				http.send();
			}
		};
		this.subsReady = function( subsArr, key, type ) {
			bubbles[ type ][ this.id ][ key ] = subsArr;
			
			if( !!bubbles.subsPrepare )
				bubbles.subsPrepare( key, type );			
		};
		
		/**********************
		* SRT time to seconds
		**********************/
		this.toSecs = function( t ) {
			var s = 0.0,
				p;
			if( t ) {
				p = [];
				p = t.split(':');
				
				for( var i = 0, pLen = p.length; i < pLen; i++ )
					s = s * 60 + parseFloat( p[ i ].replace(',', '.' ) );
			}
			return s;
		};
		
		/**********************
		* SRT JS Parser
		**********************/
		this.subsParser = function( obj ) {
			var fileLines = obj.split('\n'),
				len = fileLines.length - 1,
				ret = [],
				old_int = 0,
				j = 0,
				tmp,
				c,
				str="";
				
			for( var i = 0; i < len; i++ )
			{
				var string = fileLines[ i ].replace( /^\s+|\s+$/g, "" );

				if( !isNaN( string ) &&  parseInt( fileLines[ i ] ) === ( old_int + 1 ) )
				{
					++j;
					
					old_int = parseInt( fileLines[ i ] );
					ret[ j ] = [];
					
					tmp = [];
					tmp = fileLines[ ++i ].split( "-->" );
					
					ret[ j ][ "start" ]	= this.toSecs( tmp[ 0 ] );
					ret[ j ][ "end" ]	= this.toSecs( tmp[ 1 ] );
					ret[ j ][ "text" ]	= "";
					
					c = 0;
					
					while( fileLines[ i + ++c ].replace( /^\s+|\s+$/g, "" ) !== "" )
						ret[ j ][ "text" ] += fileLines[ i + c ].replace( /\n\r|\r\n|\n|\r/g, "<br />" );
				}
			}
				
			//printing the array
			tmp = ret.length;
			str = [];
			for( var i = 1; i < tmp; ++i )
			{
				str[ i - 1 ] = {
					start:	ret[ i ][ "start" ],
					end:	ret[ i ][ "end" ],
					text: 	ret[ i ][ "text" ]
				};
			}
			return str;
		};
		
		if( !container_class || typeof container_class !== "string" ){
			bubbleObject = container_class; 
			container_class = id;
		}
		
		bubbles.all[ id ] = {};	//initializing the video object within the bubbles.all storage
		
		//wrapping the video in it's own container
		if( !wrap )
			this.container = bubbles.wrapObject( this.el, id, container_class );
		else{
			if( this.el.getElementsByTagName('video')[0] )
				this.el = this.el.getElementsByTagName('video')[0];
				
			delete( bubbles.all[ id ] );
			id = this.el.id;
			this.id = id;

			bubbles.all[ id ] = {};
			this.container = this.el.parentNode;
			this.container.className += " " + container_class;
		}
		this.el = doc.getElementById( this.id );
		this.add( bubbleObject );
	}
}
var Bubbles = new videoBubbles(); //initalizing the videoBubbles class, we need only one instance for every control

//Adding the default Effects

/**********************
* object 	- (node) caption node
* data		- (object), contains info such as className, position, dimensions, timing etc
* mode		- (bool), true when showing caption, false when hiding it
*
*
* The purpose of this is... if mode == true, somehow make the object visible
* and if mode == false, make the object invisible - external libraries such as Dojo and jQuery can be used
* extensively for creating new effects and transitions for example
*
* //fade anim in jQuery
* Bubbles.effects['jqFade'] = function( object, data, mode ) {
* 	if( mode ) $( object ).fadeIn(600);
* 	else		 $( object ).fadeOut(200);
* };
*
* Also the data object can be used for keeping track of the desired state.
* Contents of the data object:

		type		: "content",
		effect		: ["slide", "fade"]
		className	: "bubbles2",
		content	: "<span> Hello World. And I am a sliding Box </span>",
		dimensions	: [ '110px', '17%' ],
		position 	: [ '100px', '200px' ],
		config	 	: [ 5, 8, 11, 15 ],

		callback	: function() {  "...stuff..." },
		callbackEnd	: function() {  "...stuff..." }
		
**********************/
Bubbles.effects['default'] = function( object, data, mode ) {
	if( mode )
		object.style.display = "block";
	else
		object.style.display = "none";
}
//END

//The following effects work ONLY if the correct CSS classes are included
//---------------------------SAMPLE CODE---------------------------------
Bubbles.effects['slide'] = function( object, data, mode ) {
	if( mode )
	{
		var objStyle = object.style,
			tmp = objStyle.top;
		
		objStyle.top = "-1024px";
		objStyle.display = "block";
		setTimeout( function() {
			object.className = data.className + ' topTransition';
			objStyle.top = tmp;
		}, 48);
	}
	else
	{
		var objStyle = object.style,
			tmp = objStyle.top;
			
		object.className = data.className + ' topTransition';
		
		setTimeout( function() {
			objStyle.display = "none";
			objStyle.top = data.position[ 0 ];
			object.className = data.className;
		}, 340);
		
		objStyle.top = "1248px";
	}	
}
Bubbles.effects['fade'] = function( object, data, mode ) {
	if( mode )
	{
		var objStyle = object.style;
		
		objStyle.opacity = 0;
		objStyle.display = "block";
		
		setTimeout( function() {
			object.className = data.className + ' fadeIn';
			objStyle.opacity = '';
		}, 48);
	}
	else
	{
		var objStyle = object.style,
			tmp = objStyle.top;
		
		setTimeout( function() {
			objStyle.display = "none";
			object.className = data.className;
		},340);
		
		object.className = data.className + ' fadeOut';
	}	
}
