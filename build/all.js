/**
 * Tencent weibo javascript library
 *
 * Provide the namespace with some core methods
 *
 * @author michalliu
 * @version 1.0
 * @module base
 */

/**
 * Constructor of SDK's error object
 *
 * Usage:
 *
 * throw QQWBError("message")
 *
 * //TODO: should we only export one variable in global namespace
 *
 * @access public
 *
 * function QQWBError(message) {
 *     this.message = message;
 *     this.stack = (new Error()).stack;
 * }
 * 
 * QQWBError.prototype = new Error;
 * QQWBError.prototype.name = "QQWBError";
 */

// base file
(function () {

    var 
        twb, // the internal namespace object
        originalT = window.T; // get a reference of window's T

    // Core base object
    twb = {

        /**
         * Human readable name for this sdk
         *
         * Used for debug propose
         *
         * @access private
         */
        _name: "Tencent weibo SDK",
        /**
         * Client appkey
         *
         * @access private
         */
        _appkey: "{APPKEY}"

        /**
         * Indicate appkey is valid or not
         *
         * Is the http referer matched with the url registered by this appkey?
         * If appkey is not verified,you may not use this sdk
         *
         * @access private
         */
       ,_appkeyVerified: "{APPKEY_VERIFIED}" === "verified" // validate appid with referer url

        /**
         * Debug mode
         *
         * Speak pointless babble
         *
         * @access private
         */
       ,_debug: true

        /**
         * Domain configration
         *
         * @access private
         */
       ,_domain: {
           api: "{API_URI}"
          ,cdn: "{CDN_URI}"
          ,auth: "{AUTH_URI}"
          ,exchange: "{EXCHANGE_TOKEN_URI}"
          ,query: "{QUERY_TOKEN_URI}"
          ,clientproxy: "{CLIENTPROXY_URI}" // auth redirect_url
          ,serverproxy: "{SERVERPROXY_URI}" // server html proxy
          ,flashproxy: "{FLASHPROXY_URI}" // flash proxy
        }
        /**
         * Cookie configration
         *
         * @access private
         */
       ,_cookie: {
           names: {
               accessToken: "QQWBToken"
              ,refreshToken: "QQWBRefreshToken"
           }
          ,path: "/"
          ,domain: ""
        }
        /**
         * Rollback window's T to its original value
         *
         * @access public
         * @return {Object} The internal twb object
         */
       ,noConflict: function () {
           originalT && (window.T = originalT);
           return twb;
       }

        /**
         * Copy things from source into target
         *
         * @access public
         * @return {Object} The *modified* target object
         */
       ,copy: function (target, source, overwrite, transform) {
           for (var key in source) {
               if (overwrite || typeof target[key] === "undefined") {
                   target[key] = transform ? transform(source[key]) : source[key];
               }
           }
           return target;
       }

        /**
         * Create sub namespace
         *
         * @access public
         * @return {Object} The created object 
         */
       ,create: function (name, value) {
           var 
               node = this, // this is our root namespace
               nameParts = name ? name.split(".") : [],
               c = nameParts.length;
           for (var i=0; i<c; i++) {
               var
                   part = nameParts[i],
                   nso = node[part];
               if (!nso) {
                   nso = (value && i + 1 === c) ? value : {};
                   node[part] = nso;
               }
               node = nso;
           }
           return node;
       }

        /**
         * Extends root namespace and create sub namespace if needs
         *
         * @access public
         * @return {Object} The *modified* target
         */
       ,extend: function (target, source, overwrite) {
           return twb.copy(
               typeof target === 'string' ? twb.create.call(this, target) : target
              ,source
              ,overwrite
           );
       }

       /**
        * Alias names
        *
        * @access private
        * @return {Void}
        */
       ,_alias: function (alias, origin) {
           origin = origin || twb;
           if(typeof alias === 'string') {
               this[alias] = origin;
           } else if (typeof alias === 'object' && alias.constructor === Array) {
               for (var i=0,l=alias.length;i<l;i++) {
                   this[alias[i]] = origin;
               }
           }
       }

       /**
        * Alias names for twb
        *
        * @deprecated not recommended
        * @access public
        * @return {Void}
        */
       ,alias: function (alias, origin) {
           twb._alias(alias, twb[origin]);
       }

       /**
        * Assign template vars with value
        *
        * Usage:
        *
        * 1). replace T._appkey from "{APPKEY}" to "123456"
        *     T.assign("_appkey","APPKEY","123456")
        * 
        * 2). search in namespace T replace all from "{APPKEY}" to "123456"
        *     T.assign("","APPKEY","123456")
        *
        * 3). replace T.test._appkey from "{APPKEY}" to "123456"
        *     T.assign("test._appkey","APPKEY","123456")
        * 
        * 4). search in namespace T.test replace all from "{APPKEY}" to "123456"
        *     T.assign("test","APPKEY","123456")
        *
        * @deprecated render template vars by js
        * @access public
        * @param name {String} namespace
        * @param replace {String} template vars
        * @param value {String} replaced value
        * @return {Void}
        * @throws {Error}
        */
       ,assign: function (name, key, value) {
            var
                node = this,
                lastNode = node,
                nameParts = name ? name.split(".") : [],
                c = nameParts.length;

            for (var i=0; i<c; i++) {
                var
                    part = nameParts[i],
                    nso = node[part];
                if (!nso) { // should we use break here?
                    throw new Error("Tencent weibo SDK: [ERROR] no such name " + part);
                }
                lastNode = node;
                node = nso;
            }

            // node is either value of name or namespace
            if (typeof node === "string") { // value goes here
                lastNode[part] = node.replace(new RegExp("\\{" + key + "\\}","ig"),value);
            } else if (typeof node === "object") { // namespace object goes here
                for (var prop in node) {
                    if (node.hasOwnProperty(prop) && typeof node[prop] === "string") {
                        node[prop] = node[prop].replace(new RegExp("\\{" + key + "\\}","ig"),value);
                    }
                }
            }
       }

        /**
         * Generate a random id
         *
         * @access public
         * @return {String} The ramdom ID
         */
       ,uid: function () {
           return Math.random().toString(16).substr(2);
       }

    };

    // alternative names for interal function
    twb.alias('provide','create'); // provide a specific function
    
    // expose variable
    twb._alias.call(window,["QQWB","T"],twb); // we probably should only export one global variable

    twb.assign("_domain","API_URI","http://test.svr.net/apphost/oauth/api.php"); // no trailer slash   
    twb.assign("_domain","AUTH_URI","http://test.svr.net/apphost/oauth/authorize.php");   
    twb.assign("_domain","EXCHANGE_TOKEN_URI","http://test.svr.net/apphost/oauth/exchangeToken.php");   
    twb.assign("_domain","QUERY_TOKEN_URI","http://test.svr.net/apphost/oauth/queryToken.php");   
    twb.assign("_domain","SERVERPROXY_URI","http://test.svr.net/apphost/proxy/proxy.html");   
    twb.assign("_domain","FLASHPROXY_URI","http://test.svr.net/apphost/proxy/proxy.swf");   

}());
/**
 * Tencent weibo javascript library
 *
 * format string with python style
 *
 * @author michalliu
 * @version 1.0
 * @package format
 * @module sprintf
 * @requires base
 */

/**
 * sprintf() for JavaScript 0.7-beta1
 * http://www.diveintojavascript.com/projects/javascript-sprintf
 * 
 * Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of sprintf() for JavaScript nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (){
    var sprintf = (function() {
    	function get_type(variable) {
    		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    	}
    	function str_repeat(input, multiplier) {
    		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
    		return output.join('');
    	}
    
    	var str_format = function() {
    		if (!str_format.cache.hasOwnProperty(arguments[0])) {
    			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
    		}
    		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    	};
    
    	str_format.format = function(parse_tree, argv) {
    		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
    		for (i = 0; i < tree_length; i++) {
    			node_type = get_type(parse_tree[i]);
    			if (node_type === 'string') {
    				output.push(parse_tree[i]);
    			}
    			else if (node_type === 'array') {
    				match = parse_tree[i]; // convenience purposes only
    				if (match[2]) { // keyword argument
    					arg = argv[cursor];
    					for (k = 0; k < match[2].length; k++) {
    						if (!arg.hasOwnProperty(match[2][k])) {
    							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
    						}
    						arg = arg[match[2][k]];
    					}
    				}
    				else if (match[1]) { // positional argument (explicit)
    					arg = argv[match[1]];
    				}
    				else { // positional argument (implicit)
    					arg = argv[cursor++];
    				}
    
    				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
    					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
    				}
    				switch (match[8]) {
    					case 'b': arg = arg.toString(2); break;
    					case 'c': arg = String.fromCharCode(arg); break;
    					case 'd': arg = parseInt(arg, 10); break;
    					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
    					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
    					case 'o': arg = arg.toString(8); break;
                        //case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                        case 's': arg = ((arg = arg ? String(arg):"") && match[7] ? arg.substring(0, match[7]) : arg); break;
    					case 'u': arg = Math.abs(arg); break;
    					case 'x': arg = arg.toString(16); break;
    					case 'X': arg = arg.toString(16).toUpperCase(); break;
    				}
    				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
    				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
    				pad_length = match[6] - String(arg).length;
    				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
    				output.push(match[5] ? arg + pad : pad + arg);
    			}
    		}
    		return output.join('');
    	};
    
    	str_format.cache = {};
    
    	str_format.parse = function(fmt) {
    		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
    		while (_fmt) {
    			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
    				parse_tree.push(match[0]);
    			}
    			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
    				parse_tree.push('%');
    			}
    			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
    				if (match[2]) {
    					arg_names |= 1;
    					var field_list = [], replacement_field = match[2], field_match = [];
    					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
    						field_list.push(field_match[1]);
    						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
    							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
    								field_list.push(field_match[1]);
    							}
    							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
    								field_list.push(field_match[1]);
    							}
    							else {
    								throw('[sprintf] huh?');
    							}
    						}
    					}
    					else {
    						throw('[sprintf] huh?');
    					}
    					match[2] = field_list;
    				}
    				else {
    					arg_names |= 2;
    				}
    				if (arg_names === 3) {
    					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
    				}
    				parse_tree.push(match);
    			}
    			else {
    				throw('[sprintf] huh?');
    			}
    			_fmt = _fmt.substring(match[0].length);
    		}
    		return parse_tree;
    	};
    
    	return str_format;
    })();

    var vsprintf = function(fmt, argv) {
    	argv.unshift(fmt);
    	return sprintf.apply(null, argv);
    };

    QQWB.extend("format", {

        sprintf: sprintf

       ,vsprintf: vsprintf
    })

}());
/**
 * Tencent weibo javascript library
 *
 * Time
 *
 * Example:
 * 
 * T.time.getTime()
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module time
 * @requires base
 *           format.sprintf
 */

QQWB.extend("time", {
    /**
     * Get current time stamp in milliseconds
     *
     * @access public
     * @return {Date} current date
     */
    now: function () {
        return +this.dateNow();
    }
    /**
     * Get current time stamp in seconds
     *
     * @access public
     * @return {Date} current date
     */
   ,secondsNow: function () {
        return Math.round(this.now() / 1000);
    }
    /**
     * Get current time stamp
     *
     * @access public
     * @return {Date} current date
     */
    ,dateNow: function () {
        return new Date;
    }
    /**
     * Get a short time description
     * 
     * Example:
     * 
     * T.time.shortTime(); // output is 08:04:34
     * T.time.shortTime(new Date()); // output date
     * T.time.shortTime(new Date(),"%(year)s"); // output date with format
     * T.time.shortTime("%(year)s"); // output current date with format
     *
     * @access public
     * @param date {Date} date or current date if date not provided
     *        format {String} format of date object        
     * @return {String} formatted time string
     */
   ,shortTime: function (date, format) {
        if (!(date instanceof Date)) {
            format = date;
            date = this.dateNow();
        }
        format = format || "%(year)s/%(month)s/%(day)s %(hour)02d:%(minute)02d:%(second)02d";
        return QQWB.format.sprintf(format,{
            year: date.getFullYear()
           ,month: date.getMonth()
           ,day: date.getDate()
           ,hour: date.getHours()
           ,minute: date.getMinutes()
           ,second: date.getSeconds()
        });
    }
});

