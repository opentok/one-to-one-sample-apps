//
//  ViewController.m
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "ViewController.h"
#import "Widget.h"

@interface ViewController ()
@property Widget *widgetController;
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
static NSString* const kTextChatType = @"A/V Call";

@implementation ViewController

NSMutableDictionary *connectionInfo;

- (void)viewDidLoad {
  [super viewDidLoad];
  
  connectionInfo = [NSMutableDictionary
                    dictionaryWithDictionary: @{
                                               @"api": kApiKey,
                                               @"sessionId": kSessionId,
                                               @"token": kToken
                                               }];
}

-(void)viewDidAppear:(BOOL)animated{
  if(connectionInfo){
    self.widgetController = [[Widget alloc] initWithData:connectionInfo];
    [self presentViewController:self.widgetController animated:YES completion:nil];
  }
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

@end
