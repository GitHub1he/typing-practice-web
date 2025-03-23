/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.setOptions({
  syntax: "proto3",
  java_package: "com.he.backend.ws.protobuf",
  java_outer_classname: "MessageProtobuf"
})
.addJSON({
  Msg: {
    fields: {
      head: {
        type: "Head",
        id: 1
      },
      body: {
        type: "Body",
        id: 2
      },
      sender: {
        type: "Sender",
        id: 3
      }
    }
  },
  Head: {
    fields: {
      msgType: {
        type: "int32",
        id: 1
      },
      msgContentType: {
        type: "int32",
        id: 2
      },
      timestamp: {
        type: "int64",
        id: 3
      },
      statusReport: {
        type: "int32",
        id: 4
      },
      access: {
        type: "string",
        id: 5
      }
    }
  },
  Body: {
    fields: {
      receiveId: {
        type: "string",
        id: 1
      },
      msgContent: {
        type: "string",
        id: 2
      },
      extend: {
        type: "string",
        id: 3
      }
    }
  },
  Sender: {
    fields: {
      userId: {
        type: "uint32",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      avatar: {
        type: "string",
        id: 3
      },
      extend: {
        type: "string",
        id: 4
      }
    }
  }
});

module.exports = $root;