/**
 * Tencent weibo javascript library
 *
 * Log messages
 *
 * Example:
 * 
 * T.log.info("your message")
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module log
 * @requires base
 *           time
 *           format.sprintf
 */

QQWB.extend("log", {
	
	 // critical level
     CRITICAL: 50

	 // error level
    ,ERROR: 40

	 // warning level
    ,WARNING: 30

	 // infomation level
    ,INFO: 20

	 // debug level
    ,DEBUG: 10

	 // notset level, will log out all the messages
    ,NOTSET: 0

	// log level messages less than this level will be ingored
	// default level set to QQWB.log.NOTSET
    ,_level: 0 

	// log message format
    //,_format:"{{name}} : [{{levelname}}] {{time}} {{message}}"

	// log message format
    ,_format:"%(frame)s%(name)s: [%(levelname)s] %(time)s %(message)s"

	/**
	 * Set log message level
	 * 
	 * @access public
	 * @param level {Number} log level
	 * @return {Object} log object
	 */
    ,setLevel: function (level) {
        this._level = level;
        return this;
     }

	/**
	 * Set log message format
	 * 
	 * @access public
	 * @param format {String} log format
	 * @return {Object} log object
	 */
    ,setFormat: function (format) {
        this._format = format;
		return this;
     }

	/**
	 * Log a debug message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,debug: function (message) {
        this.DEBUG >= this._level && this._out("DEBUG",message);
        return this;
     }

	/**
	 * Log a info message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,info: function (message) {
        this.INFO >= this._level && this._out("INFO",message);
        return this;
     }

	/**
	 * Log a warning message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,warning: function (message) {
        this.WARNING >= this._level && this._out("WARNING",message);
        return this;
     }

	/**
	 * Log a error message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,error: function (message) {
        this.ERROR >= this._level && this._out("ERROR",message);
        return this;
     }

	/**
	 * Log a critical message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,critical: function (message) {
        this.CRITICAL >= this._level && this._out("CRITICAL",message);
        return this;
     }

	/**
	 * Log out message
	 *
	 * @access private
	 * @param level {String} message level
	 *        message {String} message to log out
	 * @return {Void}
	 */
    ,_out: function (level,message) {
        var output = this._format;
        //output = output.replace("{{time}}", this._getTime())
                       //.replace("{{levelname}}", level)
                       //.replace("{{name}}", QQWB._name)
                       //.replace("{{message}}", message);
        //output = output.replace(/\{\{.*?\}\}/g,output);
        output = QQWB.format.sprintf(output,{
            name: QQWB._name
           ,levelname: level
           ,time: QQWB.time.shortTime()
           ,message: message
           ,frame: window != window.parent ? "*":""
        });

        // no frame messages
        QQWB._debug && window.console && window.console.log(output);
     }
});

/**
 * Tencent weibo javascript library
 *
 * Cookie manipulation
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module cookie
 * @requires base
 *           log
 */

QQWB.extend("cookie", {
    /**
     * Set cookie
     *
     * @param name {String} cookie name
     *        value {String} cookie value
     *        maxage {Number} seconds from now. If present -1 it means a session cookie(default by browser)
     *        path {String} cookie path. If not present then use full request path(default by browser)
     *        domain {String} cookie domain. If not present then use full request host name(default by browser)
     * @access public
     * @return {Void}
     */
    set: function (name, value, opt_maxage, opt_path, opt_domain) {

       if ( typeof opt_maxage === "undefined" || opt_maxage === null) {
           opt_maxage = -1;
       }

       var cookieDomain = opt_domain ? "domain=" + opt_domain : "";
       var cookiePath = opt_path ? "path=" + opt_path : "";
       var cookieExpire = "";

       if (opt_maxage === 0) {
           // expire the cookie
           cookieExpire = "expires=" + new Date(1970,1,1).toUTCString();
       } else if (opt_maxage > 0) {
           cookieExpire = "expires=" + new Date(+new Date+opt_maxage*1000).toUTCString();
       }

       document.cookie = [name + "=" + value, cookieExpire, cookiePath, cookieDomain].join("; ");

       return this;
    }

    /**
     * Return the first value for the given cookie name 
     *
     * @access public
     * @param name {String} cookie name
     * @return {String} value for cookie
     */
   ,get: function (name) {
       var 
           cookieName = name + "=";
           cookies = (document.cookie || "").split(/\s*;\s*/);
       for (var i=0,l=cookies.length; i<l; i++) {
           var cookie = cookies[i];
           if (cookie.indexOf(cookieName) === 0) {
               return cookie.substr(cookieName.length);
           }
       }
    }

    /**
     * Delete cookie
     *
     * @access public
     * @param name {String} cookie name
     *        opt_path {String} the path of cookie
     *        opt_domain {String} the domain of cookie
     * @return {Void}
     */
   ,del: function (name, opt_path, opt_domain) {

       this.set(name, '', 0, opt_path, opt_domain);

       if (document.cookie.indexOf(name+"=") >= 0) {
           QQWB.log.warning("Cookie may not be deleted as you expected");
       }

       return this;
    }
});
/**
 * Tencent weibo javascript library
 *
 * Function extension
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module Function
 * @requires base
 */
QQWB.extend("Function",{
    /**
     * Determine whether an object is Function
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isFunction: function (arg) {
        return typeof arg === "function";
    }
});
/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * //TODO: encoding libraries
 *
 * http://www.cnblogs.com/cgli/archive/2011/05/17/2048869.html
 * http://www.blueidea.com/tech/web/2006/3622.asp
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module String
 * @requires base
 */
QQWB.extend("String",{
    /**
     * Determine whether an object is string
     *
     * @access public
     * @param source {Mixed} anything
     * @return {Boolean}
     */
    isString: function (source) {
        return typeof source === "string";
    }

});
/**
 * Tencent weibo javascript library
 *
 * Array extension
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module Array
 * @requires base
 *           String
 */
QQWB.extend("Array",{
    /**
     * Get whether an object is array
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isArray: function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    }
    /**
     * Get whether an object in the array
     *
     * @access public
     * @param arr {Array} the array object
     *        arg {Mixed} anything
     * @return {Boolean}
     */
   ,inArray: function (arr, arg) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (arg === arr[i]) {
               return true;
           }
       }
       return false;
    }
    /**
     * Build array from String
     *
     * @access public
     * @param source {String} the source string
     * @param optSep {Regexp|String} the seprator passed into String.split method
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromString: function (source, optSep, optMax) {
       if (!QQWB.String.isString(source)) {
           return [];
       } 
       optSep = optSep || "";
       return optMax ? source.split(optSep, optMax) : source.split(optSep);
    }
    /**
     * Build array from an array-like object
     *
     * @access public
     * @param source {Object} the source object
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromArguments: function (source, optMax) {
       if (typeof source !== "object") {
           return [];
       } 
       return optMax ? Array.prototype.slice.call(source, optMax) : Array.prototype.slice.call(source);
    }
    /**
     * Argument object to array
     * 
     * @deprecated use fromString,fromArguments instead
     * @access public
     * @param arg {Mixed} source
     * @return {Array}
     */
   ,toArray: function (arg) {
       if (typeof arg == "string") {
           return arg.split("");
       } else if (typeof arg == "object") {
           return Array.prototype.slice.call(arg,0);
       } else {
           return this.toArray(arg.toString());
       }
    }
    /**
     * Enumerate the array
     *
     * Note:
     * If handler executed and returned false,
     * The enumeration will stop immediately
     *
     * @access public
     * @param arr {Array} the array object
     *        handler {Function} the callback function
     */
   ,each: function (arr, handler) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (false === handler(i,arr[i])) {
               break;
           }
       }
    }
});
/**
 * Tencent weibo javascript library
 *
 * Deferred object
 *
 * Note:
 *
 * Code is ported from jquery
 * A good explaination at 
 * http://stackoverflow.com/questions/4866721/what-are-deferred-objects/4867928#comment-8591160
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module deferred
 * @requires base
 *           ext.Array
 *           ext.Function
 */

QQWB.extend("deferred", {
	 /**
	  * Deferered object read-only methods
	  */
	_promiseMethods: "done fail isResolved isRejected promise then always success error complete whatever".split(" ")
	/**
	 * Create a simple deferred object (one callback list)
	 *
	 * @access private
	 * @return a deferred object
	 */
   ,_deferred: function () {
		var 
		    callbacks = [], // callback list
			fired, // stored [ context, args], use to fire again
			firing, // to avoid firing when already doing so
			cancelled, // flag to know if the deferred has been cancelled
			deferred = { // the deferred itself
				done: function () {
					if (!cancelled) {
						var 
						    args = arguments
						   ,elem
						   ,_fired;

						   // we should consider about fired status here
						   // this is neccesary to handle how done deals
						   // with arrays recursively
						   if (fired) {
							   _fired = fired;
							   fired = 0;
						   }

						   // add callbacks smartly
						   for (var i=0,l=args.length; i<l; i++) { 
							    elem = args[i];
							    if (QQWB.Array.isArray(elem)) {
								   deferred.done.apply(deferred, elem);
							   } else if (QQWB.Function.isFunction(elem)) {
								   callbacks.push(elem);
						    	}
						   }

						   // consider fired here
						   // if it's already been resolved then call resolveWith
						   // using the cached context and arguments to call the 
						   // callbacks immediatly
						   if (_fired) {
							   deferred.resolveWith(_fired[0], _fired[1]);
						   }
					}
					return this;
				}

				// resolve with given context and args
			   ,resolveWith: function (context, args) {
				   // if its been cancelled then we can't resolve
				   // if it has fired then we can't fire again
				   // if it's currently firing then we can't fire
				   if (!cancelled && !fired && !firing) {
					   args = args || [];
					   firing = 1;
					   // using try {} finally {} block because you are
					   // calling external callbacks, maybe these callbacks
					   // made by the user which are not bugfree.

					   // the finally block will always run no matter how bad
					   // the internal code is
					   try { 
					       while (callbacks[0]) {
							   callbacks.shift().apply(context, args);// first in first out
						   }
					   }
					   finally {
						   fired = [context, args]; // cache the the context and args
						   firing = 0;
					   }
				   }
				   return this;
			    }

				// Resolve with this as context and given arguments
			   ,resolve: function () {
				   deferred.resolveWith(this, arguments);
				   return this;
			    }

				// Has this deferred been resolved?
			   ,isResolved: function () {
				   return !!(firing || fired);
			    }
				// Cancel
			   ,cancel: function () {
				   cancelled = 1;
				   callbacks = [];
				   return this;
			    }
	    };
		return deferred;
	}
	/**
	 * Full fledged deferred (two callback list success and fail)
	 */
   ,deferred: function (func) {
	   var
	       promise,
	       deferred = QQWB.deferred._deferred(),
	       failDeferred = QQWB.deferred._deferred();

	   // Add errorDeferred methods, then and promise
	   QQWB.extend(deferred, {
		   // send to failed deferred object
		   fail: failDeferred.done
		   // send to sucess callback and failcallbacks at a time
		  ,then: function (doneCallbacks, failCallbacks) {
			  deferred.done(doneCallbacks).fail(failCallbacks);
			  return this;
		   }
		   // send to success callback and to fail callback aslo
		  ,always: function () {
			  return deferred.done.apply(deferred, arguments).fail.apply(this, arguments);
		   }
		   // invoke callbacks in failed deferred with context and arguments
		  ,rejectWith: failDeferred.resolveWith
		   // invoke callbacks in failed deferred
		  ,reject: failDeferred.resolve
		   // is callbacks in failed deferred invoked
		  ,isRejected: failDeferred.isResolved
		  // promise to return a read-only copy(cant call resolve resolveWith
		  // reject and rejectWith) of deferred
		  ,promise: function (obj) {
			  if (obj == null) {
				  if (promise) {
				      return promise;
				  }
				  promise = obj = {};
			  }
			  var i = QQWB.deferred._promiseMethods.length;
			  while (i--) {
				  obj[QQWB.deferred._promiseMethods[i]] = deferred[QQWB.deferred._promiseMethods[i]];
			  }
			  return obj;
		   }
	   });

	   // lovely alternative function names
	   deferred.success = deferred.done;
       deferred.error = deferred.fail;
       deferred.complete = deferred.whatever = deferred.always;

	   // funciton either success or fail
	   // if success fail deferer will cancel,vice versa
	   deferred.done(failDeferred.cancel).fail(deferred.cancel);

	   // unexpose cancel
	   delete deferred.cancel;

	   // a chance allow outer function to get a pointer to deferred object
	   func &&  func.call(deferred, deferred);

	   return deferred;
    }
	/**
	 * Deferred helper
	 */
   ,when: function (firstParam) {
	   var 
	       args = arguments,
		   length = args.length,
		   count = length,
		   deferred = length <= 1 && firstParam && QQWB.Function.isFunction(firstParam.promise) ?
		              firstParam :
					  QQWB.deferred.deferred(); // generate a deferred object or use the exists one

	    function resolveFunc (i) {
			return function (value) {
				args[i] = arguments.length > 1 ? QQWB.Array.fromArguments(arguments) : value;
				if (!(--count)) { // the last operation is resolved, resolve the when deffered
					deferred.resolveWith(deferred, QQWB.Array.fromArguments(args));
				}
			}
		}

		if (length > 1) { // more than one deferred object
		    for ( var i=0; i < length; i++) {
				if (args[i] && QQWB.Function.isFunction(args[i].promise)) { // arg is deferred object
				    // deferred.reject will called if any operation in when in rejected
				    args[i].promise().then(resolveFunc[i],deferred.reject);
				} else { // ingore arg that not a deferred object
					--count; // total arg -- 
				}

				if (!count) { // nothing is deferred
				    deferred.resolveWith (deferred, args);// let new deferred object handle it
				}
			}
		} else if ( deferred !== firstParam) {
			deferred.resolveWith(deferred, length ? [firstParam] : []);
		}

		return deferred.promise();
    }
});

