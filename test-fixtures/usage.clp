; Uses the "vehicle" template defined in templates.clp. Try:
;   - Ctrl+Space after "(vehicle " to see slot completions (make, model, ...)
;   - Ctrl+Space inside "(ma|" to see slot-name completion while typing
;   - Hovering over "vehicle" below to see its slots and facets

(defrule flag-old-vehicles
   (vehicle (make ?make) (year ?year&:(< ?year 2000)))
   =>
   (printout t ?make " is an old vehicle." crlf))
