var OTKAnalytics = (function() {


    var OTKAnalyticsComponent = function(data) {
        this.url = 'https://hlg.tokbox.com/prod/logging/ClientEvent';

        this.analytics_data = data;
    }

    var _check_data = function() {
        var self = this;
        
        if ( self.analytics_data.sessionId === null || self.analytics_data.sessionId.length === 0){
            console.log ("Error. The sessionId field cannot be null in the log entry");
            throw("The sessionId field cannot be null in the log entry");
        }
        if ( self.analytics_data.connectionId == null || self.analytics_data.connectionId.length == 0){
            console.log ("Error. The connectionId field cannot be null in the log entry");
            throw("The connectionId field cannot be null in the log entry");
        }
        if ( self.analytics_data.partnerId == 0){
            console.log ("Error. The partnerId field cannot be null in the log entry");
            throw("The partnerId field cannot be null in the log entry");
        }
        if ( self.analytics_data.clientVersion == null || self.analytics_data.clientVersion.length == 0){
            console.log ("Error. The clientVersion field cannot be null in the log entry");
            throw("The clientVersion field cannot be null in the log entry");
        }
        if ( self.analytics_data.logVersion == null || self.analytics_data.logVersion.length == 0){
            self.analytics_data.logVersion  = "2";
        }
        if ( self.analytics_data.guid == null || self.analytics_data.guid.length == 0){
            self.analytics_data.guid  = _generate_uuid();
        }
        if ( self.analytics_data.clientSystemTime == 0){
            self.analytics_data.clientSystemTime  = new Date().getTime();;
        }    
    };

    var _generate_uuid = function() {

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

    var _send_data = function() {
        var self = this;

        var payload = self.analytics_data.payload || "";

        if (typeof(payload) === "object") {
            payload = JSON.stringify(payload);
        }

        self.analytics_data.payload = payload;

        var url_encoded_data = JSON.stringify(self.analytics_data);

        var http = new XMLHttpRequest();
        http.open("POST", self.url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send(url_encoded_data);
    };

    OTKAnalyticsComponent.prototype =  {
        constructor: OTKAnalytics,

        logEvent: function(data) { //action && variation
            this.analytics_data.action = data.action;
            this.analytics_data.variation = data.variation;

            //check values
            _check_data.call(this);

            //send data to analytics server
            _send_data.call(this);
        }
    }
    return OTKAnalyticsComponent;
})();

