//
//  MainView.h
//
// Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainView : UIView

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

// other controls
- (void)removePlaceHolderImage;
- (void)enableControlButtonsForCall:(BOOL)enabled;
- (void)showReverseCameraButton;

- (void)resetAllControl;
@end
