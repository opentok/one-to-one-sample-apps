//
//  MainView.m
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import "MainView.h"

@interface MainView()
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIButton *reverseCamera;
// 3 action buttons at the bottom of the view
@property (strong, nonatomic) IBOutlet UIButton *publisherVideoButton;
@property (strong, nonatomic) IBOutlet UIButton *PhoneCallButton;
@property (strong, nonatomic) IBOutlet UIButton *publisherMicrophoneButton;

@property (strong, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (strong, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@property (strong, nonatomic) UIImageView *subscriberPlaceHolderImageView;
@property (strong, nonatomic) UIImageView *publisherPlaceHolderImageView;
@end

@implementation MainView

- (UIImageView *)publisherPlaceHolderImageView {
    if (!_publisherPlaceHolderImageView) {
        _publisherPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"avatar"]];
        _publisherPlaceHolderImageView.backgroundColor = [UIColor clearColor];
        _publisherPlaceHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _publisherPlaceHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _publisherPlaceHolderImageView;
}

- (UIImageView *)subscriberPlaceHolderImageView {
    if (!_subscriberPlaceHolderImageView) {
        _subscriberPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"avatar"]];
        _subscriberPlaceHolderImageView.backgroundColor = [UIColor clearColor];
        _subscriberPlaceHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _subscriberPlaceHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _subscriberPlaceHolderImageView;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    
    self.publisherView.hidden = YES;
    self.publisherView.alpha = 1;
    self.publisherView.layer.borderWidth = 1;
    self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
    self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
    self.publisherView.layer.cornerRadius = 3;
    
    [self drawBorderOn:self.publisherMicrophoneButton withWhiteBorder:YES];
    [self drawBorderOn:self.PhoneCallButton withWhiteBorder:NO];
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
    publisherView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:publisherView];
    publisherView.translatesAutoresizingMaskIntoConstraints = NO;
    [self addAttachedLayoutConstantsToSuperview:publisherView];
}

- (void)removePublisherView {
    [self.publisherView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToPublisherView {
    self.publisherPlaceHolderImageView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:self.publisherPlaceHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.publisherPlaceHolderImageView];
}



- (void)connectPhoneCallButton:(BOOL)connected {
    if (connected) {
        [self.PhoneCallButton setImage:[UIImage imageNamed:@"hangUp"] forState:UIControlStateNormal];
        self.PhoneCallButton.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor;
    }
    else {
        [self.PhoneCallButton setImage:[UIImage imageNamed:@"startCall"] forState:UIControlStateNormal];
        self.PhoneCallButton.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor;
    }
}
- (void)publisherMicActive:(BOOL)active {
    if (active) {
        [self.publisherMicrophoneButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    }
    else {
        [self.publisherMicrophoneButton setImage:[UIImage imageNamed:@"mutedMic"] forState: UIControlStateNormal];
    }
}

- (void)publiserVideoActive:(BOOL)active {
    if (active) {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"videoIcon"] forState:UIControlStateNormal];
    }
    else {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
    }
}

#pragma mark - subscriber view
- (void)addSubscribeView:(UIView *)subsciberView {
    subsciberView.frame = CGRectMake(0, 0, CGRectGetWidth(self.subscriberView.bounds), CGRectGetHeight(self.subscriberView.bounds));
    [self.subscriberView addSubview:subsciberView];
    subsciberView.translatesAutoresizingMaskIntoConstraints = NO;
    [self addAttachedLayoutConstantsToSuperview:subsciberView];
}

- (void)removeSubscriberView {
    [self.subscriberView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToSubscriberView {
    self.subscriberPlaceHolderImageView.frame = self.subscriberView.bounds;
    [self.subscriberView addSubview:self.subscriberPlaceHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.subscriberPlaceHolderImageView];
}

- (void)subscriberMicActive:(BOOL)active {
    if (active) {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audioIcon"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"noAudioIcon"] forState: UIControlStateNormal];
    }
}

- (void)subsciberVideoActive:(BOOL)active {
    if (active) {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
    }
}

- (void)showSubscriberControls:(BOOL)shown {
    if (shown) {
        [self.subscriberAudioButton setHidden:NO];
        [self.subscriberVideoButton setHidden:NO];
    }
    else {
        [self.subscriberAudioButton setHidden:YES];
        [self.subscriberVideoButton setHidden:YES];
    }
}

#pragma mark - other controls
- (void)removePlaceHolderImage {
    [self.publisherPlaceHolderImageView removeFromSuperview];
    [self.subscriberPlaceHolderImageView removeFromSuperview];
}

- (void)setButtonActiveStatus:(BOOL)status; {
    [self.subscriberAudioButton setEnabled: status];
    [self.subscriberVideoButton setEnabled: status];
    [self.publisherVideoButton setEnabled: status];
    [self.publisherMicrophoneButton setEnabled: status];
}

- (void)showReverseCameraButton; {
    self.reverseCamera.hidden = NO;
}

#pragma mark - private method
-(void)addAttachedLayoutConstantsToSuperview:(UIView *)view {
    
    if (!view.superview) {
        return;
    }
    
    NSLayoutConstraint *top = [NSLayoutConstraint constraintWithItem:view
                                                           attribute:NSLayoutAttributeTop
                                                           relatedBy:NSLayoutRelationEqual
                                                              toItem:view.superview
                                                           attribute:NSLayoutAttributeTop
                                                          multiplier:1.0
                                                            constant:0.0];
    NSLayoutConstraint *leading = [NSLayoutConstraint constraintWithItem:view
                                                               attribute:NSLayoutAttributeLeading
                                                               relatedBy:NSLayoutRelationEqual
                                                                  toItem:view.superview
                                                               attribute:NSLayoutAttributeLeading
                                                              multiplier:1.0
                                                                constant:0.0];
    NSLayoutConstraint *trailing = [NSLayoutConstraint constraintWithItem:view
                                                                attribute:NSLayoutAttributeTrailing
                                                                relatedBy:NSLayoutRelationEqual
                                                                   toItem:view.superview
                                                                attribute:NSLayoutAttributeTrailing
                                                               multiplier:1.0
                                                                 constant:0.0];
    NSLayoutConstraint *bottom = [NSLayoutConstraint constraintWithItem:view
                                                              attribute:NSLayoutAttributeBottom
                                                              relatedBy:NSLayoutRelationEqual
                                                                 toItem:view.superview
                                                              attribute:NSLayoutAttributeBottom
                                                             multiplier:1.0
                                                               constant:0.0];
    [NSLayoutConstraint activateConstraints:@[top, leading, trailing, bottom]];
}


@end
