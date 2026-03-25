; Keywords
(keyword) @keyword

; Function definitions
(function) @function
(function . identifier) @function.name

; System definitions
(system) @function
(system . identifier) @function.name

; Scheduler definitions
(scheduler) @function
(scheduler . identifier) @function.name

; Components
(component) @type
(component . identifier) @type.name

; Types
(type_definition) @type
(type_definition . identifier) @type.name

; Variables
(variable_statement) @variable
(variable_statement . identifier) @variable.name

; Identifiers
(identifier) @identifier

; Literals
(numeric_literal) @number
(float_literal) @float
(string_literal) @string
(char_literal) @character

; Operators
(binary_expression operator) @operator
(unary_expression operator) @operator

; Comments
(comment) @comment
(docstring) @comment

; Punctuation
(symbol) @punctuation.delimiter
(symbol) @punctuation.bracket

; Function calls
(call_expression function: (identifier) @function.call)

; Struct literals
(struct_literal) @structure

; Array literals
(array_literal) @array

; Block
(block) @markup.list

; Conditional statements
(if_statement) @conditional
(while_statement) @conditional
(loop_statement) @conditional

; Return statements
(return_statement) @keyword.return

; Control flow
(break_statement) @keyword.return
(continue_statement) @keyword.return

; Field access
(member_expression) @method

; Indexing
(index_expression) @method

; Type annotations
(parameter) @parameter
(type) @type

; Documentation
(docstring) @comment.documentation
