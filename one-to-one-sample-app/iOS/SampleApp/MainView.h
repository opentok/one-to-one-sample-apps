//
//  MainView.h
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainView : UIView

// publisher view
- (void)addPublisherView:(UIView *)publisherView;
- (void)removePublisherView;
- (void)addPlaceHolderToPublisherView;

- (void)connectCallHolder:(BOOL)connected;
- (void)mutePubliserhMic:(BOOL)muted;
- (void)connectPubliserVideo:(BOOL)connected;

// subscriber view
- (void)addSubscribeView:(UIView *)subscriberView;
- (void)removeSubscriberView;
- (void)addPlaceHolderToSubscriberView;

- (void)muteSubscriberMic:(BOOL)muted;
- (void)connectSubsciberVideo:(BOOL)connected;
- (void)showSubscriberControls:(BOOL)shown;

// other controls
- (void)removePlaceHolderImage;
- (void)updateControlButtonsForCall: (BOOL)status;
- (void)showReverseCameraButton;
@end
