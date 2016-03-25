var OTKAnalytics = (function() {

    var OTKAnalyticsComponent = function(data) {
        this.url = 'https://hlg.tokbox.com/prod/logging/ClientEvent';

        this.analyticsData = data;
    }

    var _checkData = function() {
        var self = this;
        
        if ( self.analyticsData.sessionId === null || self.analyticsData.sessionId.length === 0){
            console.log ("Error. The sessionId field cannot be null in the log entry");
            throw("The sessionId field cannot be null in the log entry");
        }
        if ( self.analyticsData.connectionId == null || self.analyticsData.connectionId.length == 0){
            console.log ("Error. The connectionId field cannot be null in the log entry");
            throw("The connectionId field cannot be null in the log entry");
        }
        if ( self.analyticsData.partnerId == 0){
            console.log ("Error. The partnerId field cannot be null in the log entry");
            throw("The partnerId field cannot be null in the log entry");
        }
        if ( self.analyticsData.clientVersion == null || self.analyticsData.clientVersion.length == 0){
            console.log ("Error. The clientVersion field cannot be null in the log entry");
            throw("The clientVersion field cannot be null in the log entry");
        }
        if ( self.analyticsData.logVersion == null || self.analyticsData.logVersion.length == 0){
            self.analyticsData.logVersion  = "2";
        }
        if ( self.analyticsData.guid == null || self.analyticsData.guid.length == 0){
            self.analyticsData.guid  = _generateUuid();
        }
        if ( self.analyticsData.clientSystemTime == 0){
            self.analyticsData.clientSystemTime  = new Date().getTime();;
        }    
    };

    var _generateUuid = function() {

        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    var _sendData = function() {
        var self = this;

        var payload = self.analyticsData.payload || "";

        if (typeof(payload) === "object") {
            payload = JSON.stringify(payload);
        }

        self.analyticsData.payload = payload;

        var urlEncodedData = JSON.stringify(self.analyticsData);

        var http = new XMLHttpRequest();
        http.open("POST", self.url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send(urlEncodedData);
    };

    OTKAnalyticsComponent.prototype =  {
        constructor: OTKAnalytics,

        logEvent: function(data) { 
            this.analyticsData.action = data.action;
            this.analyticsData.variation = data.variation;

            //check values
            _checkData.call(this);

            //send data to analytics server
            _sendData.call(this);
        }
    }
    return OTKAnalyticsComponent;
})();
