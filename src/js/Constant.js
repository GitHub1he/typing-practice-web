/**
 * 
 */
export const MESSAGE_PROTOBUF = `syntax = "proto3";
message Msg {
    Head head = 1;
    Body body = 2;
    Sender sender = 3;
}

message Head {
    int32 msgType = 1;
    int32 msgContentType = 2;
    int64 timestamp = 3;
    int32 statusReport = 4;
    string access = 5;
}

message Body {
    string receiveId = 1;
    string msgContent = 2;
    string extend = 3;
}

message Sender {
    uint32 userId = 1;
    string name = 2;
    string avatar = 3;
    string extend = 4;
}`;