/**
 * Tencent weibo javascript library
 *
 * Querystring encoder and decoder
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module queryString
 * @requires base
 */

QQWB.extend("queryString",{
    /**
     * Encode parameter object to query string
     *
     * @access public
     * @param params {Object} the object contains params
     *        opt_sep {String} the seprator string, default is '&'
     *        opt_encode {Function} the function to encode param, default is encodeURIComponent
     * @return {String} the encoded query string
     */
    encode: function (params, opt_sep, opt_encode) {
        var 
            regexp = /%20/g,
            sep = opt_sep || '&',
            encode = opt_encode || encodeURIComponent,
            pairs = [];

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var val = params[key];
                if (val !== null && typeof val != 'undefined') {
                    pairs.push(encode(key).replace(regexp,"+") + "=" + encode(val).replace(regexp,"+"));
                }
            }
        }

        pairs.sort();
        return pairs.join(sep);
    }
    /**
     * Decode query string to parameter object
     *
     * @param str {String} query string
     *        opt_sep {String} the seprator string default is '&'
     *        opt_decode {Function} the function to decode string default is decodeURIComponent
     * @return {Object} the parameter object
     */
   ,decode: function (str, opt_sep, opt_decode) {
       var
           decode = opt_decode || decodeURIComponent,
           sep = opt_sep || '&',
           parts = str.split(sep),
           params = {},
           pair;

       for (var i = 0,l = parts.length; i<l; i++) {
           pair = parts[i].split('=',2);
           if (pair && pair[0]) {
               params[decode(pair[0])] = decode(pair[1]);
           }
       }

       return params;
    }
});
/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module XML
 * @requires base
 */
QQWB.extend("XML",{
    /**
     * Determine is XML object or not
     *
     * @access public
     * @param xml {Object} xml object
     * @return {Boolean}
     */
    isXML: function (xml) {
       //TODO: not implement yet
    }
    /**
     * xml object to string
     *
     * @access public
     * @param xml {Object} xml object
     * @return {String}
     */
   ,toString: function (xml) {
        var str;
        if (window.ActiveXObject) {
            str = xml.xml;
        } else {
            str = (new XMLSerializer()).serializeToString(xml);
        }
        return str;
    }
    /**
     * create xml object from string
     *
     * @access public
     * @param str {String} xml string
     * @return {Object} xml object
     */
   ,fromString: function (str) {
       var xml;
       if (window.ActiveXObject) {
           xml = new ActiveXObject("Microsoft.XMLDOM");
           xml.async = "false";
           xml.loadXML(str);
       } else {
           var parser = new DOMParser();
           xml = parser.parseFromString(str, "text/xml");
       }
       return xml;
    }
});
/**
 * Tencent weibo javascript library
 *
 * JSON manipulate
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module JSON
 * @requires base
 *           String
 */
QQWB.extend("JSON",{
    /**
     * Get JSON Object from string
     *
     * @access public
     * @param source {String} the source string
     * @throws {SyntaxError} sytaxError if failed to parse string to JSON object
     * @return {Object} json object
     */
    fromString: function (source) {
        if (!source || !QQWB.String.isString(source)) {
            return {};
        } else {
            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            source = source.replace(/^\s+/,"").replace(/\s+$/,"");

            if ( window.JSON && window.JSON.parse ) {
                source = window.JSON.parse( source );
            } else {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if ( /^[\],:{}\s]*$/.test( source.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
                    .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
                    .replace( /(?:^|:|,)(?:\s*\[)+/g, "")) ) {

                    source = (new Function( "return " + data ))();
                } else {
                    throw new SyntaxError ("Invalid JSON: " + source);
                }
            }

            return source;
        } // end if
    } // end fromString
});
/**
 * Tencent weibo javascript library
 *
 * Input and output,AJAX,JSONP
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module io
 * @requires base
 *           queryString
 *           deferred
 *           ext.XML
 *           ext.JSON
 */

QQWB.extend("io", {
    /**
     * The script IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
    _IOScript: function (cfg) {
        var 
            script,
            head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
        return {
            send: function (complete) {
                script = document.createElement("script");
                script.async = "async";

                if (cfg.charset) {
                    script.charset = cfg.charset;
                }

                script.src = cfg.url;

                script.onload = script.onreadystatechange = function (e,isAbort) {

                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }

                        script = null;

                        !isAbort && complete && complete.apply(QQWB,[200,"success"]);
                        isAbort && complete && complete.apply(QQWB,[-1,"aborted"]);
                    }
                };

                script.onerror = function (e) { // ie 6/7/8/opera not supported(not tested)
                    complete && complete.apply(QQWB,[404,e]);
                };

                head.insertBefore(script, head.firstChild);
            }

           ,abort: function () {
               if (script) {
                   script.onload(0,1);
               }
            }
        };
    }

    /**
     * The AJAX IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for ajax io
     * @return {Object} to send/abort the request
     */
   ,_IOAjax: function (cfg) {
	   
	   var callback,
	       cfg = cfg || {},
	       xhr = window.XMLHttpRequest ? 
	             new window.XMLHttpRequest() :
	             new window.ActiveXObject("Microsoft.XMLHTTP");

       if (cfg.dataType) {
           cfg.dataType = cfg.dataType.toLowerCase();
       }

       if (!cfg.async) {
           cfg.async = "async";
       }

	   return {
		   send: function (complete) {

			   if (cfg.username) {
				   xhr.open(cfg.type, cfg.url, cfg.async, cfg.username, cfg.password);
			   } else {
				   xhr.open(cfg.type, cfg.url, cfg.async);
			   }

			   try {
                   if (cfg.type == "POST") {
                       xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                   }
				   xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
			   } catch (ex) {}

			   xhr.send(cfg.data || null);

			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml;

				   try {
					   // never called and (is aborted or complete)
				       if (callback && (isAbort || xhr.readyState === 4)) {
						   
						   // only call once
						   callback = null;

						   if (isAbort) {
							   if (xhr.readyState !== 4) {
								   xhr.abort();
							   }
						    } else {
								status = xhr.status;
								responseHeaders = xhr.getAllResponseHeaders();
								responses = {};
								xml = xhr.responseXML;

								if (xml && xml.documentElement) {
								    responses.xml = xml;
								}

								responses.text = xhr.responseText;

								try {
								    statusText = xhr.statusText;
								} catch (webkitException) {
									statusText = "";
								}

								if (status === 1223) {
								    status = 204;
								}

                                // parse to JSON
                                if (cfg.dataType == "json") {
									response = QQWB.JSON.fromString(responses.text);
                                } else if (cfg.dataType == "xml") { // parse to xml
                                    response = responses.xml;
                                } else { // as normal text
                                    response = responses.text;
                                }

					    	}
					   }
			       } catch (firefoxException) {
					   if (!isAbort) {
					       complete(-1, firefoxException);
					   }
			       }

				   if (response) {
					   complete(status, statusText, response, responseHeaders, cfg.dataType); // take cfg.dataType back
				   }
			   };

			   if (!cfg.async || xhr.readyState === 4) {
			       callback();
			   } else {
				   xhr.onreadystatechange = callback;
			   }
		   }
		  ,abort: function () {
			  if (callback) {
			      callback(0, 1);
			  }
		   }
	   };
	   
    }
    /**
     * The Flash IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
   ,_IOFlash: function (cfg) {

	   var callback,
	       readyState,
	       cfg = cfg || {};
	   
       if (cfg.dataType) {
	       cfg.dataType = cfg.dataType.toLowerCase();
	   }

	   return {
		   send: function (complete) {

			   readyState = 1;
               // the call is allowed call once
			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml,
					   readyState = 4;

				   try{
				       if (callback && (isAbort || readyState == 4)) {

				           callback = null;

				           if (isAbort) {
				        	   complete(-1, "request has aborted");
				           } else {
				        	   var success = /complete/i.test(_.type);
				        	   status = success ? 200 : 204;
				        	   statusText = success ? "ok" : _.type;
				        	   responseHeaders = "";
				        	   responses = {}; // internal object
				        	   responses.text = _.target.data;

				        	   if (cfg.dataType == "json") {
				        		   response = QQWB.JSON.fromString(responses.text);
                               } else if (cfg.dataType == "xml"){
				        		   response = QQWB.XML.fromString(responses.text);
                               } else {
				        		   response = responses.text;
                               }
				           }

				           // has response
				           if (response) {
				        	   complete(status, statusText, response, responseHeaders);
				           }
					   }
					} catch (ex) {
						if (!isAbort) {
							complete(-1, ex + "");
						}
					}
			   };

			   // register flash message callback
			   // lazy initialize flash message callbacks
			   if (!window.onFlashRequestComplete_8df046) {

				   // this function will be called by flash when httpRequest is done
                   window.onFlashRequestComplete_8df046 = function (event) {
					   // first in first out
					   onFlashRequestComplete_8df046.callbacks.shift()(event);
                   };

				   // our callback queue
                   window.onFlashRequestComplete_8df046.callbacks = [];
		       }

			   // push to queue
               window.onFlashRequestComplete_8df046.callbacks.push(callback);

	           QQWBFlashTransport.httpRequest(cfg.url,cfg.data,cfg.type);

		   }
		  ,abort: function () {
			  if (callback) {
			      callback(0,1);
			  }
		   }
	   };
    }
    /**
     * Helper method to make api ajax call
     *
     */
   ,_apiAjax: function (api, apiParams, dataType, type) {
       // build ajax acceptable opt object from arguments
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.ajax(opts);
    }
	/**
	 * Helper method to make api ajax call via flash
	 *
	 */
  ,_apiFlashAjax: function (api, apiParams, dataType, type) {
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.flashAjax(opts);
   }
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  ,flashAjax: function (opts) {
       var deferred = QQWB.deferred.deferred();

	   if (!opts.type) {
		   opts.type = "get";
	   }

       this._IOFlash(opts).send(function (status, statusText, responses, responseHeaders) {
       	if (status !== 200) {
       		deferred.reject(status, statusText);
       	} else {
       		deferred.resolve(status, statusText, responses, responseHeaders);
       	}
       });

	   return deferred.promise();
   }
	/**
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts) {

	    var deferred = QQWB.deferred.deferred();

	    if (!opts.type) {
	        opts.type = "get";
	    }

		this._IOAjax(opts).send(function (status, statusText, responses, responseHeaders, dataType) {
			if (status !== 200) {
				deferred.reject(status, statusText);
			} else {
				deferred.resolve(status, statusText, responses, responseHeaders, dataType);
			}
		});

		return deferred.promise();
    }
    /**
     * Dynamiclly load script
     *
     * @access public
     * @param src {String} script src
     * @param optCharset {String} script charset
     * @return {Object} promise
     */
   ,script: function (src, optCharset) {
       var
           optCharset = optCharset || "utf-8",
           deferred = QQWB.deferred.deferred();

       this._IOScript({
           charset: optCharset
          ,url: src
       }).send(function (status, statusText) {
           if (status !== 200) {
               deferred.reject(status, statusText);
           } else {
               deferred.resolve(status, statusText);
           }
       });

       return deferred.promise();
    }
    /**
     * JSONP request
     *
     * @access public
     * @param url {String} jsonp url callback is added automaticlly
     * @return {Object} promise
     */
    ,jsonp: function (url) {
        var 
            deferred = QQWB.deferred.deferred(),
            callbackQueryName = "callback", // callback name in query string
            callbackNamePrefix = "jsonp_", // jsonp callback function name prefix
            callbackName = callbackNamePrefix + QQWB.uid(), //random jsonp callback name
            _oldcallback = window.callbackName; // keep a reference to the variable we will overwrite(very little chance)

        window[callbackName] = function (data) {

            // jsonp successed
            deferred.resolve(data);

            window[callbackName] = _oldcallback; // restore back to original value
            
            if (typeof window[callbackName] == "undefined") { // original value is undefined
                delete window[callbackName]; // delete it
            }
        };

        this._IOScript({
            charset: "utf-8"
           ,url: url + "&" + callbackQueryName + "=" + callbackName
        }).send(function (status, statusText) {
            if (status !== 200) {
                deferred.reject(status, statusText);
            }
        });


       return deferred.promise();
    }
});

