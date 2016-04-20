//
//  TextChatComponentChatView.h
//  TextChatComponent
//
//  Created by Xi Huang on 2/23/16.
//  Copyright © 2016 Tokbox. All rights reserved.
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

@property (strong, nonatomic) OneToOneCommunicatorBlock handler;

@end

@implementation OneToOneCommunicator

- (BOOL)isCallEnabled {
    return self.session.sessionConnectionStatus == OTSessionConnectionStatusConnected ? YES :  NO;
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
    });
    return sharedInstance;
}

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token {

    [AcceleratorPackSession setOpenTokApiKey:apiKey sessionId:sessionId token:token];
    [OneToOneCommunicator sharedInstance];
}

- (void)connect {
    
    [AcceleratorPackSession registerWithAccePack:self];
    
    // need to explcitly publish and subscribe if the communicator joins/rejoins a connected session
    if (self.session.sessionConnectionStatus == OTSessionConnectionStatusConnected &&
        self.session.streams[self.publisher.stream.streamId]) {
        
        OTError *error = nil;
        [self.session publish:self.publisher error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }
    
    if (self.session.sessionConnectionStatus == OTSessionConnectionStatusConnected &&
        self.session.streams[self.subscriber.stream.streamId]) {
        
        OTError *error = nil;
        [self.session subscribe:self.subscriber error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }
}

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler {

    self.handler = handler;
    
    [AcceleratorPackSession registerWithAccePack:self];
    
    // need to explcitly publish and subscribe if the communicator joins/rejoins a connected session
    if (self.session.sessionConnectionStatus == OTSessionConnectionStatusConnected &&
        self.session.streams[self.publisher.stream.streamId]) {
        
        OTError *error = nil;
        [self.session publish:self.publisher error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }
    
    if (self.session.sessionConnectionStatus == OTSessionConnectionStatusConnected &&
        self.session.streams[self.subscriber.stream.streamId]) {
        
        OTError *error = nil;
        [self.session subscribe:self.subscriber error:&error];
        if (error) {
            NSLog(@"%@", error.localizedDescription);
        }
    }
}

- (void)disconnect {
    
    // need to explicitly unpublish and unsubscriber if the communicator is the only part to dismiss from the accelerator session
    // when there are multiple accelerator packs, the accelerator session will not call the disconnect method until the last delegate object is removed
    if (self.publisher) {
        
        OTError *error = nil;
        [self.publisher.view removeFromSuperview];
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
    
    [AcceleratorPackSession deregisterWithAccePack:self];
}

- (void)notifiyAllWithSignal:(OneToOneCommunicationSignal)signal error:(NSError *)error {
    
    if (self.handler) {
        self.handler(signal, error);
    }
    
    if (self.delegate) {
        [self.delegate oneToOneCommunicationWithSignal:signal error:error];
    }
}

#pragma mark - OTSessionDelegate
-(void)sessionDidConnect:(OTSession*)session {
    
    NSLog(@"OneToOneCommunicator sessionDidConnect:");
    
    if (!self.publisher) {
        NSString *deviceName = [UIDevice currentDevice].name;
        self.publisher = [[OTPublisher alloc] initWithDelegate:self name:deviceName];
    }
    
    OTError *error;
    [self.session publish:self.publisher error:&error];
    if (error) {

    }
    else {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(){
            [self addLogEvent];
        });
        [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidConnect
                             error:nil];
    }
}

- (void)sessionDidDisconnect:(OTSession *)session {

    NSLog(@"OneToOneCommunicator sessionDidDisconnect:");

    self.publisher = nil;
    self.subscriber = nil;
    
    
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidDisconnect
                         error:nil];
}

- (void)session:(OTSession *)session streamCreated:(OTStream *)stream {

    NSLog(@"session streamCreated (%@)", stream.streamId);

    OTError *error;
    self.subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];
    [self.session subscribe:self.subscriber error:&error];
    if (error) {

    }
    else {
        [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionStreamCreated
                             error:nil];
    }
}

- (void)session:(OTSession *)session streamDestroyed:(OTStream *)stream {
    NSLog(@"session streamDestroyed (%@)", stream.streamId);

    if ([self.subscriber.stream.streamId isEqualToString:stream.streamId]) {

        [self.session unsubscribe:self.subscriber error:nil];
        [self.subscriber.view removeFromSuperview];
        self.subscriber = nil;
    }
    
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionStreamDestroyed
                         error:nil];
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {
    NSLog(@"session did failed with error: (%@)", error);
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidFail
                         error:nil];
}

#pragma mark - OTPublisherDelegate
- (void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
    NSLog(@"publisher did failed with error: (%@)", error);
    [self notifiyAllWithSignal:OneToOneCommunicationSignalPublisherDidFail
                         error:nil];
}

#pragma mark - OTSubscriberKitDelegate
-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberConnect
                         error:nil];
}

-(void)subscriberVideoDisabled:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberVideoDisabled
                         error:nil];
}

- (void)subscriberVideoEnabled:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberVideoEnabled
                         error:nil];
}

-(void) subscriberVideoDisableWarning:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberVideoDisableWarning
                         error:nil];
}

-(void) subscriberVideoDisableWarningLifted:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted
                         error:nil];
}

- (void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
    NSLog(@"subscriber did failed with error: (%@)", error);
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSubscriberDidFail
                         error:nil];
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
    return _subscriber.view;
}

- (UIView *)publisherView {
    return _publisher.view;
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