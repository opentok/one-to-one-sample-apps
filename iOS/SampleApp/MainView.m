//
//  MainView.m
//
// Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import "UIView+Helper.h"

@interface MainView()
@property (weak, nonatomic) IBOutlet UIView *publisherView;
@property (weak, nonatomic) IBOutlet UIView *subscriberView;

// 3 action buttons at the bottom of the view
@property (weak, nonatomic) IBOutlet UIButton *publisherVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *callButton;
@property (weak, nonatomic) IBOutlet UIButton *publisherAudioButton;

@property (weak, nonatomic) IBOutlet UIButton *reverseCameraButton;

@property (weak, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@end

@implementation MainView

- (void)awakeFromNib {
    [super awakeFromNib];
    
    self.publisherView.hidden = YES;
    self.publisherView.alpha = 1;
    self.publisherView.layer.borderWidth = 1;
    self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
    self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
    self.publisherView.layer.cornerRadius = 3;
    
    [self drawBorderOn:self.publisherAudioButton withWhiteBorder:YES];
    [self drawBorderOn:self.callButton withWhiteBorder:NO];
    [self drawBorderOn:self.publisherVideoButton withWhiteBorder:YES];
    [self showSubscriberControls:NO];
}

- (void)drawBorderOn:(UIView *)view
     withWhiteBorder:(BOOL)withWhiteBorder {
    
    view.layer.cornerRadius = (view.bounds.size.width / 2);
    if (withWhiteBorder) {
        view.layer.borderWidth = 1;
        view.layer.borderColor = [UIColor whiteColor].CGColor;
    }
}

#pragma mark - publisher view
- (void)addPublisherView:(UIView *)publisherView {
    
    [self.publisherView setHidden:NO];
    [self.publisherView addSubview:publisherView];
    publisherView.translatesAutoresizingMaskIntoConstraints = NO;
    [publisherView addAttachedLayoutConstantsToSuperview];
}

- (void)removePublisherView {
    [self.publisherView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)connectCallHolder:(BOOL)connected {
    if (connected) {
        [self.callButton setImage:[UIImage imageNamed:@"hangUp"] forState:UIControlStateNormal];
        self.callButton.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor;
    }
    else {
        [self.callButton setImage:[UIImage imageNamed:@"startCall"] forState:UIControlStateNormal];
        self.callButton.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor;
    }
}
- (void)updatePublisherAudio:(BOOL)connected {
    if (connected) {
        [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    }
    else {
        [self.publisherAudioButton setImage:[UIImage imageNamed:@"mutedMic"] forState: UIControlStateNormal];
    }
}

- (void)updatePublisherVideo:(BOOL)connected {
    if (connected) {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    }
    else {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"noVideo"] forState: UIControlStateNormal];
    }
}

#pragma mark - subscriber view
- (void)addSubscribeView:(UIView *)subscriberView {
    [self.subscriberView addSubview:subscriberView];
    subscriberView.translatesAutoresizingMaskIntoConstraints = NO;
    [subscriberView addAttachedLayoutConstantsToSuperview];
}

- (void)removeSubscriberView {
    [self.subscriberView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)updateSubscriberAudioButton:(BOOL)connected {
    if (connected) {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"noAudio"] forState: UIControlStateNormal];
    }
}

- (void)updateSubscriberVideoButton:(BOOL)connected {
    if (connected) {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"noVideo"] forState: UIControlStateNormal];
    }
}

- (void)showSubscriberControls:(BOOL)shown {
    [self.subscriberAudioButton setHidden:!shown];
    [self.subscriberVideoButton setHidden:!shown];
}

#pragma mark - other controls
- (void)enableControlButtonsForCall:(BOOL)enabled {
    [self.subscriberAudioButton setEnabled:enabled];
    [self.subscriberVideoButton setEnabled:enabled];
    [self.publisherVideoButton setEnabled:enabled];
    [self.publisherAudioButton setEnabled:enabled];
}

- (void)showReverseCameraButton; {
    self.reverseCameraButton.hidden = NO;
}

- (void)resetAllControl {
    [self removePublisherView];
    [self connectCallHolder:NO];
    [self updatePublisherAudio:YES];
    [self updatePublisherVideo:YES];
    [self updateSubscriberAudioButton:YES];
    [self updateSubscriberVideoButton:YES];
    [self enableControlButtonsForCall:NO];
}

@end
