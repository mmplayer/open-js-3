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
 * @includes util.bigtable
 *           util.time
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

		var _ = QQWB,
		    
		    _b = _.bigtable,

		    logbox;

		output = [

			window.name ? window.name : "",

            (window.opener || window.name === _b.get("oauthwindow","name")) ? "#" : "", // opened window, window.name can cross domain!!

			window != window.parent ? "*" : "", // in frame

			_.name,

			": ",

			"[" + level + "] ",

			_.time.shortTime() + " ",

            message,

		].join("");

		logbox = _b.get("log","latest");

		if (!logbox) {

			logbox = _b.put("log", "latest",[]);

		}

        // black box
		if (logbox.length >= 200) {

			logbox.shift();

		}

		logbox.push(output);

        // no frame messages
        QQWB.debug && window.console && window.console.log(output);
     }
	 /**
	  * Get latest log, this ignores debug setting, max 200 logs
	  *
	  * @access public
	  */
	,last: function (inLimit) {

		var latestlogs = QQWB.bigtable.get("log","latest");

		if (latestlogs && inLimit) {

			latestlogs = latestlogs.slice(0,inLimit);

		}
		
		return latestlogs ? latestlogs.join("\n") : "";

	 }
});

QQWB.log.warn = QQWB.log.warning;

QQWB.log.setLevel(QQWB.envs.loglevel);
