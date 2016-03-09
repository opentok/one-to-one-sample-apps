//
//  OTKAnalytics.m
//  SampleApp
//
//  Created by mserrano on 09/03/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <sys/utsname.h>
#import "OTKAnalytics.h"


@implementation OTKAnalyticsData

-(instancetype)initWithSessionId:(NSString*) sessionId connectionId:(NSString*) connectionId partnerId:(NSInteger) partnerId clientVersion:(NSString*) clientVersion {
    
    self = [super init];
    
    if ( sessionId == nil || [ sessionId length ]==0 ) {
        NSLog (@"The sessionId field cannot be null in the log entry");
        return nil;
    }
    
    if ( connectionId == nil || [ connectionId length ]==0 ) {
        NSLog (@"The connectionId field cannot be null in the log entry");
        return nil;
    }
    
    if ( partnerId == 0 ) {
        NSLog (@"The partnerId field cannot be null in the log entry");
        return nil;
    }
    
    if ( clientVersion == nil || [ clientVersion length ]==0 ) {
        NSLog (@"The clientVersion field cannot be null in the log entry");
        return nil;
    }
    
    self.sessionId = sessionId;
    self.connectionId = connectionId;
    self.partnerId = partnerId;
    self.clientVersion = clientVersion;
    
    return self;
}

@end

@implementation OTKAnalytics

NSString *const kLoggingUrl = @"https://hlg.tokbox.com/prod/logging/ClientEvent";

OTKAnalyticsData *_data;

-(instancetype)initWithData:(OTKAnalyticsData *)data {
    
    if ( data == nil ) {
        NSLog (@"The data cannot be null in the log entry");
        return nil;
    }
    
    _data = data;
    
    return self;
}

- (void) checkData {
    
    NSException *e = nil;
    
    if ( _data.logVersion == nil || [ _data.logVersion length ]==0 ) {
        _data.logVersion = @"2";
    }
    
    if ( _data.guid == nil || [ _data.guid length ]==0 ) {
        _data.guid = [[NSUUID UUID] UUIDString];
    }
    
    if ( _data.deviceModel == nil || [ _data.deviceModel length ]==0 ) {
        struct utsname systemInfo;
        uname(&systemInfo);
        _data.deviceModel = [NSString stringWithCString:systemInfo.machine
                                               encoding:NSUTF8StringEncoding];
    }
    
    if ( _data.client == nil || [ _data.client length ]==0 ) {
        _data.client = @"native";
    }
    
    if ( _data.clientSystemTime == 0 ) {
        NSTimeInterval timeInMiliseconds = [[NSDate date] timeIntervalSince1970];
        NSInteger time = round(timeInMiliseconds);
        _data.clientSystemTime = time;
    }
    
    if ( _data.systemName == nil || [ _data.systemName length ]==0 ) {
        _data.systemName = @"iOS OS";
    }
    
    if ( _data.systemVersion == nil || [ _data.systemVersion length ]==0 ) {
        _data.systemVersion = [[UIDevice currentDevice] systemVersion];
    }
    
}

-(void)logEventAction:(NSString *)action variation:(NSString *) variation {
    
    _data.action = action;
    _data.variation = variation;
    
    [self checkData];
    
    NSDictionary *dictionary = @{
                                 @"sessionId" : _data.sessionId,
                                 @"connectionId" : _data.connectionId,
                                 @"partnerId" : [NSNumber numberWithInteger:_data.partnerId],
                                 @"client" : _data.client,
                                 @"logVersion" : _data.logVersion,
                                 @"clientVersion" : _data.clientVersion,
                                 @"clientSystemTime" : [NSNumber numberWithInteger:_data.clientSystemTime],
                                 @"guid" : _data.guid,
                                 @"deviceModel": _data.deviceModel,
                                 @"systemName": _data.systemName,
                                 @"systemVersion": _data.systemVersion,
                                 @"action": _data.action,
                                 @"variation": _data.variation
                                 };
    
    [self sendData: dictionary];
    
}

-(void) sendData: (NSDictionary*) data {
    NSError *error;
    
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration delegate:nil delegateQueue:nil];
    NSURL *url = [NSURL URLWithString: kLoggingUrl];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url
                                                           cachePolicy:NSURLRequestUseProtocolCachePolicy
                                                       timeoutInterval:60.0];
    
    [request addValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPMethod:@"POST"];
    
    NSData *postData = [NSJSONSerialization dataWithJSONObject:data options:0 error:&error];
    [request setHTTPBody:postData];
    
    NSURLSessionDataTask *postDataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
        NSLog(@"response status code: %ld", (long)[httpResponse statusCode]);
    }];
    
    [postDataTask resume];
    
}

@end
