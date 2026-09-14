; Template definitions used by usage.clp, to exercise cross-file template
; resolution: open usage.clp in the Extension Development Host and check
; that completion/hover for "vehicle" and its slots works even though
; vehicle is defined in this separate file.

(deftemplate vehicle
   "A vehicle fact"
   (slot make (type SYMBOL) (allowed-symbols toyota honda ford))
   (slot model (type STRING))
   (slot year (type INTEGER))
   (multislot features (type SYMBOL) (cardinality 0 10)))
