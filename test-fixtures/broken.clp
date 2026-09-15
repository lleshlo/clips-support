; Intentionally broken file for testing diagnostics

(defrule missing-arrow
   (person (name ?name))
   (printout t "no arrow here" crlf))

(deftemplate
   (slot name))

(deftemplate foo
   (slot bar (type STRING) (default "")))

; "bar" below is colored as a resolved slot; "bad" is squiggled as
; undefined for foo (and left uncolored) since foo has no such slot.
(deffacts init
   (foo (bar "foobar"))
   (foo (bar "foobaz") (bad "undefined")))

(defrule unbalanced
   (person (name ?name)
   =>
   (printout t ?name crlf))
