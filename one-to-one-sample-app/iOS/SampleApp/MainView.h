//
//  MainView.h
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainView : UIView

- (void)connectPhoneCallButton:(BOOL)connected;

// publisher view
- (void)addPublisherView:(UIView *)publisherView;
- (void)removePublisherView;
- (void)addPlaceHolderToPublisherView;

- (void)publisherMicActive:(BOOL)active;
- (void)publiserVideoActive:(BOOL)active;

// subscriber view
- (void)addSubscribeView:(UIView *)subscriberView;
- (void)removeSubscriberView;
- (void)addPlaceHolderToSubscriberView;

- (void)subscriberMicActive:(BOOL)active;
- (void)subsciberVideoActive:(BOOL)active;

- (void)showSubscriberControls:(BOOL)shown;

// other controls
- (void)removePlaceHolderImage;
- (void)setButtonActiveStatus:(BOOL)status;
- (void)showReverseCameraButton;
@end
