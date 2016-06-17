//
//  MainView.m
//  OneToOneScreenShareSample
//
//  Created by Esteban Cordero on 5/23/16.
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"

@interface MainView()
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

// 4 action buttons at the bottom of the view
@property (strong, nonatomic) IBOutlet UIButton *videoHolder;
@property (strong, nonatomic) IBOutlet UIButton *callHolder;
@property (strong, nonatomic) IBOutlet UIButton *micHolder;
@property (strong, nonatomic) IBOutlet UIButton *screenShareHolder;
@property (strong, nonatomic) IBOutlet UIButton *annotationHolder;

@property (strong, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (strong, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@property (strong, nonatomic) IBOutlet UIButton *publisherCameraButton;

@property (strong, nonatomic) UIImageView *subscriberPlaceHolderImageView;
@property (strong, nonatomic) UIImageView *publisherPlaceHolderImageView;

@property (nonatomic) ScreenShareToolbarView *toolbarView;
@property (strong, nonatomic) IBOutlet UIView *actionButtonView;
@end

@implementation MainView

- (ScreenShareToolbarView *)toolbarView {
    if (!_toolbarView) {
        _toolbarView = [ScreenShareToolbarView toolbar];
        _toolbarView.backgroundColor = [UIColor blackColor];
        
        CGFloat height = _toolbarView.bounds.size.height;
        _toolbarView.frame = CGRectMake(0, CGRectGetHeight([UIScreen mainScreen].bounds) - CGRectGetHeight(_actionButtonView.bounds) - height - 20, _toolbarView.bounds.size.width, height);
    }
    return _toolbarView;
}


- (UIImageView *)publisherPlaceHolderImageView {
    if (!_publisherPlaceHolderImageView) {
        _publisherPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"page1"]];
        _publisherPlaceHolderImageView.backgroundColor = [UIColor clearColor];
        _publisherPlaceHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _publisherPlaceHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _publisherPlaceHolderImageView;
}

- (UIImageView *)subscriberPlaceHolderImageView {
    if (!_subscriberPlaceHolderImageView) {
        _subscriberPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"page1"]];
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
    
    [self drawBorderOn:self.micHolder withWhiteBorder:YES];
    [self drawBorderOn:self.callHolder withWhiteBorder:NO];
    [self drawBorderOn:self.videoHolder withWhiteBorder:YES];
    [self drawBorderOn:self.screenShareHolder withWhiteBorder:YES];
    [self drawBorderOn:self.annotationHolder withWhiteBorder:YES];
    [self hideSubscriberControls];
}

- (void)drawBorderOn:(UIView *)view
     withWhiteBorder:(BOOL)withWhiteBorder {
    
    view.layer.cornerRadius = (view.bounds.size.width / 2);
    if (withWhiteBorder) {
        view.layer.borderWidth = 1;
        view.layer.borderColor = [UIColor whiteColor].CGColor;
    }
}

//- (void)usingBorder:(BOOL)shoudlAdd; {
//    CGRect viewSize = CGRectMake(0, 0, self.frame.size.width, 40);
//    [self.sharingYourScreen setFrame:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height)];
//    UIColor *backgroundShare = [UIColor colorWithRed:102/255.0 green:173/255.0 blue:191/255.0 alpha:1];
//    if (shoudlAdd){
//        UIView *topScreen = [[UIView alloc] initWithFrame: viewSize];
//        topScreen.backgroundColor = backgroundShare;
//    
//        UILabel *sharingScreenLabel = [[UILabel alloc] init];
//        sharingScreenLabel.text = @"You are sharing your screen";
//        sharingScreenLabel.font = [UIFont fontWithName:@"AvantGarde-Book" size:12.0];
//        sharingScreenLabel.frame = viewSize;
//        sharingScreenLabel.textAlignment = NSTextAlignmentCenter;
//        sharingScreenLabel.textColor = [UIColor whiteColor];
//        UIImageView *icon = [[UIImageView alloc] initWithFrame:CGRectMake(15, 8, 20, 18)];
//        icon.image = [UIImage imageNamed:@"screenshare"];
//        UIImageView *close = [[UIImageView alloc] initWithFrame:CGRectMake((self.sharingYourScreen.frame.size.width - 30), 14, 13, 13)];
//        close.image = [UIImage imageNamed:@"smallClose"];
//        [topScreen addSubview:icon];
//        
//        [topScreen addSubview:close];
//        [topScreen addSubview:sharingScreenLabel];
//        topScreen.translatesAutoresizingMaskIntoConstraints = NO;
//        [self.sharingYourScreen addSubview:topScreen];
//        
//        self.sharingYourScreen.layer.borderWidth = 5;
//        self.sharingYourScreen.layer.borderColor = backgroundShare.CGColor;
//        // UIButton
//        self.screenShareHolder.layer.borderWidth = 2;
//        self.screenShareHolder.layer.borderColor = backgroundShare.CGColor;
//        [self addSubview:self.sharingYourScreen];
//        [self bringSubviewToFront:self.actionButtonView];
//        [self bringSubviewToFront:self.subscriberAudioButton];
//        [self bringSubviewToFront:self.subscriberVideoButton];
//        [self bringSubviewToFront:self.publisherCameraButton];
//        self.sharingYourScreen.translatesAutoresizingMaskIntoConstraints = NO;
//        [self addAttachedLayoutConstantsToSuperview: self.sharingYourScreen];
//    } else {
//        self.screenShareHolder.layer.borderColor = [UIColor whiteColor].CGColor;
//        [self.sharingYourScreen removeFromSuperview];
//    }
//}

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

- (void)addScreenShareView {
    [self addSubview:self.toolbarView.screenShareView];
    [self.publisherView setHidden:YES];
}

- (void)removeScreenShareView {
    [self.toolbarView.screenShareView removeFromSuperview];
    [self.publisherView setHidden:NO];
}

#pragma mark - other controls
- (void)removePlaceHolderImage {
    [self.publisherPlaceHolderImageView removeFromSuperview];
    [self.subscriberPlaceHolderImageView removeFromSuperview];
}

- (void) buttonsStatusSetter: (BOOL)status; {
    [self.subscriberAudioButton setEnabled: status];
    [self.subscriberVideoButton setEnabled: status];
    [self.videoHolder setEnabled: status];
    [self.micHolder setEnabled: status];
    [self.screenShareHolder setEnabled: status];
    [self.annotationHolder setEnabled:status];
}

- (void)toggleAnnotationToolBar {
    
    
    if (!self.toolbarView || !self.toolbarView.superview) {
        
        
        [self addSubview:self.toolbarView];
    }
    else {
        [self removeAnnotationToolBar];
    }
}

- (void)removeAnnotationToolBar {
    [self.toolbarView removeFromSuperview];
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
