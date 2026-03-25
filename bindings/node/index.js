try {
  module.exports = require("../build/Release/tree_sitter_neruda_binding");
} catch (error) {
  try {
    module.exports = require("../build/Debug/tree_sitter_neruda_binding");
  } catch (error2) {
    throw new Error("Failed to load binding for tree-sitter-neruda");
  }
}
