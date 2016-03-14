#import "OneToOneCommunication.h"
#import <Opentok/OpenTok.h>

@interface OneToOneCommunication () <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@end

@implementation OneToOneCommunication

OTSession *_session;

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
bool subscribeToSelf;
// ===============================================================================================//

-(id) initWithData:(NSMutableDictionary *)configInfo view:(id)viewController{
  //NSBundle *bundle = [NSBundle bundleForClass:[self class]];
//  if( self = [self initWithNibName:@"OneToOneCommunication" bundle:[NSBundle mainBundle]]) {
//    self.configInfo = configInfo;
//    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
//  }
  self.configInfo = configInfo;
  self.enable_call = YES;
  self._viewController = viewController;
  _session = [[OTSession alloc] initWithApiKey:self.configInfo[@"api"]
                                     sessionId:self.configInfo[@"sessionId"]
                                      delegate:self];
  subscribeToSelf = [self.configInfo[@"subscribeToSelf"] boolValue];

  return self;
}

# pragma mark - OTSession delegate callbacks

-(void) sessionDidConnect:(OTSession*)session{
    [self._viewController setConnectingLabelAlpha:0];
  
  // We have successfully connected, now instantiate a publisher and
  // begin pushing A/V streams into OpenTok.
  [self doPublish];
}

-(void) sessionDidDisconnect:(OTSession*)session{
  // We have successfully disconnected, now stop a publisher and
  // leave the app in status ready to reconnect if need.
  [self doUnpublish];
}

-(void) session:(OTSession *)session streamCreated:(OTStream *)stream{
  NSLog(@"session streamCreated (%@)", stream.streamId);
  // (if NO == subscribeToSelf): Begin subscribing to a stream we
  // have seen on the OpenTok session.
  if (!subscribeToSelf) {
    [self doSubscribe:stream];
  }
}

- (void)session:(OTSession*)session streamDestroyed:(OTStream *)stream {
  NSLog(@"session streamDestroyed (%@)", stream.streamId);
  if ([_subscriber.stream.streamId isEqualToString:stream.streamId]) {
    [_subscriber.view removeFromSuperview];
    self._viewController.subscriberView.backgroundColor = [UIColor grayColor];
    _subscriber = nil;
  }
}

-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
  assert(_subscriber == subscriber);
  (_subscriber.view).frame = CGRectMake(0, 0, self._viewController.subscriberView.bounds.size.width,self._viewController.subscriberView.bounds.size.height);
  [self._viewController.subscriberView addSubview:_subscriber.view];
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {
   NSLog(@"session did failed with error: (%@)", error);
  [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  [self._viewController setConnectingLabelAlpha:1];
  [self doConnect];
}

-(void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
  NSLog(@"subscriber did failed with error: (%@)", error);
  [self showErrorView: [NSString stringWithFormat:@"Problems when subscribing"]];
}

-(void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
  NSLog(@"publisher did failed with error: (%@)", error);
  [self showErrorView:[NSString stringWithFormat: @"Problems when publishing"]];
}

// ===============================================================================================//
// when the connection is unstable and video is no longer suported by the connection or the CPU
// is using a lot of resources this method can be triggered
// ===============================================================================================//

-(void)subscriberVideoDisabled:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
  [self._viewController badQualityDisableVideo: [NSNumber numberWithInteger: reason] quiality_error: [NSNumber numberWithInteger: OTSubscriberVideoEventQualityChanged]];
  }

- (void)subscriberVideoEnabled:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
  self._viewController.errorMessage.alpha = 0;
  self._viewController.subscriberView.backgroundColor = [UIColor clearColor];
  [self._viewController.subscriberView addSubview:_subscriber.view];
}

-(void) subscriberVideoDisableWarning:(OTSubscriber *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    [self._viewController badQualityDisableVideo: [NSNumber numberWithInteger: reason] quiality_error: [NSNumber numberWithInteger: OTSubscriberVideoEventQualityChanged]];
}

