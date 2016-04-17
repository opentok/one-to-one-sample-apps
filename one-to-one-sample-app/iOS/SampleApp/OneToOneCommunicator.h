#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

typedef NS_ENUM(NSUInteger, OneToOneCommunicationSignal) {
    OneToOneCommunicationSignalSessionDidConnect = 0,
    OneToOneCommunicationSignalSessionDidDisconnect,
    OneToOneCommunicationSignalSessionDidFail,
    OneToOneCommunicationSignalSessionStreamCreated,
    OneToOneCommunicationSignalSessionStreamDestroyed,
    OneToOneCommunicationSignalPublisherDidFail,
    OneToOneCommunicationSignalSubscriberConnect,
    OneToOneCommunicationSignalSubscriberDidFail,
    OneToOneCommunicationSignalSubscriberVideoDisabled,
    OneToOneCommunicationSignalSubscriberVideoEnabled,
    OneToOneCommunicationSignalSubscriberVideoDisableWarning,
    OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted,
};

typedef void (^OneToOneCommunicatorBlock)(OneToOneCommunicationSignal signal, NSError *error);

@interface OneToOneCommunicator : NSObject

+ (instancetype)oneToOneCommunicator;
+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler;
- (void)disconnect;

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