/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module token
 * @requires base
 *           core.time
 *           core.cookie
 *           core.io
 */
QQWB.extend("_token",{
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     *        expireIn {Number} expire after seconds from now
     *        optUsername {String} username associate with accesstoken
     *        optNickname {String} nickname associate with accesstoken
     * @return {Object} QQWB object
     */
    setAccessToken: function (accessToken, expireIn, optUsername, optNickname) {
        var tokenUser = this.getTokenUser(true); // retrieve the old user info accesstoken
        QQWB.cookie.set(QQWB._cookie.names.accessToken
                       ,[accessToken
                           ,QQWB.time.now() + expireIn * 1000
                           ,optUsername || (tokenUser && tokenUser.name) || ""
                           ,optNickname || (tokenUser && tokenUser.nick) || ""
                        ].join("|")
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get access token saved before
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about accesstoken expiration
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",2);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return token[0];
           }
       }
    }
    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about expiration
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",4);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return {
                   name: token[2]
                  ,nick: token[3]
               };
           }
       }
    }
    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.accessToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken) {
        QQWB.cookie.set(QQWB._cookie.names.refreshToken
                       ,refreshToken
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function () {
        return QQWB.cookie.get(QQWB._cookie.names.refreshToken);
    }
    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.refreshToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optSuccessCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optSuccessCallback) {
       QQWB.io.jsonp(QQWB._domain.exchange + "?" + QQWB.queryString.encode({
           response_type: "token"
          ,client_id: QQWB._appkey
          ,scope: "all"
          ,state: "1"
          ,refresh_token: this.getRefreshToken()
          ,access_token: this.getAccessToken(true)
       })).success(function (response) {

           var _response = response;

           response = QQWB.queryString.decode(response);

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wbname && QQWB.log.warning("weibo username not retrieved, will not update username");
               !response.wbnick && QQWB.log.warning("weibo usernick not retrieved, will not update usernick");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wbname, response.wbnick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("exchange token succeed");

           } else if (response.error) {
               QQWB.log.error("exchange token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while exchanging for new access token");
           }

           optSuccessCallback && optSuccessCallback.call(QQWB,response);

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("exchange token has failed, script not found");
           } else {
               QQWB.log.error("exchange token has failed, " + statusText);
           }
       });

       return QQWB;
    }
    /**
     * Obtain an access token
     *
     * @access public
     * @param optSuccessCallback {Function} callback function when result returned
     */
   ,getNewAccessToken: function (optSuccessCallback) {
       QQWB.io.jsonp(QQWB._domain.query + "?" + QQWB.queryString.encode({
           response_type: "token"
          ,client_id: QQWB._appkey
          ,scope: "all"
          ,state: "1"
       })).success(function (response) {

           var _response = response;

           response = QQWB.queryString.decode(response);

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wbname && QQWB.log.warning("weibo username not retrieved");
               !response.wbnick && QQWB.log.warning("weibo usernick not retrieved");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wbname, response.wbnick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("retrieve new access token succeed");

           } else if (response.error) {
               QQWB.log.error("retrieve new access token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while retrieving new access token");
           }

           optSuccessCallback && optSuccessCallback.call(QQWB,response);

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("get token has failed, script not found");
           } else {
               QQWB.log.error("get token failed, " + statusText);
           }
       });

       return QQWB;
    }
    /**
     * Auto resolve response from server
     *
     * @param responseText {String} the server response
     * @param optGlobal {Object} the global window object,default is current window
     */
   ,resolveResponse: function (responseText, optGlobal) {
       var 
           loginStatus,
           global = (optGlobal || window)["QQWB"],
           response = global.queryString.decode(responseText);

       if (response.access_token) {

           global._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wbname, response.wbnick);

           if (response.refresh_token) { // which should exists if accesstoken exists
               global._token.setRefreshToken(response.refresh_token);
           } else {
               global.log.error("refresh token not retrieved");
           }

           loginStatus = global.loginStatus(); // get current login status
           global.log.info("user " + loginStatus.name + " logged in");
           global.trigger(global.events.USER_LOGGEDIN_EVENT,loginStatus);
       } else if (response.error) {
           global.log.error("login error occurred " + response.error);
           response.message = response.error; // alternative error name
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       } else {
           global.log.error("unexpected result returned from server " + _response);
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       }
    }
});
/**
 * Tencent weibo javascript library
 *
 * A simple event system provide hooks
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module eventProvider
 * @requires base
 *           ext.Array
 */
QQWB.extend("_eventProvider",{

    /**
     * Get event system's internal map or create it if not exists
     *
     * @access private
     * @return {Object} the internal event map
     */
    _getEventsMap: function () {
        if (!this._eventsMap) {
            this._eventsMap = {};
        }
        return this._eventsMap;
    }

    /**
     * Bind an event
     *
     * @access public
     * @param name {String} the event name to bind
     * @param handler {Function} the handler for this event
     * @return {Void}
     */
   ,bind: function (name, handler) {
       var evts = this._getEventsMap();
       if (!evts[name]) {
           evts[name] = [handler];
       } else {
           if (!QQWB.Array.inArray(evts[name],handler)) {
               evts[name].push(handler);
           }
       }
    }

    /**
     * Unbind an event
	 * 
	 * If no handler provided, it will unbind all the handlers to this event
     * @access public
     * @param name {String} the event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     * @return {Void}
     */
   ,unbind: function (name, handler) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
		   if (handler) { // unbind specific handler,do nothing if handler not registered
			   for (var i=0,l=handlers.length; i<l; i++) {
				   if (handler === handlers[i]) {
					   handlers[i] = null;
				   }
			   }
		   } else { // unbind all the handlers
			   //handlers.length = 0;
			   delete this._getEventsMap()[name];
		   }
	   }
    }

   /**
	* Trigger a named event
	*
	* @access private
	* @param name {String} the event name
	*        data {Mixed} the event data
	*/
   ,trigger: function (name, data) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
           for (var i=0,l=handlers.length; i<l; i++) {
			   var handler = handlers[i];
			   if (handler) {
				   handler.call(QQWB,data);
			   }
           }
	   }
    }
});
/**
 * Tencent weibo javascript library
 *
 * Event API
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module event
 * @requires base
 *           eventProvider
 */

// event methods
//
QQWB.extend("",{
    /**
     * Bind an event
     *
     * Example:
     * 
     * T.bind("UserLoggedIn", function () {
     *     T.log.info("user logged in");
     * });
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
    bind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.bind(name, handler);
    	return this;
    }

    /**
     * Unbind an event
     *
     * Example:
     *
     * // handler for when user logged in
     * // keep a reference to this handler
     * var userlogin = function () {
     *     T.log.info("user logged in");
     * }
     *
     * // bind handler
     * T.bind("UserLoggedIn", userlogin);
     *
     * // unbind this handler 
     * T.unbind("UserLoggedIn", userlogin);
     *
     * // unbind all the handlers
     * T.unbind("UserLoggedIn")
     *
     * @param name {String} event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     */
   ,unbind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.unbind(name, handler);
	    return this;
    }

    /**
     * Trigger an event manually
     *
     * Example:
     *
     * T.trigger("UserLoggedIn");
     *
     * @param eventName {String} the event's name to bind
     * @param data {Mixed} the data passed to the callback function
     */
   ,trigger: function (name, data) {
        name = name.toLowerCase();
        this._eventProvider.trigger(name, data);
        return this;
    }
});

// internal supported events names
QQWB.extend("events", {
    USER_LOGGEDIN_EVENT: "UserLoggedIn"
   ,USER_LOGIN_FAILED_EVENT: "UserLoginFailed"
   ,USER_LOGOUT_EVENT: "UserLoggedOut"
   ,TOKEN_READY_EVENT: "tokenReady"
   ,DOCUMENT_READY_EVENT: "documentReady"
   ,EVERYTHING_READY_EVENT: "everythingReady"
});
/**
 * Tencent weibo javascript library
 *
 * Authenticate user
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module auth
 * @requires base
 *           token
 *           event.event
 *           core.queryString
 *           core.log
 */
