//
//  OneToOneCommunication.h
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Opentok/OpenTok.h>
#import "ViewController.h"

@interface OneToOneCommunication : UIViewController

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
@property (nonatomic) bool enable_call;
// ===============================================================================================//

@property (nonatomic) ViewController *_viewController;

@property (strong, nonatomic) NSMutableDictionary *configInfo;
@property (strong, nonatomic) OTSubscriber *subscriber;
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIView *videoHolder;
@property (strong, nonatomic) IBOutlet UIView *callHolder;
@property (strong, nonatomic) IBOutlet UIView *micHolder;

@property (strong, nonatomic) IBOutlet UIButton *toggleCallButton;
@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;
@property (strong, nonatomic) OTPublisher *publisher;

- (id)initWithData:(NSMutableDictionary *)configInfo view:(id)viewController;

- (void)doConnect;

- (void)doDisconnect;
@end
