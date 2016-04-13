//
//  APSession.h
//  APSessionDemo
//
//  Created by Xi Huang on 4/7/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <OpenTok/OpenTok.h>

@interface AcceleratorPackSession : OTSession

@property (readonly, nonatomic) NSString *apiKey;
@property (readonly, nonatomic) NSString *token;

+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;

+ (instancetype)getAcceleratorPackSession;

+ (void)registerWithAccePack:(id<OTSessionDelegate>)delegate;

+ (OTError *)connect;

+ (OTError *)disconnect;

@end
