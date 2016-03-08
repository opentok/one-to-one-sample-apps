//
//  OTKAnalytics.h
//  SolutionsLogging
//
//  Copyright © 2016 tokbox. All rights reserved.
//

#ifndef OTKAnalytics_h
#define OTKAnalytics_h

@interface OTKAnalyticsData : NSObject

@property (nonatomic, copy) NSString *action;
@property (nonatomic, copy) NSString *variation;
@property (nonatomic, copy) NSString *clientVersion;

@property (nonatomic, copy) NSString *logVersion;
@property (nonatomic, copy) NSString *client;
@property (nonatomic, copy) NSString *guid;

@property (nonatomic, copy) NSString *sessionId;
@property (nonatomic, copy) NSString *connectionId;
@property (nonatomic, assign) NSInteger partnerId;

@property (nonatomic, copy) NSString *deviceModel;
@property (nonatomic, copy) NSString *systemName;
@property (nonatomic, copy) NSString *systemVersion;

@property (nonatomic, assign) NSInteger clientSystemTime;

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
