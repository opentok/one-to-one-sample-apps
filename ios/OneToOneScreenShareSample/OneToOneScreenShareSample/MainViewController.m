//
//  ViewController.m
//
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import "MainViewController.h"
#import "OTOneToOneCommunicator.h"

#import <SVProgressHUD/SVProgressHUD.h>

@interface MainViewController () <UIImagePickerControllerDelegate, UINavigationControllerDelegate>
{
    UIImageView *customSharedContent;
    UIAlertController *screenShareMenuAlertController;
    UIImagePickerController *imagePickerViewContoller;
}
@property (nonatomic) MainView *mainView;
@property (nonatomic) OTOneToOneCommunicator *oneToOneCommunicator;
@property (nonatomic) OTScreenSharer *screenSharer;
@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.mainView = (MainView *)self.view;
    self.oneToOneCommunicator = [OTOneToOneCommunicator sharedInstance];
    self.screenSharer = [OTScreenSharer sharedInstance];
#if !(TARGET_OS_SIMULATOR)
    [self.mainView showReverseCameraButton];
#endif
}

- (void)startAudioVideoCall {
    [SVProgressHUD show];
    [self.screenSharer disconnect];
    [self.oneToOneCommunicator connectWithHandler:^(OTOneToOneCommunicationSignal signal, NSError *error) {
        if (!error) {
            [self handleCommunicationSignal:signal];
        }
        else {
            [SVProgressHUD showErrorWithStatus:error.localizedDescription];
        }
    }];
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    
    if (!self.oneToOneCommunicator.isCallEnabled && !self.screenSharer.isScreenSharing) {
        [self startAudioVideoCall];
    }
    else {
        [SVProgressHUD popActivity];
        [self.screenSharer disconnect];
        [self.oneToOneCommunicator disconnect];
        [self.mainView connectCallHolder:NO];
        [self.mainView updateControlButtonsForEndingCall];
        [self.mainView removePublisherView];
        [self.mainView removeSubscriberView];
        [self.mainView removePlaceHolderImage];
        [self.mainView removeAnnotationToolBar];
    }
}

- (void)handleCommunicationSignal:(OTOneToOneCommunicationSignal)signal {
    
    
    switch (signal) {
        case OTSessionDidConnect: {
            [SVProgressHUD popActivity];
            [self.mainView connectCallHolder:YES];
            [self.mainView updateControlButtonsForCall];
            [self.mainView addPublisherView:self.oneToOneCommunicator.publisherView];
            break;
        }
        case OTSessionDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when connecting."];
            break;
        }
        case OTSessionStreamDestroyed:{
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
        case OTPublisherStreamCreated: {
            NSLog(@"Your publishing feed is streaming in OpenTok");
            break;
        }
        case OTPublisherStreamDestroyed: {
            NSLog(@"Your publishing feed stops streaming in OpenTok");
            break;
        }
        case OTPublisherDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when publishing."];
            break;
        }
        case OTSubscriberDidConnect:{
            if (self.oneToOneCommunicator.subscribeToVideo) {
                [self.mainView addSubscribeView:self.oneToOneCommunicator.subscriberView];
            }
            else {
                [self.mainView addPlaceHolderToSubscriberView];
            }
            break;
        }
        case OTSubscriberDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when subscribing."];
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
    
    if (self.oneToOneCommunicator.isCallEnabled) {
        self.oneToOneCommunicator.publishAudio = !self.oneToOneCommunicator.publishAudio;
        [self.mainView updatePublisherAudio:self.oneToOneCommunicator.publishAudio];
    }
    else if (self.screenSharer.isScreenSharing) {
        self.screenSharer.publishAudio = !self.screenSharer.publishAudio;
        [self.mainView updatePublisherAudio:self.screenSharer.publishAudio];
    }
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

#pragma mark - Screen Sharing
- (IBAction)annotationButtonPressed:(UIButton *)sender {
    
    [self.mainView toggleAnnotationToolBar];
}

- (IBAction)screenShareButtonPressed:(UIButton *)sender {
    
    if (!self.screenSharer.isScreenSharing) {
        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone) {
            [self presentViewController:self.screenShareMenuAlertController animated:YES completion:nil];
        }
        else {
            UIPopoverController *popup = [[UIPopoverController alloc] initWithContentViewController:self.screenShareMenuAlertController];
            [popup presentPopoverFromRect:self.mainView.screenShareHolder.bounds
                                   inView:self.mainView.screenShareHolder
                 permittedArrowDirections:UIPopoverArrowDirectionAny
                                 animated:YES];
        }
    }
    else {
        [self startAudioVideoCall];
    }
}

