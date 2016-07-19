//
//  OneToOneSampleTests.m
//
// Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import <XCTest/XCTest.h>
#import <Kiwi/Kiwi.h>
#import "OneToOneCommunicator.h"

SPEC_BEGIN(TestOneToOneCommunicator)

beforeAll(^(){
    [OneToOneCommunicator setOpenTokApiKey:@"testOneToOneCommunicatorInit"
                                 sessionId:@"testOneToOneCommunicatorInit"
                                     token:@"testOneToOneCommunicatorInit"];
});

describe(@"testOneToOneCommunicatorInit", ^(){
    
    OneToOneCommunicator *one = [OneToOneCommunicator oneToOneCommunicator];
    [[one shouldNot] beNil];
    [[theValue(one.isCallEnabled) should] beNo];
    
    // subscriber
    [[one.subscriberView should] beNil];
    [[theValue(one.subscribeToAudio) should] beNo];
    [[theValue(one.subscribeToVideo) should] beNo];
    
    // publisher
    [[one.publisherView should] beNil];
    [[theValue(one.publishAudio) should] beNo];
    [[theValue(one.publishVideo) should] beNo];
});

describe(@"testOneWayPublisher", ^(){
    
});


describe(@"testOneWaySubscriber", ^(){
    
});

SPEC_END