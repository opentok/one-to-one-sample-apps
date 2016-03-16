#import "ViewController.h"
#import "OneToOneCommunication.h"

@interface ViewController ()
@property OneToOneCommunication *onetoonecommunicationController;
@property UIImageView *avatarImageView;

@end

// ===============================================================================================//
// *** Fill the following variables using your own Project info  ***
// ***          https://dashboard.tokbox.com/projects            ***
// Replace with your OpenTok API key
static NSString* const kApiKey = @"";
// Replace with your generated session ID
static NSString* const kSessionId = @"";
// Replace with your generated token
static NSString* const kToken = @"";
// ===============================================================================================//
// Change to NO to subscribe to streams other than your own.
static bool subscribeToSelf = NO;


@implementation ViewController

NSMutableDictionary *configInfo;

- (BOOL)prefersStatusBarHidden {
  return YES;
}

- (BOOL)shouldAutorotateToInterfaceOrientation: (UIInterfaceOrientation)interfaceOrientation {
  return YES;
}

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
    self.errorMessage.alpha = 0;
    [self removeAvatarFromUIView:self.publisherView];
    [self removeAvatarFromUIView:self.subscriberView];
    self.publisherView.alpha = 0; //to hide the publisher view
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
    [self.onetoonecommunicationController.publisher.view removeFromSuperview];
    [self paintPublisherAvatar: self.publisherView ];
  } else {
    [sender setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
    [self.publisherView addSubview:self.onetoonecommunicationController.publisher.view];
    (self.onetoonecommunicationController.publisher.view).frame = CGRectMake(0, 0, self.publisherView.bounds.size.width, self.publisherView.bounds.size.height);
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
  
  NSAssert(kApiKey.length != 0, @"OpenTok: API key can not be empty, please add it to ViewController");
  NSAssert(kSessionId.length != 0, @"OpenTok: Session Id can not be empty, please add it to ViewController");
  NSAssert(kToken.length != 0, @"OpenTok: Token can not be empty, please add it to ViewController");
  configInfo = [NSMutableDictionary
                  dictionaryWithDictionary: @{
                                               @"api": kApiKey,
                                               @"sessionId": kSessionId,
                                               @"token": kToken,
                                               @"subscribeToSelf": [NSNumber numberWithBool:subscribeToSelf]
                                               }];

  [self makingBorder:_micHolder need_white_border:YES];
  [self makingBorder:_callHolder need_white_border:NO];
  [self makingBorder:_videoHolder need_white_border:YES];
  [self setRemoteControls:0];
  self.onetoonecommunicationController = [[OneToOneCommunication alloc] initWithData:configInfo view:(ViewController*)self];
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
  [self setRemoteControls:1];
  [self performSelector:@selector(setRemoteControls:)
             withObject:0
             afterDelay:7.0];
}

-(void) setConnectingLabelAlpha:(NSInteger)alpha{
  [_connectingLabel setAlpha:alpha];
}

// ===============================================================================================//
// Helps with the round borders on the interface buttons
// ===============================================================================================//
-(void) makingBorder: (UIView *)sendingView need_white_border: (BOOL)border {
  sendingView.layer.cornerRadius = (sendingView.bounds.size.width/2);
  if (border) {
    sendingView.layer.borderWidth = 1;
    sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
  }
}
-(void) setRemoteControls:(NSInteger)alpha{
  [_subscriberAudioButton setAlpha:alpha];
  [_subscriberVideoButton setAlpha:alpha];
}

// ===============================================================================================//
// Remove subscriber video and replace it with the avatar picture to the subscriber view instead
// ===============================================================================================//
-(void) badQualityDisableVideo: (id) reason quiality_error: (id) reason_quiality_error {
  if (![reason respondsToSelector:@selector(intValue)] && ![reason_quiality_error respondsToSelector:@selector(intValue)]) {
    return ;
  }
  
  [self.onetoonecommunicationController.subscriber.view removeFromSuperview];
  [self paintSubscriberAvatar:self.subscriberView parentView:self.onetoonecommunicationController.subscriber.view];

  if (reason == reason_quiality_error) {
    self.onetoonecommunicationController.subscriber.subscribeToVideo = !self.onetoonecommunicationController.subscriber.subscribeToVideo;
    self.errorMessage.alpha = 0.8f;
    [self.errorMessage setTitle: @"Network connection is unstable." forState: UIControlStateNormal];
  }
}

-(void) paintSubscriberAvatar: (UIView *) embedView parentView: (UIView *) viewParent {
  _avatarImageView = [[UIImageView alloc] initWithFrame:viewParent.bounds];
  _avatarImageView.backgroundColor = [UIColor clearColor];
  _avatarImageView.contentMode = UIViewContentModeScaleAspectFit;
  _avatarImageView.image = [UIImage imageNamed:@"page1"];
  
  _avatarImageView.contentMode = UIViewContentModeScaleAspectFit;
  [embedView addSubview:_avatarImageView];
}

-(void) paintPublisherAvatar: (UIView *) viewParent {
  _avatarImageView = [[UIImageView alloc] initWithFrame:viewParent.bounds];
  _avatarImageView.backgroundColor = [UIColor clearColor];
  _avatarImageView.contentMode = UIViewContentModeScaleAspectFit;
  _avatarImageView.image = [UIImage imageNamed:@"page1"];
  
  _avatarImageView.contentMode = UIViewContentModeScaleAspectFit;
  
  [viewParent addSubview:_avatarImageView];
}

- (void)removeAvatarFromUIView:(UIView *)parentView {
  for (id child in [parentView subviews]) {
    if ([child isMemberOfClass:[UIImageView class]]) {
      [child removeFromSuperview];
    }
  }
}

-(void) publisherAddStyle {
  //Adding border and background to publisher view
  self.publisherView.alpha = 1;
  self.publisherView.layer.borderWidth = 1;
  self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
  self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
  self.publisherView.layer.cornerRadius = 3;
}

@end
