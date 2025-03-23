/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.setOptions({
  syntax: "proto3",
  java_package: "com.he.backend.ws.msg",
  java_outer_classname: "RequestProtobuf"
})
.addJSON({
  RequestMsg: {
    fields: {
      head: {
        type: "Head",
        id: 1
      },
      body: {
        type: "Body",
        id: 2
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
        type: "string",
        id: 2
      },
      timestamp: {
        type: "int64",
        id: 3
      },
      userId: {
        type: "int64",
        id: 4
      },
      access: {
        type: "string",
        id: 5
      },
      roomId: {
        type: "string",
        id: 6
      }
    }
  },
  Body: {
    fields: {
      data: {
        type: "string",
        id: 2
      },
      extend: {
        type: "string",
        id: 3
      }
    }
  }
});

module.exports = $root;
