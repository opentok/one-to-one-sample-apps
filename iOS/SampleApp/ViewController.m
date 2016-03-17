#import "ViewController.h"
#import "OneToOneCommunication.h"

@interface ViewController ()
@property (nonatomic) OneToOneCommunication *onetoonecommunicationController;
@property (nonatomic) UIImageView *avatarImageView;
@end

// ===============================================================================================//
// *** Fill the following variables using your own Project info  ***
// ***          https://dashboard.tokbox.com/projects            ***
// Replace with your OpenTok API key
static NSString* const kApiKey = @"45514142";
// Replace with your generated session ID
static NSString* const kSessionId = @"2_MX40NTUxNDE0Mn5-MTQ1NjgwOTQ1NDAyMX5TZGRtaVZGZmV2cis3S0RvMjJEQlNDOVZ-UH4";
// Replace with your generated token
static NSString* const kToken = @"T1==cGFydG5lcl9pZD00NTUxNDE0MiZzZGtfdmVyc2lvbj10YnBocC12MC45MS4yMDExLTA3LTA1JnNpZz03OTVmYjYzYWQ3YjU3NzZmNDgyN2E3ODI3ZDU1MTUxNTdjYWFjN2FhOnNlc3Npb25faWQ9Ml9NWDQwTlRVeE5ERTBNbjUtTVRRMU5qZ3dPVFExTkRBeU1YNVRaR1J0YVZaR1ptVjJjaXMzUzBSdk1qSkVRbE5ET1ZaLVVINCZjcmVhdGVfdGltZT0xNDU4MjI5NTkxJnJvbGU9bW9kZXJhdG9yJm5vbmNlPTE0NTgyMjk1OTEuMDQ0ODUzMzQzMTE4NCZleHBpcmVfdGltZT0xNDYwODIxNTkx";
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

/** 
 * toggles the call start/end handles the color of the buttons
 */
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

/**
 * toggles the audio comming from the publisher
 */
- (IBAction)publisherAudioButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.publisher.publishAudio) {
    [sender setImage:[UIImage imageNamed:@"mutedMicLineCopy"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.publisher.publishAudio = !self.onetoonecommunicationController.publisher.publishAudio;
}

/**
 * toggles the video comming from the publisher 
 */
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

/**
 * toggle the camera position (front camera) <=> (back camera)
 */
- (IBAction)publisherCameraButtonPressed:(UIButton *)sender {
  if (self.onetoonecommunicationController.publisher.cameraPosition == AVCaptureDevicePositionBack) {
    self.onetoonecommunicationController.publisher.cameraPosition = AVCaptureDevicePositionFront;
  } else {
    self.onetoonecommunicationController.publisher.cameraPosition = AVCaptureDevicePositionBack;
  }
}

/**
 * toggles the video comming from the subscriber 
 */
- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
  if(self.onetoonecommunicationController.subscriber.subscribeToVideo) {
    [sender setImage:[UIImage imageNamed:@"noVideoIcon"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"videoIcon"] forState: UIControlStateNormal];
  }
  self.onetoonecommunicationController.subscriber.subscribeToVideo = !self.onetoonecommunicationController.subscriber.subscribeToVideo;
}

/**
 * toggles the audio comming from the susbscriber
 */
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
  // making sure connection variables are different from blank
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

/**
 * handles the event when the user does a touch to show and then hide the buttons for
 * subscriber actions within 7 seconds
*/
- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
  [self setRemoteControls:1];
  [self performSelector:@selector(setRemoteControls:)
             withObject:0
             afterDelay:7.0];
}

/**
 * set the alpha on the connecting lable
 */
-(void) setConnectingLabelAlpha:(NSInteger)alpha{
  [_connectingLabel setAlpha:alpha];
}

/**
 * Helps with the round borders on the interface buttons
 */
-(void) makingBorder: (UIView *)sendingView need_white_border: (BOOL)border {
  sendingView.layer.cornerRadius = (sendingView.bounds.size.width/2);
  if (border) {
    sendingView.layer.borderWidth = 1;
    sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
  }
}

/**
 * handles the alpha setting for the subscriber buttons
 */
-(void) setRemoteControls:(NSInteger)alpha{
  [_subscriberAudioButton setAlpha:alpha];
  [_subscriberVideoButton setAlpha:alpha];
}

