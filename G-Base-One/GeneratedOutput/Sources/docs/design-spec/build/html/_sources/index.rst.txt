:topic: |title| |--| |subtitle|

.. _home:

|title| |--| |subtitle|
=======================

.. include:: docsummary.rsti
.. include:: docpreample.rsti

.. only:: latex

   .. include:: docversions.rsti

:raw-latex:`\cleardoublepage\phantomsection`

.. ...........................................................................

.. toctree::
   :caption: Table of Contents:
   :numbered: 2
   :maxdepth: 4
   :hidden:
   :includehidden:

   pcb
   system-components
   system-integration
   hardware-layout

:raw-latex:`\appendix`

.. toctree::
   :caption: Appendices
   :titlesonly:
   :hidden:

   appendix
   glossary

.. toctree::
   :caption: Lists and References
   :titlesonly:
   :hidden:

   acronyms
   indexlol
   indexlot
   indexlof
   indexloe
   indexlod
   indexloi
   bibliography

.. ...........................................................................

.. only:: not latex

   .. include:: docversions.rsti

.. Local variables:
   coding: utf-8
   mode: text
   mode: rst
   End:
   vim: fileencoding=utf-8 filetype=rst :
