//
//  OTKAnalytics.h
//  SampleApp
//
//  Created by mserrano on 09/03/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#ifndef OTKAnalytics_h
#define OTKAnalytics_h

@interface OTKAnalyticsData : NSObject

@property NSString *action;
@property NSString *variation;
@property NSString *clientVersion;

@property NSString *logVersion;
@property NSString *client;
@property NSString *guid;

@property NSString *sessionId;
@property NSString *connectionId;
@property NSInteger partnerId;

@property NSString *deviceModel;
@property NSString *systemName;
@property NSString *systemVersion;

@property NSInteger clientSystemTime;

-(instancetype)initWithSessionId:(NSString*)sessionId
                    connectionId:(NSString*)connectionId
                       partnerId:(NSInteger) partnerId
                   clientVersion:(NSString*) clientVersion;

@end

@interface OTKAnalytics : NSObject

-(instancetype)initWithData:(OTKAnalyticsData*)data;

-(void)logEventAction:(NSString *)action variation:(NSString *)variation;

@end


#endif /* OTKAnalytics_h */
