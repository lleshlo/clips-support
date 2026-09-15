// Matches a bare CLIPS symbol/identifier (not strings or parens) — used to
// find the word under the cursor for hover and go-to-definition. Includes
// "$" so multifield-function names like create$/length$ are captured
// whole, and "?" so variable-prefixed usages don't fracture the match.
const WORD_PATTERN = /[A-Za-z0-9_+\-*/.<>=$?]+/;

module.exports = { WORD_PATTERN };
