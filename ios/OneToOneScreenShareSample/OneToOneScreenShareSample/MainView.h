//
//  MainView.h
//
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainView : UIView

@property (nonatomic) IBOutlet UIView *shareView;
@property (nonatomic) IBOutlet UIButton *screenShareHolder;

// publisher view
- (void)addPublisherView:(UIView *)publisherView;
- (void)removePublisherView;
- (void)addPlaceHolderToPublisherView;

- (void)connectCallHolder:(BOOL)connected;
- (void)updatePublisherAudio:(BOOL)connected;
- (void)updatePublisherVideo:(BOOL)connected;

// subscriber view
- (void)addSubscribeView:(UIView *)subscriberView;
- (void)removeSubscriberView;
- (void)addPlaceHolderToSubscriberView;

- (void)updateSubscriberAudioButton:(BOOL)connected;
- (void)updateSubsciberVideoButton:(BOOL)connected;
- (void)showSubscriberControls:(BOOL)shown;

// screenshare view
- (void)addScreenShareViewWithContentView:(UIView *)view;
- (void)removeScreenShareView;
- (void)showScreenShareNotificationBar:(BOOL)shown;

// annotation bar
- (void)toggleAnnotationToolBar;
- (void)removeAnnotationToolBar;
- (void)cleanCanvas;

// other controls
- (void)removePlaceHolderImage;
- (void)updateControlButtonsForCall;
- (void)updateControlButtonsForScreenShare;
- (void)updateControlButtonsForEndingCall;
- (void)showReverseCameraButton;

@end