QQWB.extend("",{
    /**
     * Login in user
     *
     * @access public
     * @param optSuccessHandler {Function} handlers when login is success
     * @param optFailHandler {Function} handlers when login is fail
     * @return {Object|undefined}
     */
    login: function (optSuccessHandler, optFailHandler) {

        if (!this._inited) {
            this.log.critical("Library not initialized, call T.init() to initialize");
        }

        var loginStatus = this.loginStatus(); 

        // user already logged in
        if (loginStatus) {

            optSuccessHandler && optSuccessHandler.call(this,loginStatus);

        } else { // open authorization window

            optSuccessHandler && this.bind(this.events.USER_LOGGEDIN_EVENT, optSuccessHandler);
            optFailHandler && this.bind(this.events.USER_LOGIN_FAILED_EVENT, optFailHandler);

            var 
                currWindow = {
                    x: window.screenX || window.screenLeft
                   ,y: window.screenY || window.screenTop
                   ,width: window.outerWidth || document.documentElement.clientWidth
                   ,height: window.outerHeight || document.documentElement.clientHeight
                },

                authWindow = {
                    width: 500
                   ,height: 300
                   ,authQuery: function () {
                      return QQWB.queryString.encode({
                               response_type: "token"
                              ,client_id: QQWB._appkey
                              ,redirect_uri: QQWB._domain.clientproxy
                              ,referer: document.location.href // IE will lost http referer when new window opened
                              ,scope: "all"
                           });
                    }
                   ,x: function () {
                       return parseInt(currWindow.x + (currWindow.width - this.width) / 2, 10);
                    }
                   ,y: function () {
                       return parseInt(currWindow.y + (currWindow.height - this.height) / 2, 10);
                    }
                   ,popup: function () {
                       this.contentWindow = window.open(QQWB._domain.auth + "?" + this.authQuery(), "", ["height="
                                                                                                   ,this.height
                                                                                                   ,", width="
                                                                                                   ,this.width
                                                                                                   ,", top="
                                                                                                   ,this.y()
                                                                                                   ,", left="
                                                                                                   ,this.x()
                                                                                                   ,", toobar="
                                                                                                   ,"no"
                                                                                                   ,", menubar="
                                                                                                   ,"no"
                                                                                                   ,", scrollbars="
                                                                                                   ,"no"
                                                                                                   ,", resizable="
                                                                                                   ,"yes"
                                                                                                   ,", location="
                                                                                                   ,"yes"
                                                                                                   ,", status="
                                                                                                   ,"no"
                           ].join(""));
                       return this;
                    }
                   ,focus: function () {
                       this.contentWindow && this.contentWindow.focus && this.contentWindow.focus();
                       return this;
                    }
                };

            authWindow.popup().focus();

            if (this.browser.msie) {// a timer is running to check autheciation and window status
                (function () {

                    var responseText;

                    if (authWindow.contentWindow.closed) {
                        responseText = "error=access_denied";
                        QQWB._token.resolveResponse(responseText);
                        return;
                    }

                    try {
                        responseText = authWindow.contentWindow.location.hash.split("#").pop();
                        QQWB._token.resolveResponse(responseText);
                        authWindow.contentWindow.close();
                    } catch (ex) {
                        setTimeout(arguments.callee,0);
                    }

                }());
            } else {

                QQWB._startTrackingAuthWindowStatus();

                (function () {

                    var responseText;

                    if (!QQWB._isTrackingAuthWindowStatus()) {
                        return;
                    }

                    if (authWindow.contentWindow.closed) {
                        responseText = "error=access_denied";
                        QQWB._token.resolveResponse(responseText);
                        return;
                    } else {
                        setTimeout(arguments.callee, 0);
                    }

                }());
            }
        } // end if loginStatus

        return this;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {
       if (!this.loginStatus()) {
           this.log.info("user not logged in");
       } else {
           this._token.clearAccessToken();
           this._token.clearRefreshToken();
       }
       optHandler && optHandler.call(this);
       this.trigger(this.events.USER_LOGOUT_EVENT);
       return this;
    }

   /**
    * Get login status object
    *
    * @access public
    * @param optCallback {Function} callback handler
    * @return {Object|undefined}
    */
   ,loginStatus: function (optCallback) {
       var 
           status,
           accessToken = this._token.getAccessToken(),
           user = this._token.getTokenUser();

       if (accessToken) {
           status = {
               access_token: accessToken
              ,name: user.name
              ,nick: user.nick
           };
       }

       optCallback && optCallback.call(this, status);

       return status;
    }
    /**
     * Are we tracking autheciate window status?
     * This is usefull in non-IE browser
     *
     * In IE,when autheciate window opened,there is a timer in the opener
     * keep tracking the opended window's location to parse and save token
     * then the autheciate window is closed by force.
     *
     * In non-IE browser,the way is different. Once the browser's token come back
     * the autheciate window will push that token to opener then close itself. but
     * there is aslo a timer is running in the opener to keep tracking if user manaually
     * closed the autheciate window. If user close that window (window.closed equal to
     * true),we will simulate a error response.The problem is when the user finished the
     * authoriztion task normally the autheciate window will closed aslo.the timer inside
     * the opener will detect that and set response incorrectly. to correct this, If the
     * user finished the authorization task normally, we should stop the timer immediatly.
     * that is before the autheciate window close itself, it told the opener, "don't track 
     * my status anymore,i will close my self normally",If the timer see that, the timer will
     * not running anymore, and the set error reponse will never called.
     *
     */
    ,_isTrackingAuthWindowStatus: function () {
        return !!this._trackAuthWindowStatus;
    }
   /**
    * Don't track if autheciate window is closed or not
    * 
    * @access private
    * @return {undefined}
    */
   ,_startTrackingAuthWindowStatus: function() {
       this._trackAuthWindowStatus = true;
    }
   /**
    * Don't track if autheciate window is closed or not
    * 
    * @access private
    * @return {undefined}
    */
   ,_stopTrackingAuthWindowStatus: function() {
       this._trackAuthWindowStatus = false;
    }
});
/**
 * Tencent weibo javascript library
 *
 * static variables
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module static
 * @requires base
 */

QQWB.extend("_static",{
    GET: "GET"
   ,POST:"POST"
   ,GET_OR_POST: "GET | POST"
   ,CATEGORY_TIMELINE: "时间线"
   ,EMPTY_STR:""
});
/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module apiProvider
 * @requires base
 *           static
 */
//TODO: more api should be supported
QQWB.extend("_apiProvider", {
	// api list
    apis: {
         "/statuses/home_timeline": {
             category: QQWB._static.CATEGORY_TIMELINE
            ,description: "主页时间线"
            ,supportMethod: QQWB._static.GET
            ,supportParams: {
                 pageflag: {
                     defaultValue:0
                    ,description:QQWB._static.EMPTY_STR
                 }
                ,reqnum: {
                    defaultValue:20
                   ,description:QQWB._static.EMPTY_STR
                 }
                ,pagetime: {
                    defaultValue:0
                   ,description:QQWB._static.EMPTY_STR
                 }
             }
         }
        ,"/statuses/public_timeline": {
             category: QQWB._static.CATEGORY_TIMELINE
            ,description: "广播大厅时间线"
            ,supportMethod: QQWB._static.GET
            ,supportParams: {
                 pos: {
                     defaultValue:0
                    ,description:QQWB._static.EMPTY_STR
                 }
                ,reqnum: {
                    defaultValue:20
                   ,description:QQWB._static.EMPTY_STR
                 }
                ,pagetime: {
                    defaultValue:0
                   ,description:QQWB._static.EMPTY_STR
                 }
             }
         }
    }
	/**
	 * Get an api descriptor object
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Object} the descriptor object
	 */
   ,getDescriptor: function (interface) {
       return this.apis[interface];
    }
	/**
	 * Determine an api is in the api list or not
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Boolean}
	 */
   ,isProvide: function (interface) {
       return !!this.getDescriptor(interface);
    }
	/**
	 * Try to describe the api interface by human read-able format
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Boolean}
	 */
    ,describe: function (interface) {
		var descriptor = this.getDescriptor(interface);
		if (descriptor) {
			return descriptor.category + ">" + descriptor.description;
		} else {
			return "";
		}
	 }
});

/**
 * Tencent weibo javascript library
 *
 * API call
 *
 * Example:
  
    T.api(
       "/status/home_timeline"
      ,{
          maxpage: 20
       }
      ,"json","GET")
 *  .success(function (response) {
 *  })
 *  .error(function (error) {
 *  });
 *
 *  Note:
 *
 *  T.api method supports cache, when the condition meets.
 *  The cached api will run automaticlly.
 *
 *  If there is a problem when processing to meet the condition.
 *  then the api call will failed too.
 *
 * @access public
 * @param api {String} the rest-style api interface
 * @param apiParams {Object} api params
 * @param optDataType {String} the dataType supports either "json","xml","text", case-insensitive, default is "json"
 * @param optType {String} the request method supports either "get","post", case-insensitive, default is "get"
 * @param optSolution {String} use solution by force @see QQWB.solution
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 *           ext.XML
 *           ext.Array
 *           apiProvider
 *           deferred
 *           auth.token
 *           auth.auth
 */

QQWB.provide("api", function (api, apiParams, optDataType, optType, optSolution) {

	apiParams = apiParams || {};
    optDataType = (optDataType || "json").toLowerCase();
    optType = optType || "GET";

	var 
    	promise,
		solution,
		format = optDataType, // the format string in oauth querystring
		supportedFormats = {json:true,xml:true/*,text:true*/},
    	deferred = QQWB.deferred.deferred();
	
	if (!(format in supportedFormats)) {
		format = "json";
	}

	apiParams["access_token"] = QQWB._token.getAccessToken();
	apiParams["version"] = "2.0";
	apiParams["format"] = format;


    promise = deferred.promise();

	// force to use specified solution
	if (optSolution && QQWB.Array.inArray([QQWB._solution.HTML5_SOLUTION
                                          ,QQWB._solution.FLASH_SOLUTION
										  ,QQWB._solution.SILVER_LIGHT_SOLUTION]
										  ,optSolution)) {
		QQWB.log.warning("forced to use solution " + optSolution);
		// solution has initialized let that solution handle the request
		if(!QQWB._solution[optSolution]) { // solution not initiallize, initialize it
		    QQWB.log.warning("forced to use solution " + optSolution + ", this solution is not inited, initialzing...");
		    QQWB._solution.initSolution[optSolution];
		}
	    solution = QQWB._solution[optSolution];
	} else {
        // solutions with following priority order
        solution =  (QQWB.browser.feature.postmessage && QQWB._solution[QQWB._solution.HTML5_SOLUTION])
            || (QQWB.browser.feature.flash && QQWB._solution[QQWB._solution.FLASH_SOLUTION])
            || (QQWB.browser.feature.silverlight && QQWB._solution[QQWB._solution.SILVER_LIGHT_SOLUTION]);

	}

	// don't handle that, let server to the job
	// then pass a failed message to the callback
    //
	/*if (false && !QQWB._apiProvider.isProvide(api)) {
		QQWB.log.error("can't call \"" + api +"\", not supported");
		deferred.reject(-1, "api not supported"); // immediately error
		return promise;
	}*/

	// no solution or solution not correctly initialzed
	// its not possible to implement to QQWB.api method working
	// very little chance
	if (!solution || solution.readyState === 2) {
		QQWB.log.critical("solution error");
		deferred.reject(-1, "solution error"); // immediately error
		return promise;
	}

    //TODO: if api call required solution is flash
    //then cache the function do flash solution init
	//if (!solution.support(api)) {
		// choose other solution
		// return  QQWB.api(api, apiParams, optDataType, optType, other solution);
	//}

	// if api called before the solution is ready, we cached it and waiting the solution ready
	// when solution is ready, regardless success or fail, these cached function will be invoke again immediately
	if (solution.readyState === 0) { //solution not ready
		QQWB.log.warning("solution is not ready, your api call request has been cached, will invoke immediately when solution is ready");
    	solution.promise.done(function () { // when solution is ready
		    QQWB.log.info("invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"...");

			// emulate the request send it to server
			// when data backs, resolve or reject the deferred object previously saved.
			// then pass the data in accordingly
			QQWB.api(api, apiParams, optDataType, optType)
			    .success(function () {
				    deferred.resolveWith(deferred,QQWB.Array.fromArguments(arguments));
				 })
			    .error(function (){
				    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
			     }); // keep the arguments
		}).fail(function () { // we use the arguments from boot section (boot.js)
		    QQWB.log.error("can't invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"");
		    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
		});
		return promise;
	}

	// must be here everything must be ready already from here
	
    // user not logged in, don't bother to try to get data
	if (!QQWB.loginStatus()) {
		deferred.reject(-1, "not login"); // immediately error
		return promise;
	}

	// describe what we are to do now
    QQWB.log.info("[" + (QQWB.api.id ? QQWB.api.id + 1 : "_") + "] requesting data \"" + QQWB._apiProvider.describe(api) + "\" from server...");

    // html5 solution
    if (solution === QQWB._solution[QQWB._solution.HTML5_SOLUTION]) {
			var serverProxy = document.getElementById(solution.id);
			if (!serverProxy) { // double check to avoid the server frame was removed from dom unexpectly
	            QQWB.log.critical("server proxy not found");
	            deferred.reject(-1,"server proxy not found");
			} else {
                // server proxy's url should be same as QQWB._domain.serverproxy, if not may be we got the wrong element
				if (serverProxy.src !== QQWB._domain.serverproxy) { // double check to avoid the server frame src was modified unexpectly 
	                QQWB.log.critical("server proxy is not valid, src attribute has unexpected value");
	                deferred.reject(-1,"server proxy not valid");
				} else {
					// everything goes well
                 	// lazy create an collection object to maintain the deferred object
                 	// only html5 solution need this
                 	if (!QQWB.api.deferrsCollection) {
                 		QQWB.extend(QQWB.api, {
                 			id : 0
                 		   ,_deferredCollection: {
                 		   }
                 		   ,deferredAt: function (deferredId) {
                 			   if (this._deferredCollection[deferredId]) {
                 			       return this._deferredCollection[deferredId];
                 			   } else {
                 	               QQWB.log.warning("get deferred object has failed, that object does not exist at index " + deferredId);
                 			   }
                 		    }
                 			// uncollect the deferred object
                 		   ,uncollect: function (deferredId) {
                 			   if (this._deferredCollection[deferredId]) {
                 			       delete this._deferredCollection[deferredId];
                 			   } else {
                 	               QQWB.log.warning("uncollect deferred object has failed, that object does not exist at index " + deferredId);
                 			   }
                 		    }
                 			// collect an deferred object to collections
                 		   ,collect: function (deferredObj) {
                 			   if (deferredObj.promise) { // it's an deferred object
                 			       this._deferredCollection[++this.id] = deferredObj;
                 			       return this.id;
                 			   } else { // we dont accpept other than deferred object
                 	               QQWB.log.warning("collect a non-deferred object is illegal");
                 			   }
                 		    }
                 		  
                 			// how many api call this page does?
                 		   ,total: function () {
                 			   return QQWB.api.id;
                 		    }
                 		});
                 	}

					if (!QQWB.api.messageHandler) {
						// add listeners for the data when data comes back
						QQWB.provide("api.messageHandler", function (e) {
							// we only trust the data back from the API server, ingore others
							// This is important for security reson
							if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                            QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
							} else {
								// here is the result comes back

								// data.id represent the caller's id to know which deferred object should handle the data
								// data.data reprent the result return from API server
								var 
							    	data = JSON.parse(e.data),
									id = data.id,
									relateDeferred = QQWB.api.deferredAt(id),
							    	response = data.data;

								if (relateDeferred) {
							        if (response[0] !== 200) {
										relateDeferred.reject.apply(relateDeferred,response);
									} else {
										if (response[4] == "xmltext") {
											response[2] = QQWB.XML.fromString(response[2])
										}
										relateDeferred.resolve.apply(relateDeferred,[response[2],response[3]]);
							    	}
									QQWB.api.uncollect(id);
								} else {
	                                QQWB.log.warning("related deferred object not found, it shouldn't happen");
								}
							}
						}); // end provide

                        if (window.addEventListener) {
                            window.addEventListener("message", QQWB.api.messageHandler, false);
                        } else if (window.attachEvent) {
                            window.attachEvent("onmessage", QQWB.api.messageHandler);
                        }
					}
                 
					try {
						// send to proxy server
						// IE only support String type as the message
						// @see http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
						serverProxy.contentWindow.postMessage(JSON.stringify({ 
							id: QQWB.api.collect(deferred)
						   ,data: [api, apiParams, optDataType, optType]
						}),QQWB._domain.serverproxy);

					} catch (ex) {
	                    QQWB.log.critical("post message to server proxy has failed, " + ex);
	                    deferred.reject(-1,ex);
					}
				} // end server proxy src modified check
			} // end server proxy existance check

	} else if (solution === QQWB._solution[QQWB._solution.FLASH_SOLUTION]) {
		QQWB.io._apiFlashAjax(api, apiParams, optDataType, optType).complete(function () {
			var response = QQWB.Array.fromArguments(arguments);
			if (response[0] !== 200) {
				deferred.reject.apply(relateDeferred,response);
			} else {
				deferred.resolve.apply(deferred,[response[2],response[3]]);
			}
		});
	}
    return promise;
});
/**
 * Tencent weibo javascript library
 *
 * Incode document
 *
 * Example:
 *
 * T.man("/Statuses/home_timeline");
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module man
 * @requires base
 *           apiProvider
 */

QQWB.provide("man", function (api) {
    return this._apiProvider.getDescriptor(api);
});

/**
 * Tencent weibo javascript library
 *
 * DOM operations
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module dom
 * @requires base
 *           ext.String
 */

QQWB.extend("dom", {
    /**
     * Create an element
     * 
     * @access public
     * @param tagName {String} the element's tagName
     * @param optAttrs {Object} attrs on that element
     * @return {DOMElement} an element
     */
    create: function (tagName,optAttrs) {
        var element = document.createElement(tagName + "");
        if (optAttrs && element) {
            for (attr in optAttrs) {
                if (optAttrs.hasOwnProperty(attr)) {
                    element[attr] = optAttrs[attr];
                }
            }
        }
        return element;
     }
    /**
     * Create and return a hiddened element
     *
     * @access public
     * @param optTagName {String} tagName
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
     * @return {DOMElement} a hiddened element
     */
   ,createHidden: function (optTagName, optAttrs, optFake) {
        optTagName = optTagName || "div";
        var el = this.create(optTagName,optAttrs);
        el.width = el.height = 0;
        el.style.width = el.style.height = 0;
        el.style.position = "absolute";
        el.style.top = "-9999px";
		if (optFake) {
			// el.style.visibility = "hidden";
		} else {
            el.style.display = "none";
		}
        return el;
    }
    /**
     * Append child to parent
     *
     * Note:
     * if parent is not valid then append to dom body 
     *
     * @access public
     * @param child {DOMElement} childNode
     * @param parent {DOMElement} parentNode
	 * @return {Object} QQWB.dom
     */
   ,append: function (child, parent) {
       parent = parent || document.body;
       if (child && child.nodeType) {
           parent.appendChild(child);
       }
       return this;
    }
    /**
     * Set element's innerHTML
     *
     * @access public
	 * @param node {Node} node
	 * @param html {String} the html text for the node
	 * @return {Object} QQWB.dom
     */
   ,html: function (node, html) {
       node && node.nodeType && html && (node.innerHTML = html);
       return this;
   }
    /**
     * Append html to DOM and make it hidden
     *
     * @access public
     * @param html {DOMElement|String}
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
	 * @return {Object} QQWB.dom
     */
   ,appendHidden: function (html, optAttrs ,optFake) {
       var hidden = this.createHidden(null, optAttrs, optFake);
       this.html(hidden, html);
       return this.append(hidden);
    }
	/**
	 * Remove node from DOM
	 *
     * @access public
	 * @param node {Node} the DOM node
	 * @return {Object} QQWB.dom
	 */
   ,remove: function (node) {
	   node && node.nodeType /* is node */ && node.parentNode /* parentNode exists */ && node.parentNode.removeChild(node)/* remove it */;
	   return this;
    }
});

/*
 * @author crockford
 * @url https://raw.github.com/douglascrockford/JSON-js/master/json2.js
 * @module JSON2
 * @licence Public Domain
 */
/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * Tencent weibo javascript library
 *
 * Browser and browser's feature detection
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module browser
 * @requires base
 *           log
 */

(function (){
    var 
        browserMatch; // ua regexp match result
    var
              ua = navigator.userAgent,
           rmsie = /(msie) ([\w.]+)/,
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
         rwebkit = /(webkit)[ \/]([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
    var
        browserFeatures = {}, // keep browser features
        browserPrefixes = ["Webkit","Moz","O","ms","khtml"],
        featureTests = {
             "cookie": function () {
                 var cookieEnabled = navigator.cookieEnabled;
                 if (cookieEnabled && QQWB.browser.webkit) {
                     // resolve webkit bug
                     var cookiename = "COOKIE_TEST_" + QQWB.uid();
                     // try to set a test cookie
                     document.cookie = cookiename + "=" + 1 +"; domain=; path=;";
                     // check cookie exists or not
                     if (document.cookie.indexOf(cookiename) < 0) {
                         cookieEnabled = false;
                     } else {
                         // remove test cookie
                         document.cookie = cookiename + "=" +"; expires=" + new Date(1970,1,1).toUTCString() + "; domain=; path=;";
                     }
                 }
                 !cookieEnabled && QQWB.log.critical("Your browser doesn't support cookie or cookie isn't enabled");
                 return cookieEnabled;
             }
            ,"flash": function () { // code borrowed from http://code.google.com/p/swfobject
                 if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {
                     var desc = navigator.plugins["Shockwave Flash"].description; // plug in exists;
                     var enabled = typeof navigator.mimeTypes != "undefined"
                                  && navigator.mimeTypes["application/x-shockwave-flash"]
                                  && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;
                     return desc && enabled;
                 } else if (typeof window.ActiveXObject != "undefined") {
                     try {
                         var flashAX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                         if (flashAX) {
                             return flashAX.getVariable("$version");
                         }
                     } catch (ex) {}
                 }
             }
            ,"userdata": function () {
                return QQWB.browser.msie;
             }
            ,"postmessage": function () {
                // ie8 support postmessage but it does not work with window.opener
                return !!window.postMessage && ((QQWB.browser.msie && parseInt(QQWB.browser.version,10) < 8) ? false : true); 
             }
            ,"canvas": function () {
                var elem = document.createElement("canvas");
                return !!(elem.getContext && elem.getContext("2d"));
            }
            ,"webgl": function () {
                return !!window.WebGLRenderingContext;
            }
            ,"geolocation": function () {
                return !!navigator.geolocation;
            }
            ,"websqldatabase": function () {
                return !!window.openDatabase;
            }
            ,"indexeddb": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "IndexedDB"]) {
                        return true;
                    }
                }
                return !!window.indexedDB;
            }
            ,"websocket": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "WebSocket"]) {
                        return true;
                    }
                }
                return !!window.WebSocket;
            }
            ,"localstorage": function () {
                return window.localStorage && localStorage.getItem;
            }
            ,"sessionstorage": function () {
                return window.sessionStorage && sessionStorage.getItem;
            }
            ,"webworker": function () {
                return !!window.Worker;
            }
            ,"applicationcache": function () {
                return !!window.applicationCache;
            }
        };

    // detect browser type and version rely on the browser's user-agent
    function uaMatch (ua) {
        ua = ua.toLowerCase();
        var 
            match = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                    rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

        return { browser: match[1] || "unknown", version: match[2] || "0" };
    }

    // test browser features
    // now we only support little features
    // please visit http://www.modernizr.com for full feature test
    function featureTest () {
        for (var feature in featureTests) {
            if (featureTests.hasOwnProperty(feature)) {
                if (featureTests[feature]()) {
                    browserFeatures[feature] = true;
                }
            }
        }
    }

    browserMatch = uaMatch(ua);

    QQWB.extend('browser',{
        "version":browserMatch.version
    });

    QQWB.browser[browserMatch.browser] = true;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);

}());
/**
 * Tencent weibo javascript library
 *
 * Flash(swf file) loader
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module flash
 * @requires base
 *           ext.Array
 *           browser
 *           dom
 */
