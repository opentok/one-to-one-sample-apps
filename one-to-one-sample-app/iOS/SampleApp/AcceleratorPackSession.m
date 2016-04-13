//
//  APSession.m
//  APSessionDemo
//
//  Created by Xi Huang on 4/7/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import "AcceleratorPackSession.h"

static NSString * InternalApiKey = @"";
static NSString * InternalSessionId = @"";
static NSString * InternalToken = @"";

@interface AcceleratorPackSession() <OTSessionDelegate>
@property (nonatomic) NSString *apiKey;
@property (nonatomic) NSString *token;

@property (nonatomic) NSMutableSet <id<OTSessionDelegate>> *delegates;
@property (nonatomic) NSMutableSet <id<OTPublisherDelegate>> *publisherDelegate;
@property (nonatomic) NSMutableSet <id<OTSubscriberDelegate>> *subscriberDelegate;
@end

@implementation AcceleratorPackSession

- (NSString *)apiKey {
    return InternalApiKey;
}

- (NSString *)sessionId {
    return InternalToken;
}

+ (instancetype)getAcceleratorPackSession {
    
    static AcceleratorPackSession *sharedInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
        sharedInstance = [[AcceleratorPackSession alloc] initWithApiKey:InternalApiKey
                                                              sessionId:InternalSessionId
                                                               delegate:nil];
        sharedInstance.delegate = sharedInstance;
        sharedInstance.delegates = [[NSMutableSet alloc] init];
        sharedInstance.publisherDelegate = [[NSMutableSet alloc] init];
        sharedInstance.subscriberDelegate = [[NSMutableSet alloc] init];
    });
    return sharedInstance;
}

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token {
    
    InternalApiKey = apiKey;
    InternalSessionId = sessionId;
    InternalToken = token;
    
    NSAssert(InternalApiKey.length != 0, @"OpenTok: API key can not be empty, please add it to OneToOneCommunicator");
    NSAssert(InternalSessionId.length != 0, @"OpenTok: Session Id can not be empty, please add it to OneToOneCommunicator");
    NSAssert(InternalToken.length != 0, @"OpenTok: Token can not be empty, please add it to OneToOneCommunicator");
}

+ (void)registerWithAccePack:(id)delegate {
    
    AcceleratorPackSession *session = [AcceleratorPackSession getAcceleratorPackSession];
    
    if ([delegate conformsToProtocol:@protocol(OTSessionDelegate)]) {
        [session.delegates addObject:delegate];
    }
    
    if ([delegate conformsToProtocol:@protocol(OTPublisherDelegate)]) {
        [session.publisherDelegate addObject:delegate];
    }
    
    if ([delegate conformsToProtocol:@protocol(OTSubscriberDelegate)]) {
        [session.subscriberDelegate addObject:delegate];
    }
}

+ (OTError *)connect {
    
    AcceleratorPackSession *sharedSession = [AcceleratorPackSession getAcceleratorPackSession];
    
    OTError *error;
    [sharedSession connectWithToken:InternalToken error:&error];
    return error;
}

+ (OTError *)disconnect {
    
    AcceleratorPackSession *sharedSession = [AcceleratorPackSession getAcceleratorPackSession];
    
    if (!sharedSession.connection) return nil;
    
    OTError *error;
    [sharedSession disconnect:&error];
    return error;
}

#pragma mark - OTSessionDelegate
-(void)sessionDidConnect:(OTSession*)session {
    
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(sessionDidConnect:)]) {
            [obj sessionDidConnect:session];
        }
    }];
}

- (void)sessionDidDisconnect:(OTSession *)session {
    
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(sessionDidDisconnect:)]) {
            [obj sessionDidDisconnect:session];
        }
    }];
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {

    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(session:didFailWithError:)]) {
            [obj session:session didFailWithError:error];
        }
    }];
}

- (void)session:(OTSession *)session streamCreated:(OTStream *)stream {
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(session:streamCreated:)]) {
            [obj session:session streamCreated:stream];
        }
    }];
}

- (void)session:(OTSession *)session streamDestroyed:(OTStream *)stream {
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {

        if ([obj respondsToSelector:@selector(session:streamDestroyed:)]) {
            [obj session:session streamDestroyed:stream];
        }
    }];
}

- (void)  session:(OTSession*) session
connectionCreated:(OTConnection*) connection {
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(session:connectionCreated:)]) {
            [obj session:session connectionCreated:connection];
        }
    }];
}

- (void)session:(OTSession*) session
connectionDestroyed:(OTConnection*) connection {
    
    [self.delegates enumerateObjectsUsingBlock:^(id<OTSessionDelegate> obj, BOOL *stop) {
    
        if ([obj respondsToSelector:@selector(session:connectionDestroyed:)]) {
            [obj session:session connectionDestroyed:connection];
        }
    }];
}

#pragma mark - OTPublisherDelegate
- (void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
    
    [self.publisherDelegate enumerateObjectsUsingBlock:^(id<OTPublisherDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(publisher:didFailWithError:)]) {
            [obj publisher:publisher didFailWithError:error];
        }
    }];
}

- (void)publisher:(OTPublisherKit*)publisher streamCreated:(OTStream*)stream {
    
    [self.publisherDelegate enumerateObjectsUsingBlock:^(id<OTPublisherDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(publisher:streamCreated:)]) {
            [obj publisher:publisher streamCreated:stream];
        }
    }];
}

- (void)publisher:(OTPublisherKit*)publisher streamDestroyed:(OTStream*)stream {
    
    [self.publisherDelegate enumerateObjectsUsingBlock:^(id<OTPublisherDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(publisher:streamDestroyed:)]) {
            [obj publisher:publisher streamDestroyed:stream];
        }
    }];
}

#pragma mark - OTSubscriberKitDelegate
-(void)subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
    
    
    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(subscriberDidConnectToStream:)]) {
            [obj subscriberDidConnectToStream:subscriber];
        }
    }];
}

- (void)subscriber:(OTSubscriberKit*)subscriber
  didFailWithError:(OTError*)error {
    
    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(subscriber:didFailWithError:)]) {
            [obj subscriber:subscriber didFailWithError:error];
        }
    }];
}

-(void)subscriberVideoDisabled:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    
    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {

        if ([obj respondsToSelector:@selector(subscriberVideoDisabled:reason:)]) {
            [obj subscriberVideoDisabled:subscriber reason:reason];
        }
    }];
}

- (void)subscriberVideoEnabled:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    
    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(subscriberVideoEnabled:reason:)]) {
            [obj subscriberVideoEnabled:subscriber reason:reason];
        }
    }];
}

-(void) subscriberVideoDisableWarning:(OTSubscriber *)subscriber {

    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(subscriberVideoDisableWarning:)]) {
            [obj subscriberVideoDisableWarning:subscriber];
        }
    }];
}


-(void) subscriberVideoDisableWarningLifted:(OTSubscriberKit *)subscriber {

    [self.subscriberDelegate enumerateObjectsUsingBlock:^(id<OTSubscriberDelegate> obj, BOOL *stop) {
        
        if ([obj respondsToSelector:@selector(subscriberVideoDisableWarningLifted:)]) {
            [obj subscriberVideoDisableWarningLifted:subscriber];
        }
    }];
}

@end
