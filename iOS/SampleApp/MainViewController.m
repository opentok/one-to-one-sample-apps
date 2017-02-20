//
//  MainViewController.m
//
// Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import "MainViewController.h"
#import "OTOneToOneCommunicator.h"
#import "AppDelegate.h"

#import <SVProgressHUD/SVProgressHUD.h>

#define MAKE_WEAK(self) __weak typeof(self) weak##self = self
#define MAKE_STRONG(self) __strong typeof(weak##self) strong##self = weak##self

@interface MainViewController () <OTOneToOneCommunicatorDataSource>
@property (nonatomic) MainView *mainView;
@property (nonatomic) OTOneToOneCommunicator *oneToOneCommunicator;
@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.mainView = (MainView *)self.view;
    
    self.oneToOneCommunicator = [[OTOneToOneCommunicator alloc] init];
    self.oneToOneCommunicator.dataSource = self;
    
#if !(TARGET_OS_SIMULATOR)
    [self.mainView showReverseCameraButton];
#endif
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    
    if (!self.oneToOneCommunicator.isCallEnabled) {
        [SVProgressHUD show];

        MAKE_WEAK(self);
        [self.oneToOneCommunicator connectWithHandler:^(OTCommunicationSignal signal, NSError *error) {
            MAKE_STRONG(self);
            strongself.oneToOneCommunicator.publisherView.showAudioVideoControl = NO;
            if (!error) {
                [strongself handleCommunicationSignal:signal];
            }
            else {
                [SVProgressHUD showErrorWithStatus:error.localizedDescription];
            }
        }];
    }
    else {
        [SVProgressHUD popActivity];
        [self.oneToOneCommunicator disconnect];
        [self.mainView resetAllControl];
    }
}

- (void)handleCommunicationSignal:(OTCommunicationSignal)signal {
    
    switch (signal) {
        case OTPublisherCreated: {
            [SVProgressHUD popActivity];
            [self.mainView connectCallHolder:self.oneToOneCommunicator.isCallEnabled];
            [self.mainView enableControlButtonsForCall:YES];
            [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
            break;
        }
        case OTPublisherDestroyed: {
            [self.mainView removePublisherView];
            NSLog(@"Your publishing feed stops streaming in OpenTok");
            break;
        }
        case OTSubscriberCreated: {
            [SVProgressHUD show];
        }
        case OTSubscriberReady: {
            [SVProgressHUD popActivity];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OTSubscriberDestroyed:{
            [self.mainView removeSubscriberView];
            break;
        }
        case OTSessionDidBeginReconnecting: {
            [SVProgressHUD showInfoWithStatus:@"Reconnecting"];
            break;
        }
        case OTSessionDidReconnect: {
            [SVProgressHUD popActivity];
            break;
        }
        case OTSubscriberVideoDisabledByBadQuality:
        case OTSubscriberVideoDisabledBySubscriber: {
            NSLog(@"The remote has disabled the video");
            break;
        }
        case OTSubscriberVideoDisabledByPublisher:{
            self.oneToOneCommunicator.subscribeToVideo = NO;
            break;
        }
        case OTSubscriberVideoEnabledByGoodQuality:
        case OTSubscriberVideoEnabledBySubscriber:{
            NSLog(@"The remote has enabled the video");
            break;
        }
        case OTSubscriberVideoEnabledByPublisher:{
            self.oneToOneCommunicator.subscribeToVideo = YES;
            break;
        }
        case OTSubscriberVideoDisableWarning:{
            self.oneToOneCommunicator.subscribeToVideo = NO;
            [SVProgressHUD showErrorWithStatus:@"Network connection is unstable."];
            break;
        }
        case OTSubscriberVideoDisableWarningLifted:{
            self.oneToOneCommunicator.subscribeToVideo = YES;
            break;
        }
        default: break;
    }
}

- (IBAction)publisherAudioButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.publishAudio = !self.oneToOneCommunicator.publishAudio;
    [self.mainView updatePublisherAudio:self.oneToOneCommunicator.publishAudio];
}

- (IBAction)publisherVideoButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.publishVideo = !self.oneToOneCommunicator.publishVideo;
    [self.mainView updatePublisherVideo:self.oneToOneCommunicator.publishVideo];
}

- (IBAction)publisherCameraButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.cameraPosition = self.oneToOneCommunicator.cameraPosition == AVCaptureDevicePositionBack ? AVCaptureDevicePositionFront : AVCaptureDevicePositionBack
}

- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.subscribeToVideo = !self.oneToOneCommunicator.subscribeToVideo;
    [self.mainView updateSubscriberVideoButton:self.oneToOneCommunicator.subscribeToVideo];
}

- (IBAction)subscriberAudioButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.subscribeToAudio = !self.oneToOneCommunicator.subscribeToAudio;
    [self.mainView updateSubscriberAudioButton:self.oneToOneCommunicator.subscribeToAudio];
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
    if (self.oneToOneCommunicator.subscriberView){
        [self.mainView showSubscriberControls:YES];
    }
    [self.mainView performSelector:@selector(showSubscriberControls:)
                        withObject:@(NO)
                        afterDelay:7.0];
}

- (OTAcceleratorSession *)sessionOfOTOneToOneCommunicator:(OTOneToOneCommunicator *)oneToOneCommunicator {
    AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
    return appDelegate.acceleratorSession;
}

@end
