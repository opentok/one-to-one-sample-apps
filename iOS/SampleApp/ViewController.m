//
//  ViewController.m
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "ViewController.h"
#import "AVCommunication.h"

@interface ViewController ()
@property AVCommunication *avcommunicationController;
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
static NSString* const kTextChatType = @"AVCommunication";

@implementation ViewController

NSMutableDictionary *configInfo;

- (void)viewDidLoad {
  [super viewDidLoad];
  
  configInfo = [NSMutableDictionary
                    dictionaryWithDictionary: @{
                                               @"api": kApiKey,
                                               @"sessionId": kSessionId,
                                               @"token": kToken
                                               }];
}

-(void)viewDidAppear:(BOOL)animated{
  if(configInfo){
    self.avcommunicationController = [[AVCommunication alloc] initWithData:configInfo];
    [self presentViewController:self.avcommunicationController animated:YES completion:nil];
  }
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

@end
