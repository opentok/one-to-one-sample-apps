//
//  MainView.m
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "MainView.h"

@interface MainView()
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

// 3 action buttons at the bottom of the view
@property (strong, nonatomic) IBOutlet UIButton *videoHolder;
@property (strong, nonatomic) IBOutlet UIButton *callHolder;
@property (strong, nonatomic) IBOutlet UIButton *micHolder;

@property (strong, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (strong, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;

@property (strong, nonatomic) UIImageView *placeHolderImageView;
@end

@implementation MainView

- (UIImageView *)placeHolderImageView {
    if (!_placeHolderImageView) {
        _placeHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"page1"]];
        _placeHolderImageView.backgroundColor = [UIColor clearColor];
        _placeHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _placeHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _placeHolderImageView;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    
    self.publisherView.alpha = 1;
    self.publisherView.layer.borderWidth = 1;
    self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
    self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
    self.publisherView.layer.cornerRadius = 3;
    
    [self makingBorder:self.micHolder need_white_border:YES];
    [self makingBorder:self.callHolder need_white_border:NO];
    [self makingBorder:self.videoHolder need_white_border:YES];
    [self hideSubscriberControls];
}

-(void)makingBorder:(UIView *)sendingView
  need_white_border:(BOOL)border {
    
    sendingView.layer.cornerRadius = (sendingView.bounds.size.width / 2);
    if (border) {
        sendingView.layer.borderWidth = 1;
        sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
    }
}


#pragma mark - publisher view
- (void)addPublisherView:(UIView *)publisherView {
    
    publisherView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:publisherView];
}

- (void)removePublisherView {
    for (UIView *view in self.publisherView.subviews) {
        if (view != self.placeHolderImageView) {
            [view removeFromSuperview];
        }
    }
}

- (void)addPlaceHolderToPublisherView {
    self.placeHolderImageView.frame = self.publisherView.bounds;
    [self.publisherView addSubview:self.placeHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.placeHolderImageView];
}

- (void)callHolderConnected {
    [self.callHolder setImage:[UIImage imageNamed:@"startCall"] forState:UIControlStateNormal];
    self.callHolder.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor;
}

- (void)callHolderDisconnected {
    [self.callHolder setImage:[UIImage imageNamed:@"hangUp"] forState:UIControlStateNormal];
    self.callHolder.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor;
}

- (void)publisherMicMuted {
    [self.micHolder setImage:[UIImage imageNamed:@"mutedMicLineCopy"] forState: UIControlStateNormal];
}

- (void)publisherMicUnmuted {
    [self.micHolder setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
}

- (void)publisherVideoConnected {
    [self.videoHolder setImage:[UIImage imageNamed:@"videoIcon"] forState:UIControlStateNormal];
}

- (void)publisherVideoDisconnected {
    [self.videoHolder setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
}

#pragma mark - subscriber view
- (void)addSubscribeView:(UIView *)subsciberView {
    
    subsciberView.frame = CGRectMake(0, 0, CGRectGetWidth(self.subscriberView.bounds), CGRectGetHeight(self.subscriberView.bounds));
    [self.subscriberView addSubview:subsciberView];
}

- (void)removeSubscriberView {
    for (UIView *view in self.subscriberView.subviews) {
        if (view != self.placeHolderImageView) {
            [view removeFromSuperview];
        }
    }
}

- (void)addPlaceHolderToSubscriberView {
    self.placeHolderImageView.frame = self.publisherView.bounds;
    [self.subscriberView addSubview:self.placeHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.placeHolderImageView];
}

- (void)subscriberMicMuted {
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"noSoundCopy"] forState: UIControlStateNormal];
}

- (void)subscriberMicUnmuted {
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
}

- (void)subscriberVideoConnected {
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
}

- (void)subscriberVideoDisconnected {
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
}

- (void)showSubscriberControls {
    [self.subscriberAudioButton setAlpha:1.0];
    [self.subscriberVideoButton setAlpha:1.0];
}

- (void)hideSubscriberControls {
    [self.subscriberAudioButton setAlpha:0.0];
    [self.subscriberVideoButton setAlpha:0.0];
}

#pragma mark - other controls
- (void)showConnectingLabel {
    
    [UIView animateWithDuration:0.25 animations:^(){
        
        [self.connectingLabel setAlpha:0.5];
        
        [UIView animateWithDuration:0.25 animations:^(){
            
            [self.connectingLabel setAlpha:1.0];
        }];
    }];
}

- (void)hideConnectingLabel {
    
    [UIView animateWithDuration:0.25 animations:^(){
        
        [self.connectingLabel setAlpha:0.5];
        
        [UIView animateWithDuration:0.25 animations:^(){
            
            [self.connectingLabel setAlpha:0.0];
        }];
    }];
}

- (void)showErrorMessageLabelWithMessage:(NSString *)message {
    
    [self.errorMessage setTitle:message forState:UIControlStateNormal];
    [self.errorMessage setAlpha:1.0];
    
    [UIView animateWithDuration:0.5
                          delay:4
                        options:UIViewAnimationOptionTransitionNone
                     animations:^{
                         [self.errorMessage setAlpha:0.5];
                     }
                     completion:^(BOOL finished){
                         [self.errorMessage setAlpha:0.0];
                     }];
}

- (void)hideErrorMessageLabel {
    [self.errorMessage setAlpha:0.0];
}

- (void)removePlaceHolderImage {
    [self.placeHolderImageView removeFromSuperview];
}

#pragma mark - 
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