/**
 * Remove subscriber video and replace it with the avatar picture to the subscriber view instead
 */
-(void) badQualityDisableVideo: (id) reason quiality_error: (id) reason_quiality_error {
  if (![reason respondsToSelector:@selector(intValue)] && ![reason_quiality_error respondsToSelector:@selector(intValue)]) {
    return ;
  }
  [self paintSubscriberAvatar:self.subscriberView parentView:self.onetoonecommunicationController.subscriber.view];

  if (reason == reason_quiality_error) {
    self.onetoonecommunicationController.subscriber.subscribeToVideo = !self.onetoonecommunicationController.subscriber.subscribeToVideo;
    self.errorMessage.alpha = 0.8f;
    [self.errorMessage setTitle: @"Network connection is unstable." forState: UIControlStateNormal];
  }
}

/**
 * helper to print the subscriber avatar
 */
-(void) paintSubscriberAvatar: (UIView *) embedView parentView: (UIView *) viewParent {
  [self creatingAvatarImage:viewParent];
  [embedView addSubview:_avatarImageView];
  [self addingLayoutConstants];
}

/**
 * helper to print the publisher avatar
 */
-(void) paintPublisherAvatar: (UIView *) viewParent {
  [self creatingAvatarImage:viewParent];
  [viewParent addSubview:_avatarImageView];
  [self addingLayoutConstants];
}

/**
 * helper to create the UIImageVIew for the avatar
 */
-(void)creatingAvatarImage: (UIView *) viewParent {
  _avatarImageView = [[UIImageView alloc] initWithFrame:viewParent.bounds];
  _avatarImageView.backgroundColor = [UIColor clearColor];
  _avatarImageView.contentMode = UIViewContentModeScaleAspectFit;
  _avatarImageView.image = [UIImage imageNamed:@"page1"];
  _avatarImageView.translatesAutoresizingMaskIntoConstraints = NO;
}

/**
 * adding constants to be able to handle orientation when video is disable
 */
-(void) addingLayoutConstants {
  NSLayoutConstraint *top = [NSLayoutConstraint constraintWithItem:_avatarImageView
                                                         attribute:NSLayoutAttributeTop
                                                         relatedBy:NSLayoutRelationEqual
                                                            toItem:_avatarImageView.superview
                                                         attribute:NSLayoutAttributeTop
                                                        multiplier:1.0
                                                          constant:0.0];
  NSLayoutConstraint *leading = [NSLayoutConstraint constraintWithItem:_avatarImageView
                                                             attribute:NSLayoutAttributeLeading
                                                             relatedBy:NSLayoutRelationEqual
                                                                toItem:_avatarImageView.superview
                                                             attribute:NSLayoutAttributeLeading
                                                            multiplier:1.0
                                                              constant:0.0];
  NSLayoutConstraint *trailing = [NSLayoutConstraint constraintWithItem:_avatarImageView
                                                              attribute:NSLayoutAttributeTrailing
                                                              relatedBy:NSLayoutRelationEqual
                                                                 toItem:_avatarImageView.superview
                                                              attribute:NSLayoutAttributeTrailing
                                                             multiplier:1.0
                                                               constant:0.0];
  NSLayoutConstraint *bottom = [NSLayoutConstraint constraintWithItem:_avatarImageView
                                                            attribute:NSLayoutAttributeBottom
                                                            relatedBy:NSLayoutRelationEqual
                                                               toItem:_avatarImageView.superview
                                                            attribute:NSLayoutAttributeBottom
                                                           multiplier:1.0
                                                             constant:0.0];
  [NSLayoutConstraint activateConstraints:@[top, leading, trailing, bottom]];
}

/**
 * searching through the all view attached to a single view to be able to remove the correct one
 */
- (void)removeAvatarFromUIView:(UIView *)parentView {
  for (id child in [parentView subviews]) {
    if ([child isMemberOfClass:[UIImageView class]]) {
      [child removeFromSuperview];
    }
  }
}

/**
 * adding border and styles to the publisher view
 */
-(void) publisherAddStyle {
  //Adding border and background to publisher view
  self.publisherView.alpha = 1;
  self.publisherView.layer.borderWidth = 1;
  self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
  self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
  self.publisherView.layer.cornerRadius = 3;
}

@end
