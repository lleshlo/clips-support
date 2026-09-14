; Sample template library for testing the "clips.includePath" setting.
; Point clips.includePath at this folder (or its parent) to see "sensor"
; resolved for completion/hover even though it lives outside the normal
; workspace scan, or in a directory you've excluded from search.

(deftemplate sensor
   "A sensor reading"
   (slot id (type SYMBOL))
   (slot value (type FLOAT))
   (slot unit (type STRING) (default "celsius")))
