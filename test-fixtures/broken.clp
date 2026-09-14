; Intentionally broken file for testing diagnostics

(defrule missing-arrow
   (person (name ?name))
   (printout t "no arrow here" crlf))

(deftemplate
   (slot name))

(defrule unbalanced
   (person (name ?name)
   =>
   (printout t ?name crlf))
