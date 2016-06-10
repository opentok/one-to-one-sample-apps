//
//  TextChatMessage.h
//  TextChatSampleApp
//
//  Created by Xi Huang on 4/1/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 *  A data model describing information used in individual text chat messages.
 */
@interface TextChat : NSObject
/**
 *  alias of the sender/receiver
 */
@property (nonatomic, copy) NSString *alias;
/**
 *  unique identifier for the sender of the message
 */
@property (nonatomic, copy) NSString *senderId;
/**
 *  Content of the text message
 */
@property (nonatomic, copy) NSString *text;
/**
 *  Date and time when the message was sent (UNIXTIMESTAMP format)
 */
@property (nonatomic, copy) NSDate *dateTime;
@end
