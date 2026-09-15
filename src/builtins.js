// Built-in/reserved CLIPS functions, organized to match the categories used
// by the CLIPS Basic Programming Guide (v6.4.2) chapter on predefined
// system functions. Each entry's description is a concise, one-sentence
// summary of that function's documented behavior — not verbatim manual
// text, but consistent with it.
//
// Scope is the stable "core" function set (arithmetic, string, multifield,
// I/O, flow-control, predicate, fact/instance manipulation, misc). COOL
// (object-system) introspection functions and rarely-used engine/debugging
// functions are intentionally out of scope for now — see the roadmap in
// README.md.

const CATEGORIES = {
  ARITHMETIC: 'arithmetic',
  COMPARISON: 'comparison',
  LOGICAL: 'logical',
  PREDICATE: 'predicate',
  STRING: 'string',
  MULTIFIELD: 'multifield',
  IO: 'io',
  FLOW_CONTROL: 'flow-control',
  FACT: 'fact',
  MISC: 'misc'
};

const BUILTINS = [
  // --- Arithmetic ---
  { name: '+', category: CATEGORIES.ARITHMETIC, syntax: '(+ <number> <number>+)', description: 'Returns the sum of two or more numbers.' },
  { name: '-', category: CATEGORIES.ARITHMETIC, syntax: '(- <number> <number>+)', description: 'Subtracts each subsequent number from the first.' },
  { name: '*', category: CATEGORIES.ARITHMETIC, syntax: '(* <number> <number>+)', description: 'Returns the product of two or more numbers.' },
  { name: '/', category: CATEGORIES.ARITHMETIC, syntax: '(/ <number> <number>+)', description: 'Divides the first number by each subsequent number.' },
  { name: '**', category: CATEGORIES.ARITHMETIC, syntax: '(** <number> <number>)', description: 'Returns the first number raised to the power of the second.' },
  { name: 'div', category: CATEGORIES.ARITHMETIC, syntax: '(div <number> <number>+)', description: 'Performs integer division, truncating any remainder.' },
  { name: 'abs', category: CATEGORIES.ARITHMETIC, syntax: '(abs <number>)', description: 'Returns the absolute value of a number.' },
  { name: 'min', category: CATEGORIES.ARITHMETIC, syntax: '(min <number>+)', description: 'Returns the smallest of one or more numbers.' },
  { name: 'max', category: CATEGORIES.ARITHMETIC, syntax: '(max <number>+)', description: 'Returns the largest of one or more numbers.' },
  { name: 'mod', category: CATEGORIES.ARITHMETIC, syntax: '(mod <number> <number>)', description: 'Returns the remainder of dividing the first number by the second.' },
  { name: 'round', category: CATEGORIES.ARITHMETIC, syntax: '(round <number>)', description: 'Rounds a number to the nearest integer.' },
  { name: 'integer', category: CATEGORIES.ARITHMETIC, syntax: '(integer <number>)', description: 'Converts a number to an integer by truncating any fractional part.' },
  { name: 'float', category: CATEGORIES.ARITHMETIC, syntax: '(float <number>)', description: 'Converts a number to a floating-point value.' },
  { name: 'sqrt', category: CATEGORIES.ARITHMETIC, syntax: '(sqrt <number>)', description: 'Returns the square root of a number.' },
  { name: 'exp', category: CATEGORIES.ARITHMETIC, syntax: '(exp <number>)', description: 'Returns e raised to the power of the argument.' },
  { name: 'log', category: CATEGORIES.ARITHMETIC, syntax: '(log <number>)', description: 'Returns the natural logarithm of a number.' },
  { name: 'log10', category: CATEGORIES.ARITHMETIC, syntax: '(log10 <number>)', description: 'Returns the base-10 logarithm of a number.' },
  { name: 'pi', category: CATEGORIES.ARITHMETIC, syntax: '(pi)', description: 'Returns the value of π.' },
  { name: 'sin', category: CATEGORIES.ARITHMETIC, syntax: '(sin <number>)', description: 'Returns the sine of an angle given in radians.' },
  { name: 'cos', category: CATEGORIES.ARITHMETIC, syntax: '(cos <number>)', description: 'Returns the cosine of an angle given in radians.' },
  { name: 'tan', category: CATEGORIES.ARITHMETIC, syntax: '(tan <number>)', description: 'Returns the tangent of an angle given in radians.' },
  { name: 'asin', category: CATEGORIES.ARITHMETIC, syntax: '(asin <number>)', description: 'Returns the arcsine, in radians, of a number.' },
  { name: 'acos', category: CATEGORIES.ARITHMETIC, syntax: '(acos <number>)', description: 'Returns the arccosine, in radians, of a number.' },
  { name: 'atan', category: CATEGORIES.ARITHMETIC, syntax: '(atan <number>)', description: 'Returns the arctangent, in radians, of a number.' },
  { name: 'atan2', category: CATEGORIES.ARITHMETIC, syntax: '(atan2 <number> <number>)', description: 'Returns the arctangent, in radians, of the first number divided by the second.' },
  { name: 'sinh', category: CATEGORIES.ARITHMETIC, syntax: '(sinh <number>)', description: 'Returns the hyperbolic sine of a number.' },
  { name: 'cosh', category: CATEGORIES.ARITHMETIC, syntax: '(cosh <number>)', description: 'Returns the hyperbolic cosine of a number.' },
  { name: 'tanh', category: CATEGORIES.ARITHMETIC, syntax: '(tanh <number>)', description: 'Returns the hyperbolic tangent of a number.' },
  { name: 'asinh', category: CATEGORIES.ARITHMETIC, syntax: '(asinh <number>)', description: 'Returns the inverse hyperbolic sine of a number.' },
  { name: 'acosh', category: CATEGORIES.ARITHMETIC, syntax: '(acosh <number>)', description: 'Returns the inverse hyperbolic cosine of a number.' },
  { name: 'atanh', category: CATEGORIES.ARITHMETIC, syntax: '(atanh <number>)', description: 'Returns the inverse hyperbolic tangent of a number.' },
  { name: 'deg-rad', category: CATEGORIES.ARITHMETIC, syntax: '(deg-rad <number>)', description: 'Converts an angle in degrees to radians.' },
  { name: 'rad-deg', category: CATEGORIES.ARITHMETIC, syntax: '(rad-deg <number>)', description: 'Converts an angle in radians to degrees.' },
  { name: 'deg-grad', category: CATEGORIES.ARITHMETIC, syntax: '(deg-grad <number>)', description: 'Converts an angle in degrees to gradians.' },
  { name: 'grad-deg', category: CATEGORIES.ARITHMETIC, syntax: '(grad-deg <number>)', description: 'Converts an angle in gradians to degrees.' },

  // --- Comparison ---
  { name: '=', category: CATEGORIES.COMPARISON, syntax: '(= <number> <number>+)', description: 'Returns TRUE if all of its numeric arguments are equal.' },
  { name: '<>', category: CATEGORIES.COMPARISON, syntax: '(<> <number> <number>+)', description: 'Returns TRUE if all of its numeric arguments are different.' },
  { name: '>', category: CATEGORIES.COMPARISON, syntax: '(> <number> <number>+)', description: 'Returns TRUE if each numeric argument is greater than the one that follows it.' },
  { name: '>=', category: CATEGORIES.COMPARISON, syntax: '(>= <number> <number>+)', description: 'Returns TRUE if each numeric argument is greater than or equal to the one that follows it.' },
  { name: '<', category: CATEGORIES.COMPARISON, syntax: '(< <number> <number>+)', description: 'Returns TRUE if each numeric argument is less than the one that follows it.' },
  { name: '<=', category: CATEGORIES.COMPARISON, syntax: '(<= <number> <number>+)', description: 'Returns TRUE if each numeric argument is less than or equal to the one that follows it.' },
  { name: 'eq', category: CATEGORIES.COMPARISON, syntax: '(eq <expression> <expression>+)', description: 'Returns TRUE if all of its arguments are identical in both type and value.' },
  { name: 'neq', category: CATEGORIES.COMPARISON, syntax: '(neq <expression> <expression>+)', description: 'Returns TRUE if any two of its arguments differ in type or value.' },

  // --- Logical ---
  { name: 'and', category: CATEGORIES.LOGICAL, syntax: '(and <expression>+)', description: 'Returns TRUE if all of its arguments evaluate to a non-FALSE value.' },
  { name: 'or', category: CATEGORIES.LOGICAL, syntax: '(or <expression>+)', description: 'Returns TRUE if any of its arguments evaluate to a non-FALSE value.' },
  { name: 'not', category: CATEGORIES.LOGICAL, syntax: '(not <expression>)', description: 'Returns TRUE if its argument evaluates to FALSE, and FALSE otherwise.' },
  { name: 'test', category: CATEGORIES.LOGICAL, syntax: '(test <expression>)', description: 'A conditional element that matches only if the expression evaluates to a non-FALSE value.' },
  { name: 'exists', category: CATEGORIES.LOGICAL, syntax: '(exists <conditional-element>+)', description: 'A conditional element that is satisfied if at least one match exists for the given patterns.' },
  { name: 'forall', category: CATEGORIES.LOGICAL, syntax: '(forall <conditional-element> <conditional-element>+)', description: 'A conditional element that is satisfied if every match of the first pattern also satisfies the remaining patterns.' },
  { name: 'logical', category: CATEGORIES.LOGICAL, syntax: '(logical <conditional-element>+)', description: 'Marks patterns whose matching facts become logical dependencies of any facts asserted on the rule\'s right-hand side.' },

  // --- Predicate / type-check ---
  { name: 'numberp', category: CATEGORIES.PREDICATE, syntax: '(numberp <expression>)', description: 'Returns TRUE for integers and floats.' },
  { name: 'integerp', category: CATEGORIES.PREDICATE, syntax: '(integerp <expression>)', description: 'Returns TRUE for integers.' },
  { name: 'floatp', category: CATEGORIES.PREDICATE, syntax: '(floatp <expression>)', description: 'Returns TRUE for floats.' },
  { name: 'stringp', category: CATEGORIES.PREDICATE, syntax: '(stringp <expression>)', description: 'Returns TRUE for strings.' },
  { name: 'symbolp', category: CATEGORIES.PREDICATE, syntax: '(symbolp <expression>)', description: 'Returns TRUE for symbols.' },
  { name: 'lexemep', category: CATEGORIES.PREDICATE, syntax: '(lexemep <expression>)', description: 'Returns TRUE for symbols and strings.' },
  { name: 'multifieldp', category: CATEGORIES.PREDICATE, syntax: '(multifieldp <expression>)', description: 'Returns TRUE for multifield values.' },
  { name: 'pointerp', category: CATEGORIES.PREDICATE, syntax: '(pointerp <expression>)', description: 'Returns TRUE for external addresses.' },
  { name: 'factp', category: CATEGORIES.PREDICATE, syntax: '(factp <expression>)', description: 'Returns TRUE if the argument is a fact index or fact address of an existing fact.' },
  { name: 'instancep', category: CATEGORIES.PREDICATE, syntax: '(instancep <expression>)', description: 'Returns TRUE for instance addresses.' },
  { name: 'instance-namep', category: CATEGORIES.PREDICATE, syntax: '(instance-namep <expression>)', description: 'Returns TRUE for instance names.' },
  { name: 'instance-addressp', category: CATEGORIES.PREDICATE, syntax: '(instance-addressp <expression>)', description: 'Returns TRUE for instance addresses.' },
  { name: 'evenp', category: CATEGORIES.PREDICATE, syntax: '(evenp <integer>)', description: 'Returns TRUE for even numbers.' },
  { name: 'oddp', category: CATEGORIES.PREDICATE, syntax: '(oddp <integer>)', description: 'Returns TRUE for odd numbers.' },

  // --- String ---
  { name: 'str-cat', category: CATEGORIES.STRING, syntax: '(str-cat <expression>+)', description: 'Concatenates its arguments together into a single string.' },
  { name: 'sym-cat', category: CATEGORIES.STRING, syntax: '(sym-cat <expression>+)', description: 'Concatenates its arguments together into a single symbol.' },
  { name: 'str-compare', category: CATEGORIES.STRING, syntax: '(str-compare <string-1> <string-2> [<max-length>])', description: 'Compares two strings or symbols character by character, returning a negative, zero, or positive integer.' },
  { name: 'str-index', category: CATEGORIES.STRING, syntax: '(str-index <substring> <string>)', description: 'Returns the starting position of the first occurrence of a substring within a string, or FALSE if not found.' },
  { name: 'str-length', category: CATEGORIES.STRING, syntax: '(str-length <string>)', description: 'Returns the number of characters in a string or symbol.' },
  { name: 'sub-string', category: CATEGORIES.STRING, syntax: '(sub-string <begin> <end> <string>)', description: 'Returns the substring between the given start and end character positions.' },
  { name: 'upcase', category: CATEGORIES.STRING, syntax: '(upcase <string-or-symbol>)', description: 'Converts all lowercase characters in a string or symbol to uppercase.' },
  { name: 'lowcase', category: CATEGORIES.STRING, syntax: '(lowcase <string-or-symbol>)', description: 'Converts all uppercase characters in a string or symbol to lowercase.' },
  { name: 'string-to-field', category: CATEGORIES.STRING, syntax: '(string-to-field <string>)', description: 'Parses a string and returns the single field value (symbol, string, or number) it represents.' },

  // --- Multifield ---
  { name: 'create$', category: CATEGORIES.MULTIFIELD, syntax: '(create$ <expression>*)', description: 'Appends its arguments together to create a new multifield value.' },
  { name: 'length$', category: CATEGORIES.MULTIFIELD, syntax: '(length$ <multifield-expression>)', description: 'Returns the number of fields in a multifield value.' },
  { name: 'nth$', category: CATEGORIES.MULTIFIELD, syntax: '(nth$ <index> <multifield-expression>)', description: 'Returns the field at the given position (1-based) of a multifield value.' },
  { name: 'first$', category: CATEGORIES.MULTIFIELD, syntax: '(first$ <multifield-expression>)', description: 'Returns a one-field multifield value containing the first field of its argument.' },
  { name: 'rest$', category: CATEGORIES.MULTIFIELD, syntax: '(rest$ <multifield-expression>)', description: 'Returns a multifield value containing all but the first field of its argument.' },
  { name: 'subseq$', category: CATEGORIES.MULTIFIELD, syntax: '(subseq$ <multifield-expression> <begin> <end>)', description: 'Returns the fields of a multifield value between the given start and end positions, inclusive.' },
  { name: 'delete$', category: CATEGORIES.MULTIFIELD, syntax: '(delete$ <multifield-expression> <begin> <end>)', description: 'Returns a copy of a multifield value with the fields between the given positions removed.' },
  { name: 'delete-member$', category: CATEGORIES.MULTIFIELD, syntax: '(delete-member$ <multifield-expression> <value-or-multifield>+)', description: 'Returns a copy of a multifield value with all fields matching the given value(s) removed.' },
  { name: 'insert$', category: CATEGORIES.MULTIFIELD, syntax: '(insert$ <multifield-expression> <index> <value>+)', description: 'Returns a copy of a multifield value with the given value(s) inserted at the specified position.' },
  { name: 'replace$', category: CATEGORIES.MULTIFIELD, syntax: '(replace$ <multifield-expression> <begin> <end> <value>+)', description: 'Returns a copy of a multifield value with the fields between the given positions replaced by new value(s).' },
  { name: 'replace-member$', category: CATEGORIES.MULTIFIELD, syntax: '(replace-member$ <multifield-expression> <replacement> <value-or-multifield>+)', description: 'Returns a copy of a multifield value with every field matching the given value(s) replaced.' },
  { name: 'member$', category: CATEGORIES.MULTIFIELD, syntax: '(member$ <value> <multifield-expression>)', description: 'Returns the position of a value within a multifield value, or FALSE if it is not present.' },
  { name: 'subsetp', category: CATEGORIES.MULTIFIELD, syntax: '(subsetp <multifield-1> <multifield-2>)', description: 'Returns TRUE if every field in the first multifield value is also present in the second.' },
  { name: 'explode$', category: CATEGORIES.MULTIFIELD, syntax: '(explode$ <string>)', description: 'Constructs a multifield value from a string, using each field in the string as a field of the result.' },
  { name: 'implode$', category: CATEGORIES.MULTIFIELD, syntax: '(implode$ <multifield-expression>)', description: 'Constructs a string by concatenating the fields of a multifield value, separated by spaces.' },
  { name: 'sort', category: CATEGORIES.MULTIFIELD, syntax: '(sort <comparison-function> <expression>*)', description: 'Sorts its arguments into a multifield value using the given comparison function.' },

  // --- I/O ---
  { name: 'printout', category: CATEGORIES.IO, syntax: '(printout <logical-name> <expression>*)', description: 'Prints each expression to the device attached to the given logical name (use t for standard output); crlf forces a newline.' },
  { name: 'format', category: CATEGORIES.IO, syntax: '(format <logical-name> <format-string> <expression>*)', description: 'Prints its arguments to the given logical name using printf-style format directives (e.g. ~n, ~d).' },
  { name: 'read', category: CATEGORIES.IO, syntax: '(read [<logical-name>])', description: 'Reads and returns a single token (number, symbol, or string) from the given input source.' },
  { name: 'readline', category: CATEGORIES.IO, syntax: '(readline [<logical-name>])', description: 'Reads and returns an entire line of input as a string.' },
  { name: 'open', category: CATEGORIES.IO, syntax: '(open <file-name> <logical-name> [<mode>])', description: 'Opens a file and associates it with a logical name for subsequent I/O.' },
  { name: 'close', category: CATEGORIES.IO, syntax: '(close [<logical-name>])', description: 'Closes the file associated with the given logical name (or all open files, if none is given).' },
  { name: 'flush', category: CATEGORIES.IO, syntax: '(flush [<logical-name>])', description: 'Flushes buffered output for the given logical name (or all open files, if none is given).' },
  { name: 'remove', category: CATEGORIES.IO, syntax: '(remove <file-name>)', description: 'Deletes the specified file from disk.' },
  { name: 'rename', category: CATEGORIES.IO, syntax: '(rename <old-file-name> <new-file-name>)', description: 'Renames a file on disk.' },
  { name: 'get-char', category: CATEGORIES.IO, syntax: '(get-char [<logical-name>])', description: 'Reads and returns a single character of input as its integer character code.' },
  { name: 'put-char', category: CATEGORIES.IO, syntax: '(put-char <logical-name> <integer>)', description: 'Writes a single character, given as its integer character code, to the given logical name.' },

  // --- Flow of control ---
  { name: 'if', category: CATEGORIES.FLOW_CONTROL, syntax: '(if <expression> then <action>* [else <action>*])', description: 'Evaluates the condition and executes the "then" actions if it is non-FALSE, otherwise the "else" actions.' },
  { name: 'while', category: CATEGORIES.FLOW_CONTROL, syntax: '(while <expression> do <action>*)', description: 'Repeatedly executes its actions as long as the condition evaluates to a non-FALSE value.' },
  { name: 'loop-for-count', category: CATEGORIES.FLOW_CONTROL, syntax: '(loop-for-count (<var> [<start>] <end>) do <action>*)', description: 'Executes its actions once for each integer from the start value (default 1) to the end value.' },
  { name: 'progn', category: CATEGORIES.FLOW_CONTROL, syntax: '(progn <expression>*)', description: 'Evaluates each expression in sequence and returns the value of the last one.' },
  { name: 'progn$', category: CATEGORIES.FLOW_CONTROL, syntax: '(progn$ (<var> <multifield-expression>) <action>*)', description: 'Executes its actions once for each field of a multifield value, binding the field (and optionally its index) to a variable.' },
  { name: 'bind', category: CATEGORIES.FLOW_CONTROL, syntax: '(bind <variable> <expression>*)', description: 'Assigns a value (or, given several expressions, a multifield value) to a variable and returns the value assigned.' },
  { name: 'return', category: CATEGORIES.FLOW_CONTROL, syntax: '(return [<expression>])', description: 'Immediately exits the enclosing deffunction or procedural context, optionally returning a value.' },
  { name: 'break', category: CATEGORIES.FLOW_CONTROL, syntax: '(break)', description: 'Immediately exits the innermost enclosing loop (while, loop-for-count, or progn$).' },
  { name: 'switch', category: CATEGORIES.FLOW_CONTROL, syntax: '(switch <expression> (case <value> then <action>*)* [(default <action>*)])', description: 'Evaluates the expression and executes the actions of the first matching case (or the default, if none match).' },
  { name: 'case', category: CATEGORIES.FLOW_CONTROL, syntax: '(case <value> then <action>*)', description: 'A clause within switch whose actions run if its value matches the switch expression.' },
  { name: 'default', category: CATEGORIES.FLOW_CONTROL, syntax: '(default <action>*)', description: 'The clause within switch whose actions run when no case value matches.' },

  // --- Fact / instance manipulation ---
  { name: 'assert', category: CATEGORIES.FACT, syntax: '(assert <fact>+)', description: 'Adds one or more facts to the fact list.' },
  { name: 'retract', category: CATEGORIES.FACT, syntax: '(retract <fact-index-or-address>+)', description: 'Removes one or more facts from the fact list.' },
  { name: 'modify', category: CATEGORIES.FACT, syntax: '(modify <fact-index-or-address> (<slot-name> <value>*)+)', description: 'Replaces one or more slot values of a deftemplate fact, retracting and re-asserting it.' },
  { name: 'duplicate', category: CATEGORIES.FACT, syntax: '(duplicate <fact-index-or-address> (<slot-name> <value>*)*)', description: 'Asserts a copy of a deftemplate fact, optionally with some slot values changed.' },
  { name: 'modify-instance', category: CATEGORIES.FACT, syntax: '(modify-instance <instance> (<slot-name> <value>*)+)', description: 'Replaces one or more slot values of an instance, sending the appropriate put- message(s).' },
  { name: 'duplicate-instance', category: CATEGORIES.FACT, syntax: '(duplicate-instance <instance> [(to <new-name>)] (<slot-name> <value>*)*)', description: 'Creates a new instance as a copy of an existing one, optionally with some slot values changed.' },
  { name: 'make-instance', category: CATEGORIES.FACT, syntax: '(make-instance <name-or-gensym> of <class> (<slot-name> <value>*)*)', description: 'Creates a new instance of a class with the given slot values.' },
  { name: 'unmake-instance', category: CATEGORIES.FACT, syntax: '(unmake-instance <instance>+)', description: 'Deletes one or more instances.' },
  { name: 'send', category: CATEGORIES.FACT, syntax: '(send <instance> <message-name> <argument>*)', description: 'Sends a message to an instance, invoking its message-handler(s) for that message.' },

  // --- Miscellaneous ---
  { name: 'gensym*', category: CATEGORIES.MISC, syntax: '(gensym*)', description: 'Generates a symbol guaranteed not to collide with any existing symbol, fact, or instance name.' },
  { name: 'random', category: CATEGORIES.MISC, syntax: '(random [<begin> <end>])', description: 'Returns a random integer, optionally bounded between the given begin and end values, inclusive.' },
  { name: 'seed', category: CATEGORIES.MISC, syntax: '(seed <integer>)', description: 'Seeds the random number generator.' },
  { name: 'time', category: CATEGORIES.MISC, syntax: '(time)', description: 'Returns a float representing the number of seconds elapsed since a fixed system reference time.' },
  { name: 'eval', category: CATEGORIES.MISC, syntax: '(eval <string-or-symbol>)', description: 'Parses and evaluates a string or symbol as a CLIPS expression, returning its result.' },
  { name: 'build', category: CATEGORIES.MISC, syntax: '(build <string-or-symbol>)', description: 'Parses and defines a construct (e.g. a defrule or deftemplate) from a string.' }
];

const BY_NAME = new Map(BUILTINS.map((entry) => [entry.name, entry]));

function getBuiltin(name) {
  return BY_NAME.get(name);
}

module.exports = { BUILTINS, CATEGORIES, getBuiltin };
