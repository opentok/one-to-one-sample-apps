//
//  MainView.m
//
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import <OTScreenShareKit/OTScreenShareKit.h>
#import <OTAnnotationKit/OTAnnotationKit.h>

#import "UIView+Helper.h"

@interface MainView()
@property (weak, nonatomic) IBOutlet UIView *publisherView;
@property (weak, nonatomic) IBOutlet UIView *subscriberView;

// 4 action buttons at the bottom of the view
@property (weak, nonatomic) IBOutlet UIButton *publisherVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *callButton;
@property (weak, nonatomic) IBOutlet UIButton *publisherAudioButton;
@property (weak, nonatomic) IBOutlet UIButton *annotationButton;

@property (weak, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@property (weak, nonatomic) IBOutlet UIButton *publisherCameraButton;

@property (nonatomic) UIImageView *subscriberPlaceHolderImageView;
@property (nonatomic) UIImageView *publisherPlaceHolderImageView;

@property (nonatomic) OTAnnotationScrollView *annotationScrollView;
@property (weak, nonatomic) IBOutlet UIView *actionButtonView;
@property (weak, nonatomic) IBOutlet UIView *screenshareNotificationBar;

@end

@implementation MainView

- (OTAnnotationScrollView *)annotationScrollView {
    if (!_annotationScrollView) {
        _annotationScrollView = [[OTAnnotationScrollView alloc] init];
        _annotationScrollView.backgroundColor = [UIColor darkGrayColor];
        [_annotationScrollView initializeToolbarView];
    }
    return _annotationScrollView;
}


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
    self.shareView.hidden = YES;
    self.publisherView.hidden = YES;
    self.publisherView.alpha = 1;
    self.publisherView.layer.borderWidth = 1;
    self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
    self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
    self.publisherView.layer.cornerRadius = 3;
    [self showSubscriberControls:NO];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    
    [self drawBorderOn:self.publisherAudioButton withWhiteBorder:YES];
    [self drawBorderOn:self.callButton withWhiteBorder:NO];
    [self drawBorderOn:self.publisherVideoButton withWhiteBorder:YES];
    [self drawBorderOn:self.screenShareHolder withWhiteBorder:YES];
    [self drawBorderOn:self.annotationButton withWhiteBorder:YES];
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
    [publisherView addAttachedLayoutConstantsToSuperview];
}

- (void)removePublisherView {
    [self.publisherView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToPublisherView {
    self.publisherPlaceHolderImageView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:self.publisherPlaceHolderImageView];
    [self.publisherPlaceHolderImageView addAttachedLayoutConstantsToSuperview];
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
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
    }
    else {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"noVideo"] forState:UIControlStateNormal];
    }
}

#pragma mark - subscriber view
- (void)addSubscribeView:(UIView *)subsciberView {
    
    subsciberView.frame = CGRectMake(0, 0, CGRectGetWidth(self.subscriberView.bounds), CGRectGetHeight(self.subscriberView.bounds));
    [self.subscriberView addSubview:subsciberView];
    subsciberView.translatesAutoresizingMaskIntoConstraints = NO;
    [subsciberView addAttachedLayoutConstantsToSuperview];
}

- (void)removeSubscriberView {
    [self.subscriberView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToSubscriberView {
    self.subscriberPlaceHolderImageView.frame = self.subscriberView.bounds;
    [self.subscriberView addSubview:self.subscriberPlaceHolderImageView];
    [self.subscriberPlaceHolderImageView addAttachedLayoutConstantsToSuperview];
}

- (void)updateSubscriberAudioButton:(BOOL)connected {
    if (connected) {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"noAudio"] forState: UIControlStateNormal];
    }
}

- (void)updateSubsciberVideoButton:(BOOL)connected {
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

- (void)addScreenShareViewWithContentView:(UIView *)view {
    view.frame = self.shareView.bounds;
    self.annotationScrollView.frame = self.shareView.bounds;
    self.annotationScrollView.scrollView.contentSize = self.shareView.bounds.size;
    [self.annotationScrollView addContentView:view];
    [self.shareView addSubview:self.annotationScrollView];
    
    [self.shareView setHidden:NO];
    [self.publisherView setHidden:YES];
    [self bringSubviewToFront:self.actionButtonView];
}

- (void)removeScreenShareView {
    [self.shareView setHidden:YES];
    [self.publisherView setHidden:NO];
    [self.annotationScrollView removeFromSuperview];
}

#pragma mark - annotation bar
- (void)toggleAnnotationToolBar {
    
    if (!self.annotationScrollView.toolbarView || !self.annotationScrollView.toolbarView.superview) {
        
        CGFloat toolbarViewHeight = self.annotationScrollView.toolbarView.bounds.size.height;
        self.annotationScrollView.toolbarView.frame = CGRectMake(0,
                                                           CGRectGetHeight(self.annotationScrollView.bounds) - toolbarViewHeight + 20,
                                                           self.annotationScrollView.toolbarView.bounds.size.width,
                                                           toolbarViewHeight);
        [self addSubview:self.annotationScrollView.toolbarView];
    }
    else {
        [self removeAnnotationToolBar];
    }
}

- (void)removeAnnotationToolBar {
    [self.annotationScrollView.toolbarView removeFromSuperview];
}

- (void)cleanCanvas {
    [self.annotationScrollView.annotationView removeAllAnnotatables];
}

#pragma mark - other controls
- (void)removePlaceHolderImage {
    [self.publisherPlaceHolderImageView removeFromSuperview];
    [self.subscriberPlaceHolderImageView removeFromSuperview];
}

- (void)updateControlButtonsForCall {
    [self.subscriberVideoButton setEnabled:YES];
    [self.subscriberAudioButton setEnabled:YES];
    [self.publisherCameraButton setEnabled:YES];
    [self.publisherVideoButton setEnabled:YES];
    [self.publisherAudioButton setEnabled:YES];
    [self.screenShareHolder setEnabled:YES];
    [self.annotationButton setEnabled:NO];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}

- (void)updateControlButtonsForScreenShare {
    [self.subscriberVideoButton setEnabled:NO];
    [self.subscriberAudioButton setEnabled:YES];
    [self.publisherCameraButton setEnabled:NO];
    [self.publisherVideoButton setEnabled:NO];
    [self.publisherAudioButton setEnabled:YES];
    [self.screenShareHolder setEnabled:YES];
    [self.annotationButton setEnabled:YES];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}


- (void)updateControlButtonsForEndingCall {
    [self.subscriberVideoButton setEnabled:NO];
    [self.subscriberAudioButton setEnabled:NO];
    [self.publisherCameraButton setEnabled:NO];
    [self.publisherVideoButton setEnabled:NO];
    [self.publisherAudioButton setEnabled:NO];
    [self.screenShareHolder setEnabled:NO];
    [self.annotationButton setEnabled:NO];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}

- (void)showScreenShareNotificationBar:(BOOL)shown {
    [self.screenshareNotificationBar setHidden:!shown];
}

- (void)showReverseCameraButton; {
    self.publisherCameraButton.hidden = NO;
}

@end
