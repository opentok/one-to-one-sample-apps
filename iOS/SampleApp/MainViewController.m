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
    
    MAKE_WEAK(self);
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        MAKE_STRONG(self);
        strongself.oneToOneCommunicator = [[OTOneToOneCommunicator alloc] init];
        strongself.oneToOneCommunicator.dataSource = self;
    });
    
#if !(TARGET_OS_SIMULATOR)
    [self.mainView showReverseCameraButton];
#endif
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    
    if (!self.oneToOneCommunicator.isCallEnabled) {
        [SVProgressHUD show];

        [self.oneToOneCommunicator connectWithHandler:^(OTOneToOneCommunicationSignal signal, NSError *error) {
            if (!error) {
                [self handleCommunicationSignal:signal];
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

- (void)handleCommunicationSignal:(OTOneToOneCommunicationSignal)signal {
    
    /*
     OTPublisherCreated,
     OTPublisherDestroyed,
     OTSubscriberCreated,
    -> OTSubscriberReady,
     OTSubscriberDestroyed,
     OTSubscriberVideoDisabledByPublisher,
     OTSubscriberVideoDisabledBySubscriber,
     OTSubscriberVideoDisabledByBadQuality,
     OTSubscriberVideoEnabledByPublisher,
     OTSubscriberVideoEnabledBySubscriber,
     OTSubscriberVideoEnabledByGoodQuality,
     OTSubscriberVideoDisableWarning,
     OTSubscriberVideoDisableWarningLifted,
     OTOneToOneCommunicationError,
     OTSessionDidBeginReconnecting,
     OTSessionDidReconnect
*/
    switch (signal) {
        case OTSubscriberReady: {
            [SVProgressHUD popActivity];
            [self.mainView connectCallHolder:self.oneToOneCommunicator.isCallEnabled];
            [self.mainView enableControlButtonsForCall:YES];
            [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
            break;
        }
//        case OTSessionDidFail:{
//            [SVProgressHUD showErrorWithStatus:@"Problem when connecting."];
//            break;
//        }
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
        case OTPublisherCreated: {
            NSLog(@"Your publishing feed is streaming in OpenTok");
            break;
        }
        case OTPublisherDestroyed: {
            NSLog(@"Your publishing feed stops streaming in OpenTok");
            break;
        }
        case OTOneToOneCommunicationError:{
            [SVProgressHUD showErrorWithStatus:@"Problem when publishing/subscribing."];
            break;
        }
        case OTSubscriberCreated:{
            if (self.oneToOneCommunicator.subscribeToVideo) {
                [self.mainView removeSubscriberView];
                [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            }
            else {
                [self.mainView addPlaceHolderToSubscriberView];
            }
            break;
        }
        case OTSubscriberVideoDisabledByBadQuality:
        case OTSubscriberVideoDisabledBySubscriber:
        case OTSubscriberVideoDisabledByPublisher:{
            [self.mainView removeSubscriberView];
            [self.mainView addPlaceHolderToSubscriberView];
            break;
        }
        case OTSubscriberVideoEnabledByGoodQuality:
        case OTSubscriberVideoEnabledBySubscriber:
        case OTSubscriberVideoEnabledByPublisher:{
            [self.mainView removeSubscriberView];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OTSubscriberVideoDisableWarning:{
            self.oneToOneCommunicator.subscribeToVideo = NO;
            [self.mainView addPlaceHolderToSubscriberView];
            [SVProgressHUD showErrorWithStatus:@"Network connection is unstable."];
            break;
        }
        case OTSubscriberVideoDisableWarningLifted:{
            self.oneToOneCommunicator.subscribeToVideo = YES;
            [self.mainView removePlaceHolderImage];
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
    if (self.oneToOneCommunicator.publishVideo) {
        [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
    }
    else {
        [self.mainView removePublisherView];
        [self.mainView addPlaceHolderToPublisherView];
    }
    [self.mainView updatePublisherVideo:self.oneToOneCommunicator.publishVideo];
}

- (IBAction)publisherCameraButtonPressed:(UIButton *)sender {
    if (self.oneToOneCommunicator.cameraPosition == AVCaptureDevicePositionBack) {
        self.oneToOneCommunicator.cameraPosition = AVCaptureDevicePositionFront;
    }
    else {
        self.oneToOneCommunicator.cameraPosition = AVCaptureDevicePositionBack;
    }
}

- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.subscribeToVideo = !self.oneToOneCommunicator.subscribeToVideo;
    [self.mainView updateSubsciberVideoButton:self.oneToOneCommunicator.subscribeToVideo];
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
