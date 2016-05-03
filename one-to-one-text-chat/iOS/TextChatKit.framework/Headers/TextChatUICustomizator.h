//
//  TextChatUICustomizator.h
//  TextChatSample
//
//  Created by Esteban Cordero on 4/13/16.
//  Copyright © 2016 Tokbox. All rights reserved.
//

#import <UIKit/UIKit.h>

static NSString * const TextChatUIUpdatedNotificationName = @"TextChatUIUpdatedNotificationName";

@interface TextChatUICustomizator : NSObject

@property (nonatomic) UIColor *tableViewCellSendTextColor;

@property (nonatomic) UIColor *tableViewCellReceiveTextColor;

@property (nonatomic) UIColor *tableViewCellSendBackgroundColor;

@property (nonatomic) UIColor *tableViewCellReceiveBackgroundColor;

@property (nonatomic) UIColor *topBarBackgroundColor;

@property (nonatomic) UIColor *topBarTitleTextColor;

@end
