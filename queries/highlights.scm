; --- Keywords ---
[
  "scheduler"
  "system"
  "init"
  "struct"
  "component"
  "var"
  "function"
  "type"
  "before"
  "after"
  "where"
  "systems"
  "resources"
  "on"
  "as"
  "mut"
] @keyword

; --- Control Flow ---
[
  "if"
  "else"
  "loop"
  "while"
  "break"
  "continue"
  "return"
] @keyword.control

; --- Punctuation & Brackets ---
[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
[ "." "," ":" ";" "::" "=>" ] @punctuation.delimiter

; --- Operators ---
[
  "+" "-" "*" "/" "==" "!=" "<" ">" "<=" ">="
  "&&" "||" "=" "!" "&" "+=" "-=" "*=" "/=" "%="
] @operator

; --- Definitions (Using the actual rule names) ---
(function identifier: (identifier) @function)
(system name: (identifier) @function)
(scheduler identifier: (identifier) @type)
(component identifier: (identifier) @type)
(type_definition identifier: (identifier) @type)
(variable_statement identifier: (identifier) @variable)

; --- ECS Specific Queries ---
; Highlights 'e' in 'e: Position'
(entity_query (identifier) @variable.parameter)

; Highlights the component type 'Position'
(component_request (identifier_path) @type)

; Highlights the 'as P' alias
(component_request (identifier) @variable.parameter)

; --- Function Calls & Expressions ---
(call_expression (expression (identifier_path (identifier) @function)))
(member_expression (identifier) @property)

; --- Types ---
(type (identifier_path) @type)
(parameter (identifier) @variable.parameter)

; --- Literals ---
[
  (numeric_literal)
  (float_literal)
] @number

[
  (string_literal)
  (char_literal)
] @string

; --- Comments ---
(comment) @comment
(docstring) @comment.doc
(tl_docstring) @comment.doc

; --- Fallback ---
(identifier) @variable
