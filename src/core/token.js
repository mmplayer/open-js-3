/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module token
 * @requires base
 * @includes util.queryString
 *           util.cookie
 *           common.JSON
 */
/*jslint laxcomma:true*/
/*global QQWB*/
QQWB.extend("_token",{
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     * @param expireIn {Number} expire after seconds from now
     * @param optUsername {String} username associate with accesstoken
     * @param optNickname {String} nickname associate with accesstoken
     * @return {Object} QQWB object
     */
    setAccessToken: function (accessToken, openid, expireIn, optUsername, optNickname) {

        var _ = QQWB,

            _b = _.bigtable,

            _c = _.cookie,

            _t = _.time,

            user;

        user = this.getTokenUser();

		// 如果expireIn为0，那么把cookie设置为session类型
		if (!expireIn) expireIn = null;

        _c.set(_b.get("cookie","getAccesstokenName")()

                       ,[accessToken, openid, _t.now() + 7 * 24 * 3600 * 1000, optUsername || (user && user.name) || "", optNickname || (user && user.nick) || ""].join("|")

                       ,expireIn

                       ,_b.get("cookie","path")

                       ,_b.get("cookie","domain")
            );

        return _;
    }

    /**
     * Get access token saved before
     *
     * @access public
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function () {

        var _ = QQWB,

            _b = _.bigtable,

            _c = _.cookie,

            token;

        token = _c.get(_b.get("cookie","getAccesstokenName")());

         if (token) {

             return token.split("|",1)[0];

         }

    }

    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function () {

        var _ = QQWB,

            _b = _.bigtable,

            _c = _.cookie,

            token;

        token = _c.get(_b.get("cookie","getAccesstokenName")());

         if (token) {

             token = token.split("|",5);

             return {

                 openid: token[1]

                ,name: token[3]

                ,nick: token[4]

             };


         }

    }

    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function () {

       var _ = QQWB,

           _c = _.cookie,

           _b = _.bigtable,

           name = _b.get("cookie","getAccesstokenName")(),

           path = _b.get("cookie","path"),

           domain = _b.get("cookie","domain");

       _c.del(name,path,domain);

       _c.del(name,'/',domain);

       return _;

    }

    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken) {

        var _ = QQWB,

            _b = _.bigtable,

            _c = _.cookie;

        _c.set(_b.get("cookie","getRefreshtokenName")()

                ,refreshToken

                ,_b.get("cookie","refreshtokenexpires")

                ,_b.get("cookie","path")

                ,_b.get("cookie","domain")
            );

        return _;

    }

    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function () {

       return QQWB.cookie.get(QQWB.bigtable.get("cookie","getRefreshtokenName")());

    }

    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function () {

       var _ = QQWB,

           _c = _.cookie,

           _b = _.bigtable,

           name = _b.get("cookie","getRefreshtokenName")(),

           path = _b.get("cookie","path"),

           domain = _b.get("cookie","domain");

       _c.del(name,path,domain);

       _c.del(name,'/',domain);

       return _;
    }

    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optCallback) {

       var _ = QQWB,

           _b = _.bigtable,

           _q = _.queryString,

           _l = _.log,

           _i = _.io,

           _s = _.String,

           _to = _._token,

           refreshToken = _to.getRefreshToken(),

           appkey = _b.get("base", "appkey");

       _i.jsonp({

                url: _b.get("uri","exchangetoken")

               ,dataType: "text"

               ,data: _q.encode({

                          grant_type: "refresh_token"

                         ,client_id: appkey

                         ,refresh_token: refreshToken
                      })

       }).success(function (response) {

           var _response = response;

           if(_s.isString(response)) response = _q.decode(response);

           if(response.access_token){

              if( !response.expires_in ) _l.info("[exchangetoken] token expires_in not retrieved");

              if( !response.name && !response.wb_name ) _l.info("[exchangetoken] weibo username not retrieved, will not update username");

              if( !response.nick && !response.wb_nick ) _l.info("[exchangetoken] weibo nick not retrieved, will not update nick");

               _to.setAccessToken(response.access_token, response.openid || '', response.expires_in ? parseInt(response.expires_in,10) : 0, response.name || response.wb_name || '', response.nick || response.wb_nick || '');

               if (response.refresh_token) {

                    _to.setRefreshToken(response.refresh_token);

               } else {

                   _l.warning("[exchangetoken] refresh token not retrieved");

               }

               if (!_.loginStatus()) {

                   _l.warn("[exchangetoken] thirdparty cookie needs to be enabled, please follow this instruction to set P3P header http://url.cn/0ZbFuL");

               }

               _l.info("exchange token succeed");

           } else if (response.error) {

               _l.error("exchange token error " + response.error );

           } else {

               _l.error("[exchangetoken] unexpected result returned from server " + _response + " while exchanging for new accesstoken");

           }

       }).error(function (status, statusText) {

           if (status === 404) {

               _l.error("exchange token has failed, script not found");

           } else {

               _l.error("exchange token has failed, " + statusText);

           }

       }).complete(function (arg1, arg2, arg3) {

           if (optCallback) optCallback(arg1, arg2, arg3);

       });

       return _;

    }

    /**
     * Auto resolve response from server
     *
     * @param responseText {String} the server response
     */
   ,resolveResponse: function (responseText, triggerAuthEvents) {

       var _ = QQWB,

           _b = _.bigtable,

           _q = _.queryString,

           _l = _.log,

           _s = _.String,

           _to = _._token,

           loginStatus,

           response = _s.isString(responseText) ? _q.decode(responseText) : responseText;

           _l.debug(["resolve response ", _.JSON.stringify(response)].join(""));

       if (response.access_token) {

          if( !response.expires_in ) _l.info("token expires_in not retrieved or disabled");

          if( !response.name && !response.wb_name ) _l.info("weibo username not retrieved");

          if( !response.nick && !response.wb_nick ) _l.info("weibo usernick not retrieved");

          _to.setAccessToken(response.access_token, response.openid || '', response.expires_in ? parseInt(response.expires_in,10) : 0, response.name || response.wb_name || '', response.nick || response.wb_nick || '');

           if (response.refresh_token) {

               _to.setRefreshToken(response.refresh_token);

           } else {

               _l.info("refresh token not retrieved or disabled");

           }

           if (triggerAuthEvents) {

               loginStatus = _.loginStatus();

               if (loginStatus) {

                   _l.info("user " + loginStatus.name || "unknown" + " logged in");

                   _.trigger(_b.get("nativeevent","userloggedin"),loginStatus);

               } else {

                   _l.warn("thirdparty cookie needs to be enabled, please follow this instruction to set P3P header http://url.cn/0ZbFuL");

               }

           }

       } else if (response.error || response.errorMsg) {

           _l.error("login error occurred " + response.error);

           if (triggerAuthEvents) {

              response.error = response.error || response.errorMsg;

              response.message = response.error;

              _.trigger(_b.get("nativeevent","userloginfailed"),response);

           }

       } else {

           _l.error("unexpected result returned from server " + responseText);

           //throw new Error("confused server response " + responseText);

           if (triggerAuthEvents) {

               response = {};

               response.message = response.error = "server error";

               _.trigger(_b.get("nativeevent","userloginfailed"),response);
           }

       }

       return _;

   }

});
