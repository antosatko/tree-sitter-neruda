{
  "targets": [
    {
      "target_name": "tree_sitter_neruda_binding",
      "include_dirs": [
        "<!(node -p \"require('path').dirname(require.resolve('tree-sitter-cli'))\")/src",
        "<!(node -p \"require('path').dirname(require.resolve('tree-sitter-cli'))\")/src/parser"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "grammar.js"
      ],
      "cflags_c": [
        "-std=c99"
      ]
    }
  ]
}
