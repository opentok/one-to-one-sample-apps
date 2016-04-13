//
//  OneToOneCommunicator.m
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <Opentok/OpenTok.h>

#import "OneToOneCommunicator.h"
#import "OTKAnalytics.h"

#import "AcceleratorPackSession.h"

@interface OneToOneCommunicator() <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@property (nonatomic) BOOL isCallEnabled;
@property (nonatomic) OTSubscriber *subscriber;
@property (nonatomic) OTPublisher *publisher;
@property (nonatomic) AcceleratorPackSession *session;
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

- (BOOL)isCallEnabled {
    return self.handler ? YES :  NO;
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
        sharedInstance.session = [AcceleratorPackSession getAcceleratorPackSession];
        [AcceleratorPackSession registerWithAccePack:sharedInstance];
    });
    return sharedInstance;
}

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token
          selfSubscribed:(BOOL)isSelfSubscribed {

    [AcceleratorPackSession setOpenTokApiKey:apiKey sessionId:sessionId token:token];
    OneToOneCommunicator *sharedInstance = [OneToOneCommunicator sharedInstance];
    sharedInstance.isSelfSubscribed = isSelfSubscribed;
}

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler {

    self.handler = handler;

    OTError *error = [AcceleratorPackSession connect];
    if (error) {
        NSLog(@"%@", error);
    }
}

- (void)disconnect {
    
    OTError *error = [AcceleratorPackSession disconnect];
    if (error) {
        NSLog(@"%@", error);
    }
}

#pragma mark - OTSessionDelegate
-(void)sessionDidConnect:(OTSession*)session {

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

    if (_publisher) {

        OTError *error = nil;
        [_publisher.view removeFromSuperview];
        [self.session unpublish:self.publisher error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }

    if (self.subscriber) {

        OTError *error = nil;
        [self.subscriber.view removeFromSuperview];
        [self.session unsubscribe:self.subscriber error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }

    _publisher = nil;
    self.subscriber = nil;
    
    if (self.handler) {
        self.handler(OneToOneCommunicationSignalSessionDidDisconnect, nil);
    }
    self.handler = nil;
}

- (void)session:(OTSession *)session streamCreated:(OTStream *)stream {

    NSLog(@"session streamCreated (%@)", stream.streamId);
    if (self.isSelfSubscribed) {
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
    self.handler(OneToOneCommunicationSignalPublisherDidFail, error);
}

#pragma mark - OTSubscriberKitDelegate
-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
    self.handler(OneToOneCommunicationSignalSubscriberConnect, nil);
}

- (void)subscriberVideoDataReceived:(OTSubscriber *)subscriber {}

-(void)subscriberVideoDisabled:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisabled, nil);
}

- (void)subscriberVideoEnabled:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self.handler(OneToOneCommunicationSignalSubscriberVideoEnabled, nil);
}

- (void)subscriberVideoDisableWarning:(OTSubscriberKit*)subscriber {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisableWarning, nil);
}

- (void)subscriberVideoDisableWarningLifted:(OTSubscriberKit*)subscriber {
    self.handler(OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted, nil);
}

- (void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
    NSLog(@"subscriber did failed with error: (%@)", error);
    self.handler(OneToOneCommunicationSignalSubscriberDidFail, error);
}

#pragma mark - private method
- (void)addLogEvent {
    NSString *apiKey = self.session.apiKey;
    NSString *sessionId = self.session.sessionId;
    NSInteger partner = [apiKey integerValue];
    OTKAnalytics *logging = [[OTKAnalytics alloc] initWithSessionId:sessionId connectionId:self.session.connection.connectionId partnerId:partner clientVersion:@"ios-vsol-1.0.0"];
    [logging logEventAction:@"one-to-one-sample-app" variation:@""];
}

#pragma mark - Setters and Getters
- (UIView *)subscriberView {
    return self.subscriber.view;
}

- (UIView *)publisherView {
    return self.publisher.view;
}

- (void)setSubscribeToAudio:(BOOL)subscribeToAudio {
    _subscriber.subscribeToAudio = subscribeToAudio;
}

- (BOOL)subscribeToAudio {
    return _subscriber.subscribeToAudio;
}

- (void)setSubscribeToVideo:(BOOL)subscribeToVideo {
    _subscriber.subscribeToVideo = subscribeToVideo;
}

- (BOOL)subscribeToVideo {
    return _subscriber.subscribeToVideo;
}

- (void)setPublishAudio:(BOOL)publishAudio {
    _publisher.publishAudio = publishAudio;
}

- (BOOL)publishAudio {
    return _publisher.publishAudio;
}

- (void)setPublishVideo:(BOOL)publishVideo {
    _publisher.publishVideo = publishVideo;
}

- (BOOL)publishVideo {
    return _publisher.publishVideo;
}

- (AVCaptureDevicePosition)cameraPosition {
    return _publisher.cameraPosition;
}

- (void)setCameraPosition:(AVCaptureDevicePosition)cameraPosition {
    _publisher.cameraPosition = cameraPosition;
}

@end