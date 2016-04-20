//
//  OTKAnalytics.m
//  SampleApp
//
//  Created by mserrano on 09/03/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <sys/utsname.h>
#import "OTKAnalytics.h"


NSString *const kLoggingUrl = @"https://hlg.tokbox.com/prod/logging/ClientEvent";

@interface OTKAnalytics()

//public properties
@property (nonatomic) NSString *sessionId;
@property (nonatomic) NSString *connectionId;
@property (nonatomic) NSInteger partnerId;
@property (nonatomic) NSString *clientVersion;
@property (nonatomic) NSString *source;
@property (nonatomic) NSString *action;
@property (nonatomic) NSString *variation;

// nonpublic properties
@property (nonatomic) NSString *logVersion;
@property (nonatomic) NSString *client;
@property (nonatomic) NSString *guid;
@property (nonatomic) NSString *deviceModel;
@property (nonatomic) NSString *systemName;
@property (nonatomic) NSString *systemVersion;
@property (nonatomic) NSInteger clientSystemTime;

@end

@implementation OTKAnalytics

-(instancetype)initWithSessionId:(NSString*)sessionId
                    connectionId:(NSString*)connectionId
                       partnerId:(NSInteger) partnerId
                   clientVersion:(NSString*) clientVersion
                          source:(NSString*) source {
    
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
    
    if ( source == nil || [ source length ]==0 ) {
        NSLog (@"The source field cannot be null in the log entry");
        return nil;
    }
    
    if (self = [super init]) {
        _sessionId = sessionId;
        _connectionId = connectionId;
        _partnerId = partnerId;
        _clientVersion = clientVersion;
        _source = source;
        
        _logVersion = @"2";
        _guid = [[NSUUID UUID] UUIDString];
        _client = @"native";
        _systemName = @"iOS OS";
        _systemVersion = [[UIDevice currentDevice] systemVersion];
        
        struct utsname systemInfo;
        uname(&systemInfo);
        _deviceModel = [NSString stringWithCString:systemInfo.machine
                                               encoding:NSUTF8StringEncoding];
        
        NSTimeInterval timeInMiliseconds = [[NSDate date] timeIntervalSince1970];
        NSInteger time = round(timeInMiliseconds);
        _clientSystemTime = time;

    }
    
    return self;
}

-(void)logEventAction:(NSString *)action variation:(NSString *) variation {
    
    _action = action;
    _variation = variation;
    
    NSDictionary *dictionary = @{
                                 @"sessionId" : _sessionId,
                                 @"connectionId" : _connectionId,
                                 @"partnerId" : [NSNumber numberWithInteger:_partnerId],
                                 @"client" : _client,
                                 @"logVersion" : _logVersion,
                                 @"clientVersion" : _clientVersion,
                                 @"source" : _source,
                                 @"clientSystemTime" : [NSNumber numberWithInteger:_clientSystemTime],
                                 @"guid" : _guid,
                                 @"deviceModel": _deviceModel,
                                 @"systemName": _systemName,
                                 @"systemVersion": _systemVersion,
                                 @"action": _action,
                                 @"variation": _variation
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
