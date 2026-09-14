; Sample CLIPS file for testing syntax highlighting and linting

(deftemplate person
   (slot name (type STRING))
   (slot age (type INTEGER) (default 0)))

(deffacts starting-facts
   (person (name "Alice") (age 30))
   (person (name "Bob") (age 25)))

(defrule greet-adults
   "Greet people who are 18 or older"
   (person (name ?name) (age ?age&:(>= ?age 18)))
   =>
   (printout t "Hello, " ?name ", you are an adult." crlf))

(defrule greet-minors
   (person (name ?name) (age ?age&:(< ?age 18)))
   =>
   (printout t ?name " is a minor." crlf))

(deffunction square (?x)
   (* ?x ?x))

(defglobal ?*counter* = 0)
