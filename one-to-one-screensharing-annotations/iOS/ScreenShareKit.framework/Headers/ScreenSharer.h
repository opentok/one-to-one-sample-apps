//
//  TextChatComponentChatView.h
//  TextChatComponent
//
//  Created by Xi Huang on 6/08/16.
//  Copyright © 2016 Tokbox. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSUInteger, ScreenShareSignal) {
    ScreenShareSignalSessionDidConnect = 0,
    ScreenShareSignalSessionDidDisconnect,
    ScreenShareSignalSessionDidFail,
    ScreenShareSignalSessionStreamCreated,
    ScreenShareSignalSessionStreamDestroyed,
    ScreenShareSignalPublisherDidFail,
    ScreenShareSignalSubscriberConnect,
    ScreenShareSignalSubscriberDidFail,
    ScreenShareSignalSubscriberVideoDisabled,
    ScreenShareSignalSubscriberVideoEnabled,
    ScreenShareSignalSubscriberVideoDisableWarning,
    ScreenShareSignalSubscriberVideoDisableWarningLifted,
};

typedef void (^ScreenShareBlock)(ScreenShareSignal signal, NSError *error);

@protocol ScreenShareDelegate <NSObject>
- (void)screenShareWithSignal:(ScreenShareSignal)signal
                        error:(NSError *)error;
@end

@interface ScreenSharer : NSObject

@property (readonly, nonatomic) BOOL isScreenSharing;

+ (instancetype)screenSharer;
+ (void) setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;

- (void)connectWithView:(UIView *)view;
- (void)connectWithView:(UIView *)view
                handler:(ScreenShareBlock)handler;
- (void)disconnect;

@property (weak, nonatomic) id<ScreenShareDelegate> delegate;

// SUBSCRIBER
@property (readonly, nonatomic) UIView *subscriberView;
@property (nonatomic) BOOL subscribeToAudio;
@property (nonatomic) BOOL subscribeToVideo;

// PUBLISHER
@property (readonly, nonatomic) UIView *publisherView;
@property (nonatomic) BOOL publishAudio;
@property (nonatomic) BOOL publishVideo;

@end