-(void) subscriberVideoDisableWarningLifted:(OTSubscriberKit *)subscriber reason:(OTSubscriberVideoEventReason)reason {
    self._viewController.errorMessage.alpha = 0;
    self._viewController.subscriberView.backgroundColor = [UIColor clearColor];
    [self._viewController.subscriberView addSubview:_subscriber.view];
}

// ===============================================================================================//

#pragma mark - OpenTok methods

/**
 * Asynchronously begins the session connect process. Some time later, we will
 * expect a delegate method to call us back with the results of this action.
 */
- (void)doConnect {
  [self._viewController setConnectingLabelAlpha:1];
  OTError *error = nil;
  [_session connectWithToken:self.configInfo[@"token"] error:&error];
  if (error)  {
    NSLog(@"do connect error");
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
}


/**
 * kills the current session
 */
-(void)doDisconnect {
  OTError *error = nil;
  [_session disconnect:&error];
  if (error) {
    NSLog(@"disconnect failed with error: (%@)", error);
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
  [self cleanupSubscriber];
}


/**
 * Sets up an instance of OTPublisher to use with this session. OTPubilsher
 * binds to the device camera and microphone, and will provide A/V streams
 * to the OpenTok session.
 */
-(void) doPublish {
  if(!_publisher){
    _publisher = [[OTPublisher alloc] initWithDelegate:self name:[UIDevice currentDevice].name];
  }
  
  OTError *error = nil;
  if (error) {
    NSLog(@"publish error");
    [self showErrorView: [NSString stringWithFormat:@"publish error: (%@)", error]];
  }
  [_session publish:_publisher error:&error];
  
  [self._viewController.publisherView addSubview:_publisher.view];
  (_publisher.view).frame = CGRectMake(0, 0, self._viewController.publisherView.bounds.size.width, self._viewController.publisherView.bounds.size.height);
}

/**
 * Cleans up the publisher and its view. At this point, the publisher should not
 * be attached to the session any more.
 */
-(void) doUnpublish {
  OTError* error = nil;
  if (_subscriber) {
    [_session unsubscribe:_subscriber error:&error];
  }
  if (error) {
    NSLog(@"unsubscribe failed with error: (%@)", error);
    [self showErrorView: [NSString stringWithFormat: @"unsubscribe failed with error: (%@)", error]];
  }
  
  [_publisher.view removeFromSuperview];
  [_subscriber.view removeFromSuperview];
  _publisher = nil;
  _subscriber = nil;
}

/**
 * Instantiates a subscriber for the given stream and asynchronously begins the
 * process to begin receiving A/V content for this stream. Unlike doPublish,
 * this method does not add the subscriber to the view hierarchy. Instead, we
 * add the subscriber only after it has connected and begins receiving data.
 */
- (void)doSubscribe:(OTStream*)stream {
  _subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];

  OTError *error = nil;
  [_session subscribe: _subscriber error:&error];
  if (error) {
    NSLog(@"subscribe error");
    [self showErrorView: [NSString stringWithFormat: @"subscribe error: (%@)", error]];
  }
}

/**
 * Cleans the subscriber from the view hierarchy, if any.
 * NB: You do *not* have to call unsubscribe in your controller in response to
 * a streamDestroyed event. Any subscribers (or the publisher) for a stream will
 * be automatically removed from the session during cleanup of the stream.
 */
- (void)cleanupSubscriber {
  [_subscriber.view removeFromSuperview];
  _subscriber = nil;
}
//
-(void) didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

// ===============================================================================================//
-(void) showErrorView: (NSString *) error_message {
  // Show error message
  self._viewController.errorMessage.alpha = 0.0f;
  [self._viewController.errorMessage setTitle: error_message forState: UIControlStateNormal];
  [UIView animateWithDuration:0.5 animations:^{
    self._viewController.errorMessage.alpha = 0.6f;
  }];
  
  [UIView animateWithDuration:0.5
                        delay:4
                      options:UIViewAnimationOptionTransitionNone
                   animations:^{
                     self._viewController.errorMessage.alpha = 0.0f;
                   } completion:nil];
}
@end
