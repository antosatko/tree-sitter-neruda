module.exports = grammar({
  name: "neruda",

  // Use token() for whitespace to ensure it's not a step in the syntax tree
  extras: ($) => [token(/\s+/), $.comment],

  supertypes: ($) => [],

  // Added some specific conflicts that can cause ambiguity-induced recursion
  // conflicts: ($) => [
  //   [$.identifier_path, $.call_expression],
  //   [$.identifier_path, $.expression],
  //   [$.index_expression, $.scheduler],
  // ],

  rules: {
    source_file: ($) => repeat($.identifier),
    identifier: ($) => /[a-z]+/,
  },
});
