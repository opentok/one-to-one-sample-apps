#import "AppDelegate.h"
#import "OneToOneCommunicator.h"

@interface AppDelegate ()

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // Override point for customization after application launch.
    
    [OneToOneCommunicator setOpenTokApiKey:@"45514142"
                                 sessionId:@"2_MX40NTUxNDE0Mn5-MTQ1NjgwOTQ1NDAyMX5TZGRtaVZGZmV2cis3S0RvMjJEQlNDOVZ-UH4" token:@"T1==cGFydG5lcl9pZD00NTUxNDE0MiZzZGtfdmVyc2lvbj10YnBocC12MC45MS4yMDExLTA3LTA1JnNpZz0yNWI3MTBmZTkxNzNjNDlkNjU2ZDFjZTlhZjQyNjE5YmUyNWI2ZjJjOnNlc3Npb25faWQ9Ml9NWDQwTlRVeE5ERTBNbjUtTVRRMU5qZ3dPVFExTkRBeU1YNVRaR1J0YVZaR1ptVjJjaXMzUzBSdk1qSkVRbE5ET1ZaLVVINCZjcmVhdGVfdGltZT0xNDU4MjMwNjk4JnJvbGU9bW9kZXJhdG9yJm5vbmNlPTE0NTgyMzA2OTguMzE0ODE5NDY4MzIyNTEmZXhwaXJlX3RpbWU9MTQ2MDgyMjY5OA=="
                            selfSubscribed:NO];
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
  // Saves changes in the application's managed object context before the application terminates.
}

@end