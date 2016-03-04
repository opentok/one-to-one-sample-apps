//
//  ViewController.h
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController

- (void) adjustViewsForOrientation;

- (void) setConnectingLabelAlpha:(NSInteger)alpha;

- (void)startCall:(UIButton *)sender;

- (void)publisherVideoPressed:(UIButton *)sender;

- (void)publisherCameraPressed:(UIButton *)sender;

- (void)publisherMicrophonePressed:(UIButton *)sender;

- (void)subscriberVideoPressed:(UIButton *)sender;

- (void)subscriberAudioPressed:(UIButton *)sender;
@end

