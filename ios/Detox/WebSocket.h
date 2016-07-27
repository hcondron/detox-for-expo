//
//  WebSocket.h
//  Detox
//
//  Created by Tal Kol on 6/16/16.
//  Copyright © 2016 Wix. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SRWebSocket.h"

@protocol WebSocketDelegate <NSObject>

- (void)websocketDidReceiveAction:(NSString*)type withParams:(NSDictionary*)params;

@end


@interface WebSocket : NSObject<SRWebSocketDelegate>

@property (nonatomic, assign) id<WebSocketDelegate> delegate;
- (void) connectToServer:(NSString*)url withSessionId:(NSString*)sessionId;
- (void) sendAction:(NSString*)type withParams:(NSDictionary*)params;

@end
