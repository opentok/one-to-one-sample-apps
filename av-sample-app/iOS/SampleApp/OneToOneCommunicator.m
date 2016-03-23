//
//  OneToOneCommunicator.m
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "OneToOneCommunicator.h"
#import "OTKAnalytics.h"

@interface OneToOneCommunicator() <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@property (nonatomic) NSString *apiKey;
@property (nonatomic) NSString *sessionId;
@property (nonatomic) NSString *token;

@property (nonatomic) OTSubscriber *subscriber;
@property (nonatomic) OTPublisher *publisher;
@property (nonatomic) OTSession *session;
@property (nonatomic) BOOL isSelfSubscribed;

@property (strong, nonatomic) OneToOneCommunicatorBlock handler;

@end

@implementation OneToOneCommunicator

- (OTPublisher *)publisher {
    if (!_publisher) {
        
        NSString *deviceName = [UIDevice currentDevice].name;
        _publisher = [[OTPublisher alloc] initWithDelegate:self name:deviceName];
    }
    return _publisher;
}

+ (instancetype)oneToOneCommunicator {
    return [OneToOneCommunicator sharedInstance];
}

+ (instancetype)sharedInstance {
    
    static OneToOneCommunicator *sharedInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[OneToOneCommunicator alloc] init];
        sharedInstance.isCallEnabled = YES;
    });
    return sharedInstance;
}

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token
          selfSubscribed:(BOOL)isSelfSubscribed {
    
    OneToOneCommunicator *sharedInstance = [OneToOneCommunicator sharedInstance];
    sharedInstance.apiKey = apiKey;
    sharedInstance.sessionId = sessionId;
    sharedInstance.token = token;
    sharedInstance.isSelfSubscribed = isSelfSubscribed;
}

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler {
    
    self.handler = handler;
    
    if (!self.session) {
        
        OneToOneCommunicator *sharedInstance = [OneToOneCommunicator sharedInstance];
        NSString *apiKey = sharedInstance.apiKey;
        NSString *sessionId = sharedInstance.sessionId;
        NSString *token = sharedInstance.token;
        
        self.session = [[OTSession alloc] initWithApiKey:apiKey sessionId:sessionId delegate:self];
        
        OTError *error;
        [self.session connectWithToken:token error:&error];
        
        if (error) {
            self.session = nil;
        }
        else {
            NSLog(@"%@", error);
        }
    }
}

- (void)disconnect {
    
    if (self.session) {
        
        OTError *error;
        [self.session disconnect:&error];
    }
    
    self.session = nil;
    self.handler = nil;
}

#pragma mark - OTSessionDelegate
-(void)sessionDidConnect:(OTSession*)session {
    
    if (!self.session) {
        return;
    }
    
    OTError *error;
    [self.session publish:self.publisher error:&error];
    if (error) {
        
    }
    else {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(){
            [self addLogEvent];
        });
        self.handler(OneToOneCommunicationSignalSessionDidConnect, nil);
    }
}

- (void)sessionDidDisconnect:(OTSession *)session {
    if (!self.session) {
        return;
    }
    
    if (self.publisher) {
        
        OTError *error = nil;
        [self.session unpublish:self.publisher error:&error];
        [self.publisher.view removeFromSuperview];
        if (error) {
            NSLog(@"%@", error);
        }
    }
    
    if (self.subscriber) {
        
        OTError *error = nil;
        [self.session unsubscribe:self.subscriber error:&error];
        [self.subscriber.view removeFromSuperview];
        if (error) {
            NSLog(@"%@", error);
        }
    }
    
    self.publisher = nil;
    self.subscriber = nil;
    self.handler(OneToOneCommunicationSignalSessionDidDisconnect, nil);
}

- (void)session:(OTSession *)session streamCreated:(OTStream *)stream {
    
    NSLog(@"session streamCreated (%@)", stream.streamId);
    if (!self.session || self.isSelfSubscribed) {
        return;
    }
    
    OTError *error;
    if (!self.subscriber) {
        self.subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];
    }
    
    [self.session subscribe:self.subscriber error:&error];
    if (error) {
        
    }
    else {
        self.handler(OneToOneCommunicationSignalSessionStreamCreated, nil);
    }
}

- (void)session:(OTSession *)session streamDestroyed:(OTStream *)stream {
    NSLog(@"session streamDestroyed (%@)", stream.streamId);
    
    if ([self.subscriber.stream.streamId isEqualToString:stream.streamId]) {

        [self.session unsubscribe:self.subscriber error:nil];
        [self.subscriber.view removeFromSuperview];
        self.subscriber = nil;
    }
    
    self.handler(OneToOneCommunicationSignalSessionStreamDestroyed, nil);
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {
    NSLog(@"session did failed with error: (%@)", error);
    self.handler(OneToOneCommunicationSignalSessionDidFail, error);
}

#pragma mark - OTPublisherDelegate
- (void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
    NSLog(@"publisher did failed with error: (%@)", error);
    self.handler(OneToOneCommunicationSignalPulibsherDidFail, error);
}

#pragma mark - OTSubscriberKitDelegate
-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
    self.handler(OneToOneCommunicationSignalSubscriberConnect, nil);
}

-(void)subscriberVideoDisabled:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisabled, nil);
}

- (void)subscriberVideoEnabled:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoEnabled, nil);
}

-(void) subscriberVideoDisableWarning:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisableWarning, nil);
}

-(void) subscriberVideoDisableWarningLifted:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted, nil);
}

- (void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
    NSLog(@"subscriber did failed with error: (%@)", error);
    self.handler(OneToOneCommunicationSignalSubscriberDidFail, error);
}

#pragma mark - private method
- (void)addLogEvent {
    NSString *apiKey = [OneToOneCommunicator sharedInstance].apiKey;
    NSString *sessionId = [OneToOneCommunicator sharedInstance].sessionId;
    NSInteger partner = [apiKey integerValue];
    OTKAnalytics *logging = [[OTKAnalytics alloc] initWithSessionId:sessionId connectionId:self.session.connection.connectionId partnerId:partner clientVersion:@"1.0.0"];
    [logging logEventAction:@"one-to-one-sample-app" variation:@""];
}

@end
