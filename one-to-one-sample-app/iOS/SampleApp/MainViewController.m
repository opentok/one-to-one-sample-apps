//
//  MainViewController.m
//
// Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import "MainViewController.h"
#import "OTOneToOneCommunicator.h"

#import <SVProgressHUD/SVProgressHUD.h>

@interface MainViewController ()
@property (nonatomic) MainView *mainView;
@property (nonatomic) OTOneToOneCommunicator *oneToOneCommunicator;
@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.mainView = (MainView *)self.view;
    self.oneToOneCommunicator = [OTOneToOneCommunicator communicator];
#if !(TARGET_OS_SIMULATOR)
    [self.mainView showReverseCameraButton];
#endif
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    
    [SVProgressHUD show];
    
    if (!self.oneToOneCommunicator.isCallEnabled) {
        [self.oneToOneCommunicator connectWithHandler:^(OTOneToOneCommunicationSignal signal, NSError *error) {
            if (!error) {
                [SVProgressHUD dismiss];
                [self.mainView connectCallHolder:self.oneToOneCommunicator.isCallEnabled];
                [self.mainView updateControlButtonsForCall:YES];
                [self handleCommunicationSignal:signal];
            }
            else {
                [SVProgressHUD showErrorWithStatus:error.localizedDescription];
            }
        }];
    }
    else {
        
        [SVProgressHUD dismiss];
        [self.oneToOneCommunicator disconnect];
        [self.mainView connectCallHolder:self.oneToOneCommunicator.isCallEnabled];
        [self.mainView removePublisherView];
        [self.mainView removePlaceHolderImage];
        [self.mainView updateControlButtonsForCall:NO];
    }
}

- (void)handleCommunicationSignal:(OTOneToOneCommunicationSignal)signal {
    
    
    switch (signal) {
        case OTSessionDidConnect: {
            [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
            break;
        }
        case OTSessionDidDisconnect:{
            [self.mainView removePublisherView];
            [self.mainView removeSubscriberView];
            break;
        }
        case OTSessionDidFail:{
            [SVProgressHUD dismiss];
            break;
        }
        case OTSessionStreamCreated:{
            break;
        }
        case OTSessionStreamDestroyed:{
            [self.mainView removeSubscriberView];
            break;
        }
        case OTPublisherDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when publishing"];
            break;
        }
        case OTPublisherStreamCreated: {
            break;
        }
        case OTPublisherStreamDestroyed:{
            break;
        }
        case OTSubscriberConnect:{
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OTSubscriberDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when subscribing"];
            break;
        }
        case OTSubscriberVideoDisabled:{
            [self.mainView addPlaceHolderToSubscriberView];
            break;
        }
        case OTSubscriberVideoEnabled:{
            [SVProgressHUD dismiss];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
        case OTSubscriberVideoDisableWarning:{
            [self.mainView addPlaceHolderToSubscriberView];
            self.oneToOneCommunicator.subscribeToVideo = NO;
            [SVProgressHUD showErrorWithStatus:@"Network connection is unstable."];
            break;
        }
        case OTSubscriberVideoDisableWarningLifted:{
            [SVProgressHUD dismiss];
            [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            break;
        }
    }
}

- (IBAction)publisherAudioButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.publishAudio = !self.oneToOneCommunicator.publishAudio;
    [self.mainView mutePubliserhMic:self.oneToOneCommunicator.publishAudio];
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
    [self.mainView connectPubliserVideo:self.oneToOneCommunicator.publishVideo];
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
    [self.mainView connectSubsciberVideo:self.oneToOneCommunicator.subscribeToVideo];
}

- (IBAction)subscriberAudioButtonPressed:(UIButton *)sender {
    self.oneToOneCommunicator.subscribeToAudio = !self.oneToOneCommunicator.subscribeToAudio;
    [self.mainView muteSubscriberMic:self.oneToOneCommunicator.subscribeToAudio];
}

/**
 * handles the event when the user does a touch to show and then hide the buttons for
 * subscriber actions within 7 seconds
*/
- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
    if (self.oneToOneCommunicator.subscriberView){
        [self.mainView showSubscriberControls:YES];
    }
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