QQWB.extend("flash",{
    /**
     * Load swf to the current page by swf file path
     *
     * @access public
     * @param swfPath {String} the swf file path
     * @param optCallback {Function} the optCallback when swf is ready
     * @return Flash {Object}
     */
   load: function (swfPath, optCallback) { 

       // lazy create the loaded swfs
       if (!this.loadedSwfs) {
           this.loadedSwfs = [];
       }

       // if that swf already loaded, prevent to load the same swf again
       if (QQWB.Array.inArray(this.loadedSwfs, swfPath)) {
           QQWB.log.warning(swfPath + "is already loaded");
           return;
       }

       // this is the function name will be called inside flash
       // to indicate that the flash itself is ready now
       var movieContainerId= "movieContainer_" + QQWB.uid(),
           movieName = "movie_" + QQWB.uid(),
           flashReadyCallbackName = "onFlashReady_a1f5b4ce",
           _flashReady = window[flashReadyCallbackName];

       window[flashReadyCallbackName] = function () {

           optCallback && optCallback(movieName);
           // restore back to original value
           window[flashReadyCallbackName] = _flashReady;
           // if the original value is undefined
           // then delete it
           if (typeof _flashReady === "undefined") {
               delete window[flashReadyCallbackName];
           }
           // clean up variables in closure to avoid memory leak in IE
           _flashReady = null;
           optCallback && (optCallback = null);
           movieName = null;
       };

       // code generated
       QQWB.dom.appendHidden(['<object'
                              ,  'type="application/x-shockwave-flash"'
                              ,  'id="' + movieName + '"'
                              ,  QQWB.browser.msie ? 'name="' + movieName +  '"' : ''
                              ,  QQWB.browser.msie ? 'data="' + swfPath + '"' : ''
                              ,  QQWB.browser.msie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : ''
                              ,  'allowscriptaccess="always">'
                              ,  '<param name="movie" value="' + swfPath + '"></param>'
                              ,  '<param name="allowscriptaccess" value="always"></param>'
                              ,  '</object>'
                              ].join(" "),{id:movieContainerId},true);
       return document.getElementById(movieContainerId);
    }
    /**
     * Retrieve the swf object
     *
     * @access public
     * @param name {String} the swf name
     * @param {Object} the swf object
     */
   ,getSWFObjectByName: function (name) {
       if (QQWB.browser.msie) {
           return window[name];
       } else {
           if (document[name].length) {
               return document[name][1];
           }
           return document[name];
       }
    }
});
/**
 * Tencent weibo javascript library
 *
 * solution manager
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module solution
 * @requires base
 *           deferred
 *           ext.Array
 *           dom
 *           flash
 */
