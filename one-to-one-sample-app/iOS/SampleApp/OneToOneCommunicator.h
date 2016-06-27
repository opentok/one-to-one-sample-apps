//
//  TextChatComponentChatView.h
//  TextChatComponent
//
//  Created by Xi Huang on 2/23/16.
//  Copyright © 2016 Tokbox. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

typedef NS_ENUM(NSUInteger, OneToOneCommunicationSignal) {
    OneToOneCommunicationSignalSessionDidConnect = 0,
    OneToOneCommunicationSignalSessionDidDisconnect,
    OneToOneCommunicationSignalSessionDidFail,
    OneToOneCommunicationSignalSessionStreamCreated,
    OneToOneCommunicationSignalSessionStreamDestroyed,
    OneToOneCommunicationSignalPublisherDidFail,
    OneToOneCommunicationSignalPublisherStreamCreated,
    OneToOneCommunicationSignalPublisherStreamDestroyed,
    OneToOneCommunicationSignalSubscriberConnect,
    OneToOneCommunicationSignalSubscriberDidFail,
    OneToOneCommunicationSignalSubscriberVideoDisabled,
    OneToOneCommunicationSignalSubscriberVideoEnabled,
    OneToOneCommunicationSignalSubscriberVideoDisableWarning,
    OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted,
};

typedef void (^OneToOneCommunicatorBlock)(OneToOneCommunicationSignal signal, NSError *error);

@protocol OneToOneCommunicatorDelegate <NSObject>
- (void)oneToOneCommunicationWithSignal:(OneToOneCommunicationSignal)signal
                                  error:(NSError *)error;
@end

@interface OneToOneCommunicator : NSObject

+ (instancetype)oneToOneCommunicator;
+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;

- (void)connect;
- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler;
- (void)disconnect;

@property (weak, nonatomic) id<OneToOneCommunicatorDelegate> delegate;

// CALL
@property (readonly, nonatomic) BOOL isCallEnabled;

// SUBSCRIBER
@property (readonly, nonatomic) UIView *subscriberView;
@property (nonatomic) BOOL subscribeToAudio;
@property (nonatomic) BOOL subscribeToVideo;

// PUBLISHER
@property (readonly, nonatomic) UIView *publisherView;
@property (nonatomic) BOOL publishAudio;
@property (nonatomic) BOOL publishVideo;
@property (nonatomic) AVCaptureDevicePosition cameraPosition;

@end
