module.exports = grammar({
  name: "neruda",

  extras: ($) => [/\s+/, $.comment, $.docstring],

  supertypes: ($) => [$.statement, $.expression, $.type, $.literal],
  conflicts: ($) => [
    [$.identifier_path, $.call_expression],
    [$.index_expression, $.scheduler],
  ],
  rules: {
    source_file: ($) => repeat($.top_level_statement),

    top_level_statement: ($) =>
      choice($.scheduler, $.function, $.system, $.component, $.type_definition),

    // Comments
    comment: ($) => token(prec(1, seq("//", /[^\/].*/))),
    docstring: ($) => token(prec(2, seq("///", /.*/))),

    // Keywords
    keyword: ($) =>
      choice(
        "scheduler",
        "system",
        "init",
        "struct",
        "component",
        "var",
        "function",
        "return",
        "if",
        "else",
        "loop",
        "while",
        "break",
        "continue",
        "as",
        "mut",
        "type",
        "before",
        "after",
        "where",
        "systems",
        "resources",
        "on",
      ),

    // Identifiers
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Literals
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

    array_literal: ($) =>
      seq("[", repeat(seq($.expression, ",")), optional($.expression), "]"),

    tuple_literal: ($) =>
      seq("(", repeat(seq($.expression, ",")), optional($.expression), ")"),

    struct_literal: ($) =>
      seq(
        "{",
        repeat(seq($.named_argument, ",")),
        optional($.named_argument),
        "}",
      ),

    identifier_path: ($) => seq($.identifier, repeat(seq("::", $.identifier))),

    // Expressions
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
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
          ),
          $.expression,
        ),
      ),

    unary_expression: ($) => prec.right(seq(choice("-", "!"), $.expression)),

    call_expression: ($) =>
      seq(
        $.identifier,
        "(",
        repeat(seq($.expression, ",")),
        optional($.expression),
        ")",
      ),

    member_expression: ($) => seq($.expression, ".", $.identifier),

    index_expression: ($) => seq($.expression, "[", $.expression, "]"),

    // Statements
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

    // Function
    function: ($) =>
      seq(
        "function",
        $.identifier,
        $.parameter_list,
        optional(seq(":", $.type)),
        $.block,
      ),

    parameter_list: ($) =>
      seq("(", repeat(seq($.parameter, ",")), optional($.parameter), ")"),

    parameter: ($) => seq($.identifier, ":", $.type),

    // Scheduler
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

    // System
    system: ($) =>
      seq(
        "system",
        $.identifier,
        $.query,
        optional(seq("before", $.block)),
        $.block,
        optional(seq("after", $.block)),
      ),

    query: ($) => seq("(", repeat(seq($.clause, ",")), optional($.clause), ")"),

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

    // Component
    component: ($) =>
      seq("component", $.identifier, optional(seq("=", $.type)), ";"),

    // Type definition
    type_definition: ($) =>
      seq("type", $.identifier, optional(seq("=", $.type)), ";"),

    // Types
    type: ($) => choice($.identifier_path, $.array_type, $.struct_type),

    array_type: ($) => seq("[", $.type, optional(seq(";", $.literal)), "]"),

    struct_type: ($) =>
      seq(
        "struct",
        "{",
        repeat(seq($.parameter, ",")),
        optional($.parameter),
        "}",
      ),

    named_argument: ($) => seq($.identifier, ":", $.expression),
  },
});
