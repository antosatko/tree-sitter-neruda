module.exports = grammar({
  name: "neruda",

  extras: ($) => [/\s+/, $.comment, $.docstring, $.tl_docstring],

  // Resolves the "Struct vs Block" ambiguity and Type vs Path ambiguity found in your ruparse logic
  conflicts: ($) => [
    [$.expression, $.struct_literal],
    [$.type, $.component_request],
    [$.query_content],
  ],

  rules: {
    source_file: ($) => repeat($.top_level_statement),

    top_level_statement: ($) =>
      choice($.scheduler, $.function, $.system, $.component, $.type_definition),

    // --- Lexical (Matching your lexer patterns) ---
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // In your Rust code: "//" then not "!" or "/"
    comment: ($) => token(seq("//", /[^!/][^\n]*/)),
    docstring: ($) => token(seq("///", /[^\n]*/)),
    tl_docstring: ($) => token(seq("//!", /[^\n]*/)),

    string_literal: ($) => token(seq('"', /([^"\\]|\\.)*/, '"')),
    numeric_literal: ($) => token(/[0-9]+/),
    float_literal: ($) => token(/[0-9]+\.[0-9]+/),

    // matches ident_path logic in grammar.rs
    identifier_path: ($) =>
      prec.left(1, seq($.identifier, repeat(seq("::", $.identifier)))),

    // --- Expressions (Matching your operator precedence) ---
    expression: ($) =>
      choice(
        $.identifier_path,
        $.literal,
        $.unary_expression,
        $.binary_expression,
        $.call_expression,
        $.member_expression,
        $.ref_cast_expression,
      ),

    literal: ($) =>
      choice(
        $.string_literal,
        $.numeric_literal,
        $.float_literal,
        $.struct_literal,
        $.array_literal,
      ),

    unary_expression: ($) => prec.right(4, seq(choice("-", "!"), $.expression)),

    binary_expression: ($) =>
      prec.left(
        2,
        seq(
          $.expression,
          choice(
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "=",
            "==",
            "!=",
            "<",
            ">",
            "<=",
            ">=",
            "&&",
            "||",
            "+",
            "-",
            "*",
            "/",
            "%",
          ),
          $.expression,
        ),
      ),

    call_expression: ($) =>
      prec.left(5, seq($.expression, "(", optional($.expression_list), ")")),
    member_expression: ($) =>
      prec.left(5, seq($.expression, ".", $.identifier)),

    // matches your .&, .&&, .* tails
    ref_cast_expression: ($) =>
      prec.left(5, seq($.expression, ".", choice("&", "&&", "*"))),

    expression_list: ($) =>
      seq($.expression, repeat(seq(",", $.expression)), optional(",")),

    // --- Code Bodies (Matching your 'code_body' and 'code_expr' nodes) ---
    code_body: ($) =>
      choice(
        $.block,
        seq("=>", $.statement), // matches your code_expr: => expr_stmt logic
      ),

    block: ($) => seq("{", repeat($.statement), "}"),

    statement: ($) =>
      choice(
        $.variable_statement,
        $.return_statement,
        $.if_statement,
        $.while_statement,
        $.loop_statement,
        seq($.expression, optional(";")), // catch-all expression statement
      ),

    variable_statement: ($) =>
      seq(
        "var",
        $.identifier,
        optional(seq(":", $.type)),
        optional(seq("=", $.expression)),
        optional(";"),
      ),

    return_statement: ($) =>
      choice(
        // Use prec.left to ensure the return 'consumes' as much of the
        // following expression as possible, including binary operators.
        prec.left(3, seq("return", $.expression, optional(";"))),

        prec(1, seq("return", optional(";"))),
      ),

    if_statement: ($) =>
      prec.right(
        seq(
          "if",
          $.expression,
          $.code_body,
          repeat(seq("else", "if", $.expression, $.code_body)),
          optional(seq("else", $.code_body)),
        ),
      ),

    while_statement: ($) => seq("while", $.expression, $.code_body),
    loop_statement: ($) => seq("loop", $.code_body),

    // --- Types (Matching your 'type' node) ---
    type: ($) =>
      choice(
        $.identifier_path,
        seq("[", $.type, optional(seq(";", $.numeric_literal)), "]"), // array types
        seq(
          "struct",
          "{",
          repeat(seq($.identifier, ":", $.type, optional(","))),
          "}",
        ),
      ),

    // --- Top Level (Matching scheduler, system, component, type) ---
    scheduler: ($) =>
      seq(
        "scheduler",
        $.identifier,
        "{",
        optional($.resources_block),
        optional($.systems_block),
        optional($.init_block),
        "}",
      ),

    resources_block: ($) => seq("resources", "{", repeat($.expression), "}"),
    systems_block: ($) => seq("systems", "{", repeat($.identifier_path), "}"),
    init_block: ($) => seq("init", $.code_body),

    // The most complex part: System Parameters (matches your 'system' node logic)
    system: ($) =>
      seq(
        "system",
        $.identifier,
        "(",
        optional($.system_params),
        ")",
        optional(seq("before", $.code_body)),
        $.code_body,
        optional(seq("after", $.code_body)),
      ),

    system_params: ($) =>
      seq($.system_param, repeat(seq(",", $.system_param)), optional(",")),

    system_param: ($) =>
      choice(
        $.entity_query, // (e: Position & Velocity)
        $.event_query, // (on e: StopAll)
        seq($.identifier, ":", optional("mut"), $.type), // (count: mut UnitCount)
      ),

    entity_query: ($) => seq(choice($.identifier, "_"), ":", $.query_content),

    event_query: ($) => seq("on", $.identifier, ":", $.identifier_path),

    query_content: ($) =>
      seq(
        $.component_request,
        repeat(seq("&", $.component_request)),
        // Wrap the where clause in prec()
        optional(prec(1, seq(",", "where", $.expression))),
      ),

    component_request: ($) =>
      seq(
        optional("mut"),
        optional("?"), // Matches maybe(token("?")) in your Rust code
        $.identifier_path,
        optional(seq("as", $.identifier)),
      ),

    component: ($) =>
      seq("component", $.identifier, optional(seq("=", $.type)), optional(";")),

    type_definition: ($) =>
      seq("type", $.identifier, optional(seq("=", $.type)), optional(";")),

    function: ($) =>
      seq(
        "function",
        $.identifier,
        "(",
        optional($.function_params),
        ")",
        optional(seq(":", $.type)),
        $.code_body,
      ),

    function_params: ($) =>
      seq($.parameter, repeat(seq(",", $.parameter)), optional(",")),

    parameter: ($) => seq($.identifier, ":", $.type),

    struct_literal: ($) =>
      seq(
        choice($.identifier_path, "struct"),
        "{",
        optional(
          seq($.field_initializer, repeat(seq(",", $.field_initializer))),
        ),
        optional(","),
        "}",
      ),

    field_initializer: ($) => seq($.identifier, ":", $.expression),
    array_literal: ($) => seq("[", optional($.expression_list), "]"),
  },
});
