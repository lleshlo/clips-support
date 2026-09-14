// Matches a bare CLIPS symbol/identifier (not variables, strings, or
// parens) — used to find the word under the cursor for hover and
// go-to-definition.
const WORD_PATTERN = /[A-Za-z0-9_+\-*/.<>=]+/;

module.exports = { WORD_PATTERN };
