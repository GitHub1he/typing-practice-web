/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.setOptions({
  syntax: "proto3",
  java_package: "com.he.backend.ws.protobuf",
  java_outer_classname: "ResponseProtobuf"
})
.addJSON({
  RespMsg: {
    fields: {
      success: {
        type: "bool",
        id: 1
      },
      code: {
        type: "string",
        id: 2
      },
      msg: {
        type: "string",
        id: 3
      },
      total: {
        type: "int32",
        id: 4
      },
      data: {
        type: "string",
        id: 5
      }
    }
  }
});

module.exports = $root;