- (void)startScreenShare {
    [SVProgressHUD show];
    [self.oneToOneCommunicator disconnect];
    [self.screenSharer connectWithView:self.mainView.shareView handler:^(OTScreenShareSignal signal, NSError *error) {
        if (!error) {
            [self handleScreenShareSignal:signal];
        }
        else {
            [SVProgressHUD showErrorWithStatus:error.localizedDescription];
        }
    }];
}

- (void)handleScreenShareSignal:(OTScreenShareSignal)signal {
    
    switch (signal) {
        case OTScreenShareSignalSessionDidConnect: {
            [SVProgressHUD popActivity];
            [self.mainView addScreenShareViewWithContentView:customSharedContent];
            [self.mainView toggleAnnotationToolBar];
            [self.mainView updateControlButtonsForScreenShare];
            [self.mainView showScreenShareNotificationBar:YES];
            break;
        }
        case OTScreenShareSignalSessionDidDisconnect: {
            [customSharedContent removeFromSuperview];
            [self.mainView removeScreenShareView];
            [self.mainView removeAnnotationToolBar];
            [self.mainView cleanCanvas];
            [self.mainView showScreenShareNotificationBar:NO];
            break;
        }
        case OTSessionDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when connecting"];
            break;
        }
        case OTScreenShareSignalPublisherDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when publishing"];
            break;
        }
        case OTScreenShareSignalSubscriberDidFail:{
            [SVProgressHUD showErrorWithStatus:@"Problem when subscribing"];
            break;
        }
        case OTScreenShareSignalSubscriberVideoDisableWarning:{
            [SVProgressHUD showErrorWithStatus:@"Network connection is unstable."];
            break;
        }
        default:
            break;
    }
}

#pragma mark - UIImagePickerControllerDelegate

- (UIAlertController *)screenShareMenuAlertController {
    if (!screenShareMenuAlertController) {
        screenShareMenuAlertController = [UIAlertController alertControllerWithTitle:nil
                                                                             message:@"Please choose the content you want to share"
                                                                      preferredStyle:UIAlertControllerStyleActionSheet];
        
        
        __weak MainViewController *weakSelf = self;
        UIAlertAction *grayAction = [UIAlertAction actionWithTitle:@"Gray Canvas"
                                                             style:UIAlertActionStyleDefault
                                                           handler:^(UIAlertAction *action) {
                                                               
                                                               [weakSelf startScreenShare];
                                                           }];
        
        UIAlertAction *cameraRollAction = [UIAlertAction actionWithTitle:@"Camera Roll"
                                                                   style:UIAlertActionStyleDefault
                                                                 handler:^(UIAlertAction *action) {
                                                                     
                                                                     if (!imagePickerViewContoller) {
                                                                         imagePickerViewContoller = [[UIImagePickerController alloc] init];
                                                                         imagePickerViewContoller.delegate = self;
                                                                         imagePickerViewContoller.allowsEditing = YES;
                                                                         imagePickerViewContoller.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
                                                                     }
                                                                     [self presentViewController:imagePickerViewContoller animated:YES completion:nil];
                                                                 }];
        
        [screenShareMenuAlertController addAction:grayAction];
        [screenShareMenuAlertController addAction:cameraRollAction];
        [screenShareMenuAlertController addAction:
         [UIAlertAction actionWithTitle:@"Cancel"
                                  style:UIAlertActionStyleDestructive
                                handler:^(UIAlertAction *action) {
                                    
                                    [screenShareMenuAlertController dismissViewControllerAnimated:YES completion:nil];
                                }]
         ];
    }
    return screenShareMenuAlertController;
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary<NSString *,id> *)info {
    UIImage *chosenImage = info[UIImagePickerControllerOriginalImage];
    customSharedContent = [[UIImageView alloc] initWithImage:chosenImage];
    customSharedContent.contentMode = UIViewContentModeScaleAspectFit;
    [picker dismissViewControllerAnimated:YES completion:^(){
        [self startScreenShare];
    }];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
    [picker dismissViewControllerAnimated:YES completion:nil];
}

@end
