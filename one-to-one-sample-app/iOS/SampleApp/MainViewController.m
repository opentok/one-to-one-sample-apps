//
//  MainViewController.m
//  OneToOneSample
//
//  Created by Xi Huang on 3/20/16.
//  Copyright © 2016 TokBox. All rights reserved.
//

#import "MainView.h"
#import "MainViewController.h"
#import "OneToOneCommunicator.h"

#import <SVProgressHUD/SVProgressHUD.h>

@interface MainViewController ()
@property (nonatomic) MainView *mainView;
@property (nonatomic) OneToOneCommunicator *oneToOneCommunicator;
@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.mainView = (MainView *)self.view;
    self.oneToOneCommunicator = [OneToOneCommunicator oneToOneCommunicator];
    #if !(TARGET_OS_SIMULATOR)
    [self.mainView showReverseCameraButton];
    #endif
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    [SVProgressHUD show];
    if (!self.oneToOneCommunicator.isCallEnabled) {
        [self.oneToOneCommunicator connectWithHandler:^(OneToOneCommunicationSignal signal, NSError *error) {
            [SVProgressHUD dismiss];
            [self.mainView connectPhoneCallButton:self.oneToOneCommunicator.isCallEnabled];
            if (!error) {
                [self handleCommunicationSignal:signal];
            }
        }];
        [self.mainView setButtonActiveStatus:YES];
    }
    else {
        [SVProgressHUD dismiss];
        [self.oneToOneCommunicator disconnect];
        [self.mainView connectPhoneCallButton:self.oneToOneCommunicator.isCallEnabled];
        [self.mainView removePublisherView];
        [self.mainView removePlaceHolderImage];
        [self.mainView setButtonActiveStatus:NO];
    }
}

- (void)handleCommunicationSignal:(OneToOneCommunicationSignal)signal {
    switch (signal) {
        case OneToOneCommunicationSignalSessionDidConnect: {
            [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
            break;
        }
        case OneToOneCommunicationSignalSessionDidDisconnect:{
            [self.mainView removePublisherView];
            [self.mainView removeSubscriberView];
            break;
        }
        case OneToOneCommunicationSignalSessionDidFail:{
            [SVProgressHUD dismiss];
            break;
        }
        case OneToOneCommunicationSignalSessionStreamCreated:{
            break;
        }
        case OneToOneCommunicationSignalSessionStreamDestroyed:{
            [self.mainView removeSubscriberView];
            break;
        }
        case OneToOneCommunicationSignalPublisherDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when publishing"];
            break;
        }
        case OneToOneCommunicationSignalSubscriberConnect:{
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OneToOneCommunicationSignalSubscriberDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when subscribing"];
            break;
        }
        case OneToOneCommunicationSignalSubscriberVideoDisabled:{
            [self.mainView addPlaceHolderToSubscriberView];
            break;
        }
        case OneToOneCommunicationSignalSubscriberVideoEnabled:{
            [SVProgressHUD dismiss];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OneToOneCommunicationSignalSubscriberVideoDisableWarning:{
            self.oneToOneCommunicator.subscribeToVideo = NO;
            [self.mainView addPlaceHolderToSubscriberView];
            [SVProgressHUD showErrorWithStatus:@"Network connection is unstable."];
            break;
        }
        case OneToOneCommunicationSignalSubscriberVideoDisableWarningLifted:{
            [SVProgressHUD dismiss];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        default:
            break;
    }
}

- (IBAction)publisherAudioButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.publishAudio = !self.oneToOneCommunicator.publishAudio;
    [self.mainView publisherMicActive:self.oneToOneCommunicator.publishAudio];
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
    [self.mainView publiserVideoActive:self.oneToOneCommunicator.publishVideo];
}

- (IBAction)reverseCameraButtonPressed:(UIButton *)sender {
    if (self.oneToOneCommunicator.cameraPosition == AVCaptureDevicePositionBack) {
        self.oneToOneCommunicator.cameraPosition = AVCaptureDevicePositionFront;
    }
    else {
        self.oneToOneCommunicator.cameraPosition = AVCaptureDevicePositionBack;
    }
}

- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
    if (!self.oneToOneCommunicator.isSubscriberSubscribed) return;
    self.oneToOneCommunicator.subscribeToVideo = !self.oneToOneCommunicator.subscribeToVideo;
    [self.mainView subsciberVideoActive:self.oneToOneCommunicator.subscribeToVideo];
}

- (IBAction)subscriberAudioButtonPressed:(UIButton *)sender {
    if (!self.oneToOneCommunicator.isSubscriberSubscribed) return;
    self.oneToOneCommunicator.subscribeToAudio = !self.oneToOneCommunicator.subscribeToAudio;
    [self.mainView subscriberMicActive:self.oneToOneCommunicator.subscribeToAudio];
}
/**
 *  Shows subscriber controls for a 7 seconds and then hide them.
 */
- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
    [self.mainView showSubscriberControls:YES];
    [self.mainView performSelector:@selector(showSubscriberControls:)
             withObject:nil
             afterDelay:7.0];
}

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (BOOL)shouldAutorotateToInterfaceOrientation: (UIInterfaceOrientation)interfaceOrientation {
    return YES;
}

@end
