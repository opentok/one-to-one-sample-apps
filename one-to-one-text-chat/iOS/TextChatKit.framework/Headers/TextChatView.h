//
//  TextChatComponentChatView.h
//  TextChatComponent
//
//  Created by Xi Huang on 2/23/16.
//  Copyright © 2016 Tokbox. All rights reserved.
//

#import <TextChatKit/TextChatUICustomizator.h>

typedef NS_ENUM(NSUInteger, TextChatViewEventSignal) {
    TextChatViewEventSignalDidSendMessage = 0,
    TextChatViewEventSignalDidReceiveMessage,
    TextChatViewEventSignalDidConnect,
    TextChatViewEventSignalDidDisconnect
};

typedef void (^TextChatViewEventBlock)(TextChatViewEventSignal signal, NSError *error);

@class TextChatView;

/**
 *  The delegate of a TextChatView object must adopt the TextChatViewDelegate protocol. Optional methods of the protocol allow the delegate to notify the connectivity.
 */
@protocol TextChatViewDelegate <NSObject>


/**
 *  Tells the delegate the text chat view finishes sending message with or without error
 *  
 *  @param textChatView The text chat view object informing the delegate of this impending event.
 *  @param error An error object that text chat view is going to use when encountering an issue
 */
- (void)textChatViewDidSendMessage:(TextChatView *)textChatView
                             error:(NSError *)error;

/**
 *  Tells the delegate the text chat view finishes sending message with or without error
 *
 *  @param textChatView The text chat view object informing the delegate of this impending event.
 */
- (void)textChatViewDidReceiveMessage:(TextChatView *)textChatView;

@optional

/**
 *  Tells the delegate the text chat view has established a text chat connection with or without error
 *
 *  @param error The text chat view object informing the delegate of this impending event.
 */
- (void)didConnectWithError:(NSError *)error;

/**
 *  Tells the delegate the text chat view has stopped a text chat connection with or without error
 *
 *  @param error The text chat view object informing the delegate of this impending event.
 */
- (void)didDisConnectWithError:(NSError *)error;
@end

@interface TextChatView : UIView

/**
 *  Add the configuration detail to your app.
 *
 *  @param apiKey   Your OpenTok API key.
 *  @param sessionId    The session ID of this instance.
 *  @param token    The token generated for this connection.
 */
+ (void)setOpenTokApiKey:(NSString *)apiKey
               sessionId:(NSString *)sessionId
                   token:(NSString *)token;

/**
 *  The object that acts as the delegate of the text chat view.
 *
 *  The delegate must adopt the TextChatViewDelegate protocol. The delegate is not retained.
 */
@property (weak, nonatomic) id<TextChatViewDelegate> delegate;

/**
 *  A boolean value that indicates whether the text chat view is shown or hidden
 */
@property (readonly, nonatomic, getter=isShown) BOOL show;

/**
 *  The object that manages changeable users interfaces
 */
@property (readonly, nonatomic) TextChatUICustomizator *customizator;

/**
 *  Returns an initialized text chat view object
 */
+ (instancetype)textChatView;

/**
 *  Returns an initialized text chat view object whose bottom attached to a given
 */
+ (instancetype)textChatViewWithBottomView:(UIView *)bottomView;

/**
 *  Establishes a text chat connection
 */
- (void)connect;

/**
 *  Establishes a text chat connection with completion
 */
- (void)connectWithHandler:(TextChatViewEventBlock)handler;

/**
 *  Stops a text chat connection
 */
- (void)disconnect;

/**
 *  Shows the text chat view
 */
- (void)show;

/**
 *  Hides the text chat view
 */
- (void)dismiss;

/**
 *  Assign an alias name to the sender
 */
- (void)setAlias:(NSString *)alias;

/**
 *  Assign a maximum length of characters each message contains
 */
- (void)setMaximumTextMessageLength:(NSUInteger)length;

@end