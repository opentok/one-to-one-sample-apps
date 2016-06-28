//
//  TextChatComponentChatView.h
//  TextChatComponent
//
//  Created by Xi Huang on 2/23/16.
//  Copyright © 2016 Tokbox. All rights reserved.
//

#import <Opentok/OpenTok.h>

#import "OneToOneCommunicator.h"
#import <OTKAnalytics/OTKLogger.h>

#import <OTAcceleratorPackUtil/OTAcceleratorPackUtil.h>

static NSString* const KLogClientVersion = @"ios-vsol-1.0.0";
static NSString* const kLogComponentIdentifier = @"oneToOneCommunication";
static NSString* const KLogActionInitialize = @"Init";
static NSString* const KLogActionStartCommunication = @"StartComm";
static NSString* const KLogActionEndCommunication = @"EndComm";
static NSString* const KLogVariationAttempt = @"Attempt";
static NSString* const KLogVariationSuccess = @"Success";
static NSString* const KLogVariationFailure = @"Failure";

@interface OneToOneCommunicator() <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@property (nonatomic) BOOL isCallEnabled;
@property (nonatomic) OTSubscriber *subscriber;
@property (nonatomic) OTPublisher *publisher;
@property (nonatomic) OTAcceleratorSession *session;

@property (strong, nonatomic) OneToOneCommunicatorBlock handler;

@end

@implementation OneToOneCommunicator

+ (instancetype)oneToOneCommunicator {
    return [OneToOneCommunicator sharedInstance];
}

+ (instancetype)sharedInstance {
    
    [OTKLogger analyticsWithClientVersion:KLogClientVersion
                                   source:[[NSBundle mainBundle] bundleIdentifier]
                              componentId:kLogComponentIdentifier
                                     guid:[[NSUUID UUID] UUIDString]];
    
    [OTKLogger logEventAction:KLogActionInitialize variation:KLogVariationAttempt completion:nil];

    static OneToOneCommunicator *sharedInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[OneToOneCommunicator alloc] init];
        sharedInstance.session = [OTAcceleratorSession getAcceleratorPackSession];
        
        [OTKLogger logEventAction:KLogActionInitialize variation:KLogVariationSuccess completion:nil];
    });
    
    if (!sharedInstance) {
        [OTKLogger logEventAction:KLogActionInitialize variation:KLogVariationFailure completion:nil];
    }
    return sharedInstance;
}

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token {

    [OTAcceleratorSession setOpenTokApiKey:apiKey sessionId:sessionId token:token];
    [OneToOneCommunicator sharedInstance];
}

- (void)connect {
    
    [OTKLogger logEventAction:KLogActionStartCommunication
                    variation:KLogVariationAttempt
                   completion:nil];
    
    [OTAcceleratorSession registerWithAccePack:self];
    
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
    
    self.isCallEnabled = YES;
}

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler {

    self.handler = handler;
    [self connect];
    
    [OTAcceleratorSession registerWithAccePack:self];
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
    
    NSError *disconnectError = [OTAcceleratorSession deregisterWithAccePack:self];
    if (!disconnectError) {
        [OTKLogger logEventAction:KLogActionEndCommunication
                        variation:KLogVariationSuccess
                       completion:nil];
    }
    else {
        [OTKLogger logEventAction:KLogActionEndCommunication
                        variation:KLogVariationFailure
                       completion:nil];
    }
    
    self.isCallEnabled = NO;
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
    [OTKLogger setSessionId:session.sessionId connectionId:session.connection.connectionId partnerId:@([self.session.apiKey integerValue])];
    
    if (!self.publisher) {
        NSString *deviceName = [UIDevice currentDevice].name;
        self.publisher = [[OTPublisher alloc] initWithDelegate:self name:deviceName];
    }
    
    OTError *error;
    [self.session publish:self.publisher error:&error];
    if (error) {
        [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidConnect
                             error:error];
        [OTKLogger logEventAction:KLogActionStartCommunication
                        variation:KLogVariationFailure
                       completion:nil];
    }
    else {
        [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidConnect
                             error:nil];
        [OTKLogger logEventAction:KLogActionStartCommunication
                        variation:KLogVariationSuccess
                       completion:nil];
    }
}

- (void)sessionDidDisconnect:(OTSession *)session {

    NSLog(@"OneToOneCommunicator sessionDidDisconnect:");

    self.publisher = nil;
    self.subscriber = nil;
    
    
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidDisconnect
                         error:nil];
    
    [OTKLogger logEventAction:KLogActionEndCommunication
                    variation:KLogVariationSuccess
                   completion:nil];
}

- (void)session:(OTSession *)session streamCreated:(OTStream *)stream {

    NSLog(@"session streamCreated (%@)", stream.streamId);
    
    OTError *error;
    self.subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];
    [self.session subscribe:self.subscriber error:&error];
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionStreamCreated
                         error:error];
}

- (void)session:(OTSession *)session streamDestroyed:(OTStream *)stream {
    NSLog(@"session streamDestroyed (%@)", stream.streamId);

    if (self.subscriber.stream && [self.subscriber.stream.streamId isEqualToString:stream.streamId]) {
        [self.subscriber.view removeFromSuperview];
        self.subscriber = nil;
        [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionStreamDestroyed
                             error:nil];
    }
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {
    NSLog(@"session did failed with error: (%@)", error);
    [self notifiyAllWithSignal:OneToOneCommunicationSignalSessionDidFail
                         error:error];
    
    [OTKLogger logEventAction:KLogActionStartCommunication
                    variation:KLogVariationFailure
                   completion:nil];
}

#pragma mark - OTPublisherDelegate
- (void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
    NSLog(@"publisher did failed with error: (%@)", error);
    [self notifiyAllWithSignal:OneToOneCommunicationSignalPublisherDidFail
                         error:error];
}

- (void)publisher:(OTPublisherKit*)publisher streamCreated:(OTStream*)stream {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalPublisherStreamCreated
                         error:nil];
}

- (void)publisher:(OTPublisherKit*)publisher streamDestroyed:(OTStream*)stream {
    [self notifiyAllWithSignal:OneToOneCommunicationSignalPublisherStreamDestroyed
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
                         error:error];
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
