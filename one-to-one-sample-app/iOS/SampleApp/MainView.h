//
//  MainView.h
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainView : UIView

// publisher view
- (void)addPublisherView:(UIView *)publisherView;
- (void)removePublisherView;
- (void)addPlaceHolderToPublisherView;

- (void)callHolderConnected;
- (void)callHolderDisconnected;
- (void)publisherMicMuted;
- (void)publisherMicUnmuted;
- (void)publisherVideoConnected;
- (void)publisherVideoDisconnected;

// subscriber view
- (void)addSubscribeView:(UIView *)subsciberView;
- (void)removeSubscriberView;
- (void)addPlaceHolderToSubscriberView;

- (void)subscriberMicMuted;
- (void)subscriberMicUnmuted;
- (void)subscriberVideoConnected;
- (void)subscriberVideoDisconnected;
- (void)showSubscriberControls;
- (void)hideSubscriberControls;

// other controls
- (void)removePlaceHolderImage;
@end