QQWB.extend("_solution", {

    HTML5_SOLUTION: "html5"

   ,FLASH_SOLUTION: "flash"

   ,SILVER_LIGHT_SOLUTION: "silverlight"

   ,initSolution: function (name) {

       var solution,  // the choosed solution

           // the whole initilized process is success?
           // this is the deferred object for the whole process
           // not the single solution
           solutionInit = QQWB.deferred.deferred();

       // if the solution passed in we supported
	   // and not initialized
	   // then initialze it
       if (!this[name] && QQWB.Array.inArray([this.HTML5_SOLUTION
                                             ,this.FLASH_SOLUTION
                                             ,this.SILVER_LIGHT_SOLUTION]
                                             ,name)) {

           // a choosed solution object
           this[name] = {};

           // indicate choosed solution is ready or not
           // 0 not resolved
           // 1 solution is relsolved successfully
           // 2 solution is rejected
           this[name]["readyState"] = 0;

           // the choosed solution id
           // use to indendify the solution object
           this[name]["id"] = "solution_" + QQWB.uid();

           // the choosed solution deferred ready object
           this[name]["deferred"] = QQWB.deferred.deferred();

           // the choosed solution deferred ready promise object
           this[name]["promise"] = this[name]["deferred"].promise();

	   }

       // register callback to sub solutions deferred object
       // if choosed solution failed then the whole solution failed,vice versa
	   if (this[name] && this[name].readyState !== 0) {
           this[name].deferred.success(function () {
                solutionInit.resolve(QQWB.Array.fromArguments(arguments));
           }).fail(function () {
                solutionInit.reject(QQWB.Array.fromArguments(arguments));
	       });
	   } else {
           // switch between solution types
           switch (name) {
               // this is the html5 solution
               case this.HTML5_SOLUTION:
               // the browser must support postmessage feature
               // to support html5 solution
               if (QQWB.browser.feature.postmessage) {
                   // reference for choosed solution object
                   solution = this[this.HTML5_SOLUTION];
                   var messageHandler = function (e) {
                       // we expected the message only come from serverproxy (we trusted)
                       // omit other messages, to protect your site alway from XSS/CSRF attack
                       if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                       QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
	        	       } else { // this is the message we expected
                           if (e.data === "success") {
                               QQWB.log.info("html5 solution was successfully initialized");
                               solution.readyState = 1;
                               solution.deferred.resolve();
                           } else { // amm.. the trusted server post a message we don't understand
                               QQWB.log.info("unexpected solution signal " + e.data);
                           }
                       }
                       // clean up things
                       //
                       // unbind handlers
                       if (window.addEventListener) {
                           window.removeEventListener("message", messageHandler, false);
                       } else if (window.attachEvent) {
                           window.detachEvent("onmessage", messageHandler);
                       }
                       // 
                       messageHandler = null;
                   };

                   if (window.addEventListener) {
                       window.addEventListener("message", messageHandler, false);
                   } else if (window.attachEvent) {
                       window.attachEvent("onmessage", messageHandler);
                   }

                   // append the server frame to page
                   QQWB.documentReady(function () {
                       QQWB.log.info("init html5 solution...");
                       serverframe = QQWB.dom.createHidden("iframe", {id: solution.id,src: QQWB._domain.serverproxy});
                       QQWB.dom.append(serverframe);
                       // the onload event is fired before the actually content loaded
                       // so we set a delay of 1 sec
                       // if serverframe doesn't post that message, we know there is an error
                       // maybe a 404 Error?
                       // the onload event will fired on chrome even the frame is 404 !!!
                       // there is no frame.onerror event
                       serverframe.onload = function (e) {
                           setTimeout(function () {
                               // should be 1 now, if everything is fine
                               // if not there is a problem
                               if (solution.readyState !== 1) {
                                   QQWB.log.error("html5 solution initialition has failed, server proxy frame encountered error");
                                   solution.readyState = 2;
                                   solution.deferred.reject(-1,"server proxy frame not working");
                               }
                           }, 1 * 1000)/* check delayed */;
                       }
                   });
               } else { // browser don't support postmessage feature, the html5 solution failed
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support postmessage";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.FLASH_SOLUTION:
               // the browser must support flash feature to initliz flash solution
               if (QQWB.browser.feature.flash) {
                   // reference for choosed solution object
                   solution = this[this.FLASH_SOLUTION];

	        	   QQWB.documentReady(function () {
                       QQWB.log.info("init flash solution...");
	        		   var resolveTimer,
	        		       resolveTimeout = 10 * 1000,
	        		       movieBox = QQWB.flash.load(QQWB._domain.flashproxy, function (moviename) {
							  QQWB.log.info("flash solution initlized successfully");
	        	              solution.readyState = 1;
	        				  window["QQWBFlashTransport"] = QQWB.flash.getSWFObjectByName(moviename);
	        				  // clear the timer
	        				  resolveTimer && clearTimeout(resolveTimer);
	        	              solution.deferred.resolve();
                           });
	        		   
                       // if solution didn't marked as resolved(success) after 30 seconds 
	        		   // mark the solution has failed and do clean up
	        		   resolveTimer = setTimeout(function () {
	        	    		   if (!solution.deferred.isResolved()) {
	        	    		       solution.readyState = 2;
	        	    		       solution.deferred.reject(-1, "encounter error while loading proxy swf");
	        	    		       // remove the box cotains the flash
	        	    		       QQWB.dom.remove(movieBox);
	        	    		   }
	        	    	   }, resolveTimeout);
	        	       //
	        	   });

               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support flash or flash is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.SILVER_LIGHT_SOLUTION:
               if (QQWB.browser.feature.silverlight) {
               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support silverlight or silverlight is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               default:
               QQWB.log.error("can't init solution \"" + name) +"\",not supported";
               solutionInit.reject("solution " + name + " not supported");
           }

	       }
           
           return solutionInit.promise();
    }
});
/**
 * Tencent weibo javascript library
 *
 * Locker mechanism
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module door
 * @requires base
 */
QQWB.extend("door", {

	// count of doors
    doors:0

	/**
	 * Retrieve a new door object, the door can be locked or unlocked
	 *
	 * @access public
	 * @param optLockDo {Function} actions do when lock acts
	 * @param optUnlockDo {Function} action do when unlock acts
	 * @return {Object} locker object
	 */
   ,door: function (optLockDo, optUnlockDo) {

	    // the locks number on this door
        var locks = 0;

		// record the total number of door instance
        this.doors ++;

        return {
			/**
			 * Lock the door
			 *
			 * @access public
			 */
            lock: function () {
                locks ++;
				optLockDo && optLockDo.call(QQWB);
				return this;
            }
			/**
			 * unLock the door
			 *
			 * @access public
			 */
           ,unlock: function () {
               locks --;
			   locks = Math.max(0,locks);
			   optUnlockDo && optUnlockDo.call(QQWB);
			   return this;
            }
			/**
			 * Check whether the door instance is open
			 *
			 * @access public
			 */
           ,isOpen: function () {
               return locks === 0;
            }
        }
    }
	/**
	 * Retrieve the number of lockers
	 *
	 * @access public
	 * @return {Number} count of lockers
	 */
   ,count: function () {
       return this.doors;
    }
});
/**
 * Tencent weibo javascript library
 *
 * Library booter
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module boot
 * @requires base
 *           door
 *           browser
 *           apiProvider
 *           deferred
 *           ext.Array
 *           auth.token
 *           event.event
 *           solution
 *           JSON2
 */

QQWB.extend("",{
    /**
     * Init with appkey and proxy
     *
     * @access public
     */
    init: function (opts) {
           if (this._inited === true) {
               this.log.warning("already initialized");
               return this;
           }
           this.log.info("init signal has arrived");
           var 
               accessToken = this._token.getAccessToken(),
               rawAccessToken = this._token.getAccessToken(true), 
               refreshToken = this._token.getRefreshToken(),
               needExchangeToken = refreshToken && !accessToken && rawAccessToken,
               needRequestNewToken = !refreshToken && !accessToken,
               clientProxy = opts.proxy || document.location.href; // redirect flag is userfull to solve IE's opener problem

           if (opts.appkey) {
               this.log.info("client id is " + opts.appkey);
               this.assign("_appkey","APPKEY",opts.appkey);
           }

           this.log.info("client proxy uri is " + clientProxy);
           this.assign("_domain","CLIENTPROXY_URI",clientProxy);

           if (/*true || force exchange token*/needExchangeToken || needRequestNewToken) {
               QQWB._tokenReadyDoor.lock(); // lock for async get or refresh token
           }

           if (/*true || force exchange token*/needExchangeToken) {
               this.log.info("exchanging refresh token to access token...");
               QQWB._token.exchangeForToken(function (response) {

                   //TODO: does it really neccessary?
                   if (response.error) {// exchangeToken encountered error, try to get a new access_token automaticly
                       QQWB.log.warning("exchange token has failed, trying to retrieve a new access_token...");
                       this._tokenReadyDoor.lock();// lock for async refresh token
                       QQWB._token.getNewAccessToken(function () {
                           this._tokenReadyDoor.unlock();// unlock for async refresh token
                       });
                   }

                   // don't put this segment to top
                   // because of the stupid door-locking mechanism
                   this._tokenReadyDoor.unlock();// unlock for async refresh token

               });
           } else if (needRequestNewToken) {
               this.log.info("retrieving new access token...");
               QQWB._token.getNewAccessToken(function () {
                   QQWB._tokenReadyDoor.unlock(); // unlock for async get token
               });
           }

           this._inited = true;

           QQWB._tokenReadyDoor.unlock();

           return this;
    }
    /**
     * The door controls library ready
     */
    ,_tokenReadyDoor: QQWB.door.door(function () {
            this.log.info("tokenReady is locked");
        }, function () {
            this.log.info("tokenReady is unlocked");
            // the this keyword is pointing to QQWB forced
            this._tokenReadyDoor.isOpen() && this.log.info("token is ready") && this.trigger(this.events.TOKEN_READY_EVENT);
        })
   /**
    * Add callback funtions when the sdk is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,tokenReady: function (handler) {
       if (this._tokenReadyDoor.isOpen()) { // token is ready or not
           handler && handler();
       } else {
           this.bind(this.events.TOKEN_READY_EVENT, handler);
       }
       return this;
    }
    /**
     * Indicate whether the document is ready
     */
   ,_isDocumentReady: false
    /**
     * We are trying to trigger the document ready event
     * The document ready event will only be triggered once
     */
   ,_tryToTriggerDocumentReadyEvents: function () {
       if (this._isDocumentReady) { // the event already be triggered,will never trigger again
           return;
       }
       try { // running the test, if no exception raised, the document is ready
           var el = document.getElementsByTagName("body")[0].appendChild(document.createElement("span"));
           el.parentNode.removeChild(el);
       } catch (ex) { // document isn't ready
           return;
       }
       this._isDocumentReady = true;
       this.log.info ("document is ready");
       this._everythingReadyDoor.unlock(); // unlock for document ready
       this.trigger(this.events.DOCUMENT_READY_EVENT);
    }
    /**
     * Add handlers when document is ready
     *
     * @access public
     * @param handler {Function} handler
     * @return {Object} QQWB
     */
   ,documentReady: function (handler) {
       if (this._isDocumentReady) { // we are sure the document is ready to go
           handler && handler();
       } else {
           this.bind(this.events.DOCUMENT_READY_EVENT,handler);// cache the handlers, these hanlders will called when document is ready to go
           this._tryToTriggerDocumentReadyEvents(); // trigger the document ready event as early as posibble
       }
    }
    /**
     * The door controls everything ready
     */
    ,_everythingReadyDoor: QQWB.door.door(function () {
            this.log.info("everythingReady is locked");
        }, function () { // the "this" keyword is pointing to QQWB forced
            this.log.info("everythingReady is unlocked");

            this._everythingReadyDoor.isOpen()
            && this.log.info("everything is ready")
            && this.log.info("current user is " + this.loginStatus().name)
            && this.trigger(this.events.EVERYTHING_READY_EVENT);
        })
   /**
    * Add callback funtions when everything is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,everythingReady: function (handler) {
       if (this._everythingReadyDoor.isOpen()) { // library and document, is all of them ready?
           handler && handler();
       } else {
           this.bind(this.events.EVERYTHING_READY_EVENT, handler); // internal events
       }
       return this;
    }
});

QQWB._tokenReadyDoor.lock(); // lock for library application must call init first
QQWB._everythingReadyDoor.lock(); // lock for library must ready
QQWB._everythingReadyDoor.lock(); // lock for document must ready

QQWB.bind(QQWB.events.TOKEN_READY_EVENT, function () {
    QQWB._everythingReadyDoor.unlock(); // unlock for token ready
});

if (window.opener) {
    //in authorize window
    var 
        opener = window.opener,
        responseText = window.location.hash.split("#").pop();

    // if allow to read location means the origin is same
    if (opener.location.href) { 
        QQWB._token.resolveResponse(responseText, opener); // save token
    } else {
        QQWB.log.critical("crossdomain login is not supported currently");
    }                                                       

    // opener will use timer to detect is user closed the authwindow and send a error message
    // since auth window is closed by us normally,in this case,opener shouldn't track it anymore
    opener.QQWB._stopTrackingAuthWindowStatus();

    window.close();

    QQWB.log.info("library is booting at server authorization mode"); 

} else if (window != window.parent) { // in frame

    var serverProxyMode = QQWB._domain.serverproxy === window.location.href;// is this library working at proxy mode?(located on the api host?)

    if (serverProxyMode) {

        QQWB.log.info("library is booting at server proxy mode"); 

        if (QQWB.browser.feature.postmessage) { // server proxy solution only runs html5 postmessage solution
            
            var 
				targetOrigin = "*", // we don't care who will handle the data
                external = window.parent; // the third-party application window

            // post a message to the parent window indicate that server frame(itself) was successfully loaded
            external.postMessage("success", targetOrigin); 

            // recieve message from external as data transfer proxy
		    var messageHandler = function (e) {
				// accept any origin
				// we do strict api check here to protect from XSS/CSRF attack
				//
				var 
				    data = JSON.parse(e.data),
					id = data.id, // message id related to the deferred object
					args = data.data, //
					apiInterface = args[0]; //  the api interface should be the first argument

				if (args[2].toLowerCase() == "xml") {
					// if dataType is xml, the ajax will return a xml object, which can't call
					// postMessage directly (will raise an exception) , instead we request to tranfer
					// XML as String, then parse it back to XML object.
					// io.js will fall to response.text
					// api.js will detect that convert it back to xml
					// @see io.js,api.js
					args[2] = "xmltext";
				}

				if (!apiInterface) { // interface can not be empty
					external.postMessage(JSON.stringify({
						id: id
					   ,data: [-1, "interface can not be empty"]
					}), targetOrigin);
					QQWB.log.error("interface is empty");
				} else {
					// This is extremely important to protect from XSS/CSRF attack
					if (!QQWB._apiProvider.isProvide(apiInterface)) {
				    	external.postMessage(JSON.stringify({
				    		id: id
				    	   ,data: [-1, "interface \"" + apiInterface +"\" is not supported"]
				    	}), targetOrigin);
					    QQWB.log.error("interface \"" + apiInterface +"\" is not allowed to be called");
					} else {
						// everything goes well
						// we directly pass the data to the reciever regardless its success or not
						//
						QQWB.io._apiAjax.apply(this,args).complete(function () {
				        	external.postMessage(JSON.stringify({
				        		id: id
				        	   ,data: QQWB.Array.fromArguments(arguments)
				        	}), targetOrigin);
						});
					}
				}
            }
            if (window.addEventListener) {
                window.addEventListener("message", messageHandler, false);
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", messageHandler);
            }
            QQWB.log.info("server message listener installed, waiting messages from client..."); 
        }
    } else {
        QQWB.log.info("library is booting at client proxy mode"); 
    }
} else {

    // IE will falls to here incorrectly since it lost the opener property after browser redirect in auth window
    // May be firefox and opera has the same problem? i didn't test it.
    // if (/redirectflag/.test(window.location.hash)) { // its in auth window, solve the opener problem (typically in IE)
    //} else {
        if (QQWB._domain.serverproxy !== window.location.href) { // scripts runs at client not server
            QQWB.log.info("library is booting at plain client mode, waiting init signal..."); 
            // adapt a solution
            if (QQWB.browser.feature.postmessage) {
                QQWB._solution.initSolution(QQWB._solution.HTML5_SOLUTION);
            } else if (QQWB.browser.feature.flash) {
                QQWB._solution.initSolution(QQWB._solution.FLASH_SOLUTION);
            }
        } else {
            QQWB.log.info("library is booting at plain server mode"); 
        }
    //}
}

// process document ready event
if (!QQWB._isDocumentReady) { // we will try to trigger the ready event many times when it has a change to be ready

    if (window.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {
            QQWB._tryToTriggerDocumentReadyEvents();
        }, false);
    }

    if (window.attachEvent) {
        document.attachEvent("onreadystatechange", function () {
            if (/complete/.test(document.readyState)) {
                document.detachEvent("onreadystatechange", arguments.callee);
                QQWB._tryToTriggerDocumentReadyEvents();
            }
        });
        if (window === window.top) { // not inside a frame
            (function (){

                if (QQWB._isDocumentReady) {return;}

                try {
                    document.documentElement.doScroll("left");
                } catch (ex) {
                    setTimeout(arguments.callee, 0);
                    return; // don't bother to try, the document is definitly not ready
                }

                QQWB._tryToTriggerDocumentReadyEvents();

            }());
        }
    }

    if (QQWB.browser.webkit) {
        (function () {
            if (QQWB._isDocumentReady) {return;}
            if (!/load|complete/.test(document.readyState)) {
                setTimeout(arguments.callee, 0);
                return; // don't bother to try, the document is definitly not ready
            }
            QQWB._tryToTriggerDocumentReadyEvents();
        }());
    }
}
/**
 * Tencent weibo javascript library
 *
 * Crossbrowser localstorage solution
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module localStorage
 * @requires base
 *           core.browser
 *           core.boot
 *           core.log
 *           core.time
 *           JSON2
 */

if (QQWB.browser.feature.localstorage) { // implement html5 localstorge
    QQWB.extend("localStorage", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            localStorage[key] = JSON.stringify(val);
            return localStorage[key];
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           var temp = localStorage[key];
           if (temp && (temp = JSON.parse(temp)) && temp.value &&  QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           localStorage.removeItem(key);
           return !!!localStorage[key];
        }
    });
} else if (QQWB.browser.feature.userdata) {
    var 
        userData,
        storeName = "QQWBLocalStore";

    QQWB.documentReady(function () {
        userData = document.createElement("input");
        userData.type = "hidden";
        userData.style.display="none";
        userData.addBehavior("#default#userData");
        userData.expires = new Date(QQWB.time.now() + 365 * 10 * 24 * 3600 * 1000).toUTCString();
        document.body.appendChild(userData);
    });

    QQWB.extend("store", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            !userData && QQWB.log.error("store can't set value for key " + key + ", userData is unavaiable, please try later");
            userData && userData.load(storeName);
            userData && userData.setAttribute(key,JSON.stringify(val));
            userData && userData.save(storeName);
            return userData.getAttribute(key);
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't get value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           var temp = userData && userData.getAttribute(key);
           if (temp && (temp = JSON.parse(temp)) && temp.value && QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't delete value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           userData && userData.removeAttribute(key);
           userData && userData.save(storeName);
           return !!!userData.getAttribute(key);
       }
   });

} else {
    QQWB.log.warning("T.localStorage object isn't initialized, do check before use");
}

if (QQWB.browser.feature.localstorage || QQWB.browser.feature.userdata) {
    QQWB._alias.call(QQWB.localStorage,"save",QQWB.localStorage.set);
    QQWB._alias.call(QQWB.localStorage,"remove",QQWB.localStorage.del);
}