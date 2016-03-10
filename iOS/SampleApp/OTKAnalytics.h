//
//  OTKAnalytics.h
//  SampleApp
//
//  Created by mserrano on 09/03/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#ifndef OTKAnalytics_h
#define OTKAnalytics_h

@interface OTKAnalytics : NSObject

//Public properties
@property (nonatomic, readonly) NSString *sessionId;
@property (nonatomic, readonly) NSString *connectionId;
@property (nonatomic, readonly) NSInteger partnerId;
@property (nonatomic, readonly) NSString *clientVersion;
@property (nonatomic, readonly) NSString *action;
@property (nonatomic, readonly) NSString *variation;

-(instancetype)initWithSessionId:(NSString*)sessionId
                    connectionId:(NSString*)connectionId
                       partnerId:(NSInteger) partnerId
                   clientVersion:(NSString*) clientVersion;

-(void)logEventAction:(NSString *)action variation:(NSString *)variation;

@end

#endif /* OTKAnalytics_h */
