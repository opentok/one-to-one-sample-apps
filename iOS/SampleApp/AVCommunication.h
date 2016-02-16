//
//  AVCommunication.h
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Opentok/OpenTok.h>

@interface AVCommunication : UIViewController
@property (strong,nonatomic) NSMutableDictionary *configInfo;
- (id)initWithData:(NSMutableDictionary *)configInfo;

@end
