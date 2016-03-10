#import "ViewController.h"
#import "OneToOneCommunication.h"

@interface ViewController ()
@property OneToOneCommunication *onetoonecommunicationController;

@end

// ===============================================================================================//
// *** Fill the following variables using your own Project info  ***
// ***          https://dashboard.tokbox.com/projects            ***
// Replace with your OpenTok API key
static NSString* const kApiKey = @"100";
// Replace with your generated session ID
static NSString* const kSessionId = @"2_MX4xMDB-fjE0NTQwNTg5MjU1MjZ-VmZNMG1pNUtwaXNNOHVYeUh5aWZqV3Bqfn4";
// Replace with your generated token
static NSString* const kToken = @"T1==cGFydG5lcl9pZD0xMDAmc2RrX3ZlcnNpb249dGJwaHAtdjAuOTEuMjAxMS0wNy0wNSZzaWc9NGU0ZmYzOGZmMDcwZTQyOGI4YTQ2NzhiYTgwNmU0Njg5NWVhOGRkNTpzZXNzaW9uX2lkPTJfTVg0eE1EQi1makUwTlRRd05UZzVNalUxTWpaLVZtWk5NRzFwTlV0d2FYTk5PSFZZZVVoNWFXWnFWM0JxZm40JmNyZWF0ZV90aW1lPTE0NTU4MDYzNTQmcm9sZT1tb2RlcmF0b3Imbm9uY2U9MTQ1NTgwNjM1NC40NzA1MjA4NzY2NTE3NSZleHBpcmVfdGltZT0xNDU4Mzk4MzU0JmNvbm5lY3Rpb25fZGF0YT1Fc3RlYmFu";
// ===============================================================================================//
// Change to NO to subscribe to streams other than your own.
static bool subscribeToSelf = NO;


@implementation ViewController

NSMutableDictionary *configInfo;

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.enable_call) {
    //BLUE SIDE
    [sender setImage:[UIImage imageNamed:@"hangUp"] forState: UIControlStateNormal];
    self.onetoonecommunicationController.enable_call = NO;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor; //red background
    [self.onetoonecommunicationController doConnect];
  } else {
    // RED SIDE
    [sender setImage:[UIImage imageNamed:@"startCall"] forState: UIControlStateNormal];
    self.onetoonecommunicationController.enable_call = YES;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor; //blue background
    [self.onetoonecommunicationController doDisconnect];
  }
}

- (IBAction)publisherMicrophoneButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.publisher.publishAudio) {
    [sender setImage:[UIImage imageNamed:@"mutedMicLineCopy"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.publisher.publishAudio = !self.onetoonecommunicationController.publisher.publishAudio;
}

- (IBAction)publisherVideoButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.publisher.publishVideo) {
    [sender setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.publisher.publishVideo = !self.onetoonecommunicationController.publisher.publishVideo;
}

- (IBAction)publisherCameraButtonPressed:(UIButton *)sender {
  if (self.onetoonecommunicationController.publisher.cameraPosition == AVCaptureDevicePositionBack) {
    self.onetoonecommunicationController.publisher.cameraPosition = AVCaptureDevicePositionFront;
  } else {
    self.onetoonecommunicationController.publisher.cameraPosition = AVCaptureDevicePositionBack;
  }
}

- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.subscriber.subscribeToVideo) {
    [sender setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.subscriber.subscribeToVideo = !self.onetoonecommunicationController.subscriber.subscribeToVideo;
}
- (IBAction)subscriberAudioButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.subscriber.subscribeToAudio) {
    [sender setImage:[UIImage imageNamed:@"noSoundCopy"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.subscriber.subscribeToAudio = !self.onetoonecommunicationController.subscriber.subscribeToAudio;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  
  configInfo = [NSMutableDictionary
                  dictionaryWithDictionary: @{
                                               @"api": kApiKey,
                                               @"sessionId": kSessionId,
                                               @"token": kToken,
                                               @"subscribeToSelf": [NSNumber numberWithBool:subscribeToSelf]
                                               }];

  [self makingBorder:_micHolder need_background_transparent:YES];
  [self makingBorder:_callHolder need_background_transparent:NO];
  [self makingBorder:_videoHolder need_background_transparent:YES];
  self.onetoonecommunicationController = [[OneToOneCommunication alloc] initWithData:configInfo view:(ViewController*)self];
}

-(void) setConnectingLabelAlpha:(NSInteger)alpha{
    [_connectingLabel setAlpha:alpha];
}

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (BOOL)shouldAutorotateToInterfaceOrientation: (UIInterfaceOrientation)interfaceOrientation {
    return YES;
}

- (void) adjustViewsForOrientation:(UIInterfaceOrientation)orientation{
    if (orientation == UIInterfaceOrientationLandscapeLeft || orientation == UIInterfaceOrientationLandscapeRight ||
        orientation == UIInterfaceOrientationPortrait || orientation == UIInterfaceOrientationPortraitUpsideDown) {
        
        (self.onetoonecommunicationController.subscriber.view).frame = CGRectMake(0, 0, self.view.frame.size.height,self.view.frame.size.width);
        
        _subscriberView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleBottomMargin |
        UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin |
        UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
    }
}


-(void) didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

// ===============================================================================================//
// Helps with the round borders on the interface buttons
// ===============================================================================================//
-(void) makingBorder: (UIView *)sendingView need_background_transparent: (BOOL)transparent {
    sendingView.layer.cornerRadius = (sendingView.bounds.size.width/2);
    if (transparent) {
        sendingView.layer.borderWidth = 1;
        sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
    }
}
@end
