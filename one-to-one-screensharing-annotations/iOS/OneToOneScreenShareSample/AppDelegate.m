//
//  AppDelegate.m
//  OneToOneScreenShareSample
//
//  Created by Xi Huang on 5/23/16.
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "AppDelegate.h"
#import "OneToOneCommunicator.h"

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    [OneToOneCommunicator setOpenTokApiKey:@"45589022"
                                 sessionId:@"1_MX40NTU4OTAyMn5-MTQ2NDc5NzE5ODUzOH5HazV0QnpCdE9zbVB3cEtuR0hnZGpYUnV-fg"
                                     token:@"T1==cGFydG5lcl9pZD00NTU4OTAyMiZzaWc9YmI5NTQ3OTA4MmQ3ODg1Nzg5NDNhNmEwNzkzNzRjNGI3ODNjYjhhNTpzZXNzaW9uX2lkPTFfTVg0ME5UVTRPVEF5TW41LU1UUTJORGM1TnpFNU9EVXpPSDVIYXpWMFFucENkRTl6YlZCM2NFdHVSMGhuWkdwWVVuVi1mZyZjcmVhdGVfdGltZT0xNDY0Nzk3MjExJm5vbmNlPTAuNTMxODE2OTY2MzY2MDIyOCZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNDY3Mzg5MjEw"];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
