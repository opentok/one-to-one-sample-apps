//
//  MainView.h
//  OneToOneScreenShareSample
//
//  Created by Esteban Cordero on 5/23/16.
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import <ScreenShareKit/ScreenShareKit.h>

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

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
- (void)addSubscribeView:(UIView *)subscriberView;
- (void)removeSubscriberView;
- (void)addPlaceHolderToSubscriberView;

- (void)subscriberMicMuted;
- (void)subscriberMicUnmuted;
- (void)subscriberVideoConnected;
- (void)subscriberVideoDisconnected;
- (void)showSubscriberControls;
- (void)hideSubscriberControls;

- (void)addScreenShareView;
- (void)removeScreenShareView;

// other controls
- (void)removePlaceHolderImage;
- (void)buttonsStatusSetter: (BOOL)status;

- (void)toggleAnnotationToolBar;
- (void)removeAnnotationToolBar;
@end
