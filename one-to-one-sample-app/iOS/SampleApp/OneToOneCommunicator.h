//
//  OneToOneCommunicator.h
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Opentok/OpenTok.h>

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

@property (nonatomic) BOOL isCallEnabled;
@property (readonly, nonatomic) OTSubscriber *subscriber;
@property (readonly, nonatomic) OTPublisher *publisher;

+ (instancetype)oneToOneCommunicator;
+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token
          selfSubscribed:(BOOL)isSelfSubscribed;

- (void)connectWithHandler:(OneToOneCommunicatorBlock)handler;
- (void)disconnect;

@end
