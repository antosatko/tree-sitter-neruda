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
    source_file: ($) => repeat($.top_level_statement),

    top_level_statement: ($) =>
      choice($.scheduler, $.function, $.system, $.component, $.type_definition),

    comment: ($) => token(prec(1, seq("//", /[^\/].*/))),
    docstring: ($) => token(prec(2, seq("///", /.*/))),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    identifier_path: ($) =>
      prec(2, seq($.identifier, repeat(seq("::", $.identifier)))),

    // Grouping literals into a single token where possible
    literal: ($) =>
      choice(
        $.string_literal,
        $.char_literal,
        $.numeric_literal,
        $.float_literal,
        $.array_literal,
        $.tuple_literal,
        $.struct_literal,
        $.identifier_path,
      ),

    string_literal: ($) => token(seq('"', /[^"]*/, '"')),
    char_literal: ($) => token(seq("'", /[^']/, "'")),
    numeric_literal: ($) => token(/[0-9]+/),
    float_literal: ($) => token(/[0-9]+\.[0-9]+/),

    // 1. Array Literal
    array_literal: ($) =>
      seq(
        "[",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        optional(","), // Handles trailing comma safely
        "]",
      ),

    // 2. Tuple Literal
    tuple_literal: ($) =>
      seq(
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        optional(","),
        ")",
      ),

    // 3. Parameter List
    parameter_list: ($) =>
      seq(
        "(",
        optional(seq($.parameter, repeat(seq(",", $.parameter)))),
        optional(","),
        ")",
      ),

    // 4. Struct Type
    struct_literal: ($) =>
      seq(
        "struct",
        "{",
        optional(seq($.named_argument, repeat(seq(",", $.named_argument)))),
        optional(","),
        "}",
      ),

    expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.literal,
      ),

    binary_expression: ($) =>
      prec.left(
        1,
        seq(
          $.expression,
          choice(
            "+",
            "-",
            "*",
            "/",
            "==",
            "!=",
            "<",
            ">",
            "<=",
            ">=",
            "&&",
            "||",
            "=",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
          ),
          $.expression,
        ),
      ),

    unary_expression: ($) => prec.right(2, seq(choice("-", "!"), $.expression)),

    call_expression: ($) =>
      prec(
        3,
        seq(
          $.identifier,
          "(",
          optional(seq($.expression, repeat(seq(",", $.expression)))),
          ")",
        ),
      ),

    member_expression: ($) =>
      prec.left(4, seq($.expression, ".", $.identifier)),

    index_expression: ($) =>
      prec.left(4, seq($.expression, "[", $.expression, "]")),

    statement: ($) =>
      choice(
        $.variable_statement,
        $.expression_statement,
        $.return_statement,
        $.if_statement,
        $.while_statement,
        $.loop_statement,
        $.break_statement,
        $.continue_statement,
      ),

    variable_statement: ($) =>
      seq(
        "var",
        $.identifier,
        optional(seq(":", $.type)),
        optional(seq("=", $.expression)),
        ";",
      ),

    expression_statement: ($) => seq($.expression, ";"),
    return_statement: ($) => seq("return", $.expression, ";"),
    if_statement: ($) =>
      seq(
        "if",
        "(",
        $.expression,
        ")",
        $.block,
        optional(seq("else", $.block)),
      ),
    while_statement: ($) => seq("while", "(", $.expression, ")", $.block),
    loop_statement: ($) => seq("loop", $.block),
    break_statement: ($) => seq("break", ";"),
    continue_statement: ($) => seq("continue", ";"),
    block: ($) => seq("{", repeat($.statement), "}"),

    function: ($) =>
      seq(
        "function",
        $.identifier,
        $.parameter_list,
        optional(seq(":", $.type)),
        $.block,
      ),

    parameter: ($) => seq($.identifier, ":", $.type),

    scheduler: ($) =>
      seq(
        "scheduler",
        $.identifier,
        "{",
        optional(seq("resources", "{", repeat($.expression), "}")),
        optional(seq("systems", "{", repeat($.identifier), "}")),
        optional(seq("init", $.block)),
        "}",
      ),

    system: ($) =>
      seq(
        "system",
        $.identifier,
        $.query,
        optional(seq("before", $.block)),
        $.block,
        optional(seq("after", $.block)),
      ),

    query: ($) =>
      seq("(", optional(seq($.clause, repeat(seq(",", $.clause)))), ")"),
    clause: ($) =>
      choice($.select_clause, $.action_clause, $.restriction_clause),
    select_clause: ($) =>
      seq(
        $.identifier,
        ":",
        $.component_clause,
        repeat(seq("&", $.component_clause)),
      ),
    action_clause: ($) =>
      seq(
        "on",
        $.identifier,
        ":",
        $.component_clause,
        repeat(seq("&", $.component_clause)),
      ),
    restriction_clause: ($) => seq("where", $.expression),
    component_clause: ($) =>
      seq($.identifier_path, optional(seq("as", $.identifier))),
    component: ($) =>
      seq("component", $.identifier, optional(seq("=", $.type)), ";"),
    type_definition: ($) =>
      seq("type", $.identifier, optional(seq("=", $.type)), ";"),

    type: ($) => choice($.identifier_path, $.array_type, $.struct_type),
    array_type: ($) => seq("[", $.type, optional(seq(";", $.literal)), "]"),
    struct_type: ($) =>
      seq(
        "struct",
        "{",
        optional(seq($.parameter, repeat(seq(",", $.parameter)))),
        "}",
      ),
    named_argument: ($) => seq($.identifier, ":", $.expression),
  },
});
