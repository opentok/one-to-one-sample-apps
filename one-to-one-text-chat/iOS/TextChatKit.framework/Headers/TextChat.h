//
//  TextChatMessage.h
//  TextChatSampleApp
//
//  Created by Xi Huang on 4/1/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface TextChat : NSObject
@property (nonatomic, copy) NSString *alias;
@property (nonatomic, copy) NSString *senderId;
@property (nonatomic, copy) NSString *text;
@property (nonatomic, copy) NSDate *dateTime;
@end
