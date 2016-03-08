//
//  OneToOneCommunication.m
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "OneToOneCommunication.h"
#import "OTKAnalytics.h"
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
  if( self = [self initWithNibName:@"OneToOneCommunication" bundle:[NSBundle mainBundle]]) {
    self.configInfo = configInfo;
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
  }
  self.enable_call = YES;
  self._viewController = viewController;
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  _session = [[OTSession alloc] initWithApiKey:self.configInfo[@"api"]
                                     sessionId:self.configInfo[@"sessionId"]
                                      delegate:self];
  subscribeToSelf = [self.configInfo[@"subscribeToSelf"] boolValue];
}

# pragma mark - OTSession delegate callbacks

-(void) sessionDidConnect:(OTSession*)session{
    [self._viewController setConnectingLabelAlpha:0];
    
    //Add analytics logging
    [self addLogEvent];
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
    _subscriber = nil;
  }
}

-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
  assert(_subscriber == subscriber);
  (_subscriber.view).frame = CGRectMake(0, 0, self.subscriberView.bounds.size.width,self.subscriberView.bounds.size.height);
  [self.subscriberView addSubview:_subscriber.view];
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
  
  [self.publisherView addSubview:_publisher.view];
  (_publisher.view).frame = CGRectMake(0, 0, self.publisherView.bounds.size.width, self.publisherView.bounds.size.height);
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


-(void) addLogEvent {
    NSString *trimmedString = [self.configInfo[@"api"] stringByReplacingOccurrencesOfString:@" " withString:@""];
    
    NSInteger *partner = [trimmedString intValue];
    
    
    OTKAnalyticsData *data = [[OTKAnalyticsData alloc] initWithSessionId: self.configInfo[@"sessionId"]
                                                            connectionId: _session.connection.connectionId
                                                               partnerId:partner
                                                           clientVersion: @"1.0.0"];
    
    OTKAnalytics *logging = [[OTKAnalytics alloc] initWithData:data];
    
    [logging logEventAction:@"one-to-one-sample-app-ios" variation:@""];
    
}


- (IBAction)publisherMicrophoneButtonPressed:(UIButton *)sender {
  [self._viewController publisherMicrophonePressed:sender];
}

- (IBAction)publisherCallButtonPressed:(UIButton *)sender {
    [self._viewController startCall:sender];
}

- (IBAction)publisherVideoButtonPressed:(UIButton *)sender {
  [self._viewController publisherVideoPressed:sender];
}


- (IBAction)publisherCameraButtonPressed:(UIButton *)sender {
  [self._viewController publisherCameraPressed:sender];
}

- (IBAction)subscriberVideoButtonPressed:(UIButton *)sender {
  [self._viewController subscriberVideoPressed:sender];
}
- (IBAction)subscriberAudioButtonPressed:(UIButton *)sender {
  [self._viewController subscriberAudioPressed:sender];
}
// ===============================================================================================//
-(void) showErrorView: (NSString *) error_message {
  // Show error message
  _errorMessage.alpha = 0.0f;
  [_errorMessage setTitle: error_message forState: UIControlStateNormal];
  [UIView animateWithDuration:0.5 animations:^{
    _errorMessage.alpha = 0.6f;
  }];
  
  [UIView animateWithDuration:0.5
                        delay:4
                      options:UIViewAnimationOptionTransitionNone
                   animations:^{
                     _errorMessage.alpha = 0.0f;
                   } completion:nil];
}
@end
