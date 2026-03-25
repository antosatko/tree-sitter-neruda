; --- Keywords ---
[
  "scheduler"
  "system"
  "init"
  "struct"
  "component"
  "var"
  "function"
  "return"
  "if"
  "else"
  "loop"
  "while"
  "break"
  "continue"
  "as"
  "type"
  "before"
  "after"
  "where"
  "systems"
  "resources"
  "on"
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

[ "." "," ":" ";" "::" ] @punctuation.delimiter

; --- Operators ---
[
  "+" "-" "*" "/" "==" "!=" "<" ">" "<=" ">="
  "&&" "||" "=" "!" "&" "+=" "-=" "*=" "/=" "%="
] @operator

; --- Definitions ---
; These highlight the names of things you define
(function (identifier) @function)
(system (identifier) @function)
(scheduler (identifier) @type)
(component (identifier) @type)
(type_definition (identifier) @type)
(variable_statement (identifier) @variable)

; --- Function Calls & Expressions ---
(call_expression (identifier) @function)
(member_expression (identifier) @property)
(index_expression) @variable

; --- Parameters & Types ---
(parameter (identifier) @variable.parameter)
(type (identifier_path) @type)
(array_type) @type
(struct_type) @type

; --- Literals ---
(numeric_literal) @number
(float_literal) @number
(string_literal) @string
(char_literal) @string
(array_literal) @punctuation.bracket
(struct_literal) @punctuation.bracket

; --- Comments ---
(comment) @comment
; (docstring) @comment.documentation

; --- Fallback ---
; This covers any identifier not caught by the specific rules above
(identifier) @variable
