:topic: List of Issues

.. Don't change this file.

.. index:: triple: List of Issues; Design Specification; ALBG Template
   :name: dsnps-listofissues

.. index:: triple: Issues; Design Specification; ALBG Template
   :name: dsnps-issues

:raw-latex:`\listofissues`

.. only:: html

   .. _todolist:

   List of Issues
   ##############

.. todolist::

.. ...........................................................................

.. admonition:: Todo:
   :class: attention

   improve table formatting and colspec for |LaTeX|/|PDF|: (1) provide overwrite
   directions for tabular and longtable environments, (2) start with global
   colorization of table header and alternately colored rows

(See template folder below |docsrc| and add content in ``preamble.tex.in``)

.. ...........................................................................

.. admonition:: Todo:
   :class: attention

   consistent font for HTML and |LaTeX|/|PDF|: (1) provide complet font set
   of DejaVu (as standard font) and WenQuanYi (for special unicode glyphs),
   (2) add |CSS|\ 3 fontspec for |HTML|

(See static font and css folder below |docsrc| and provide the new files
``DejaVu.css`` and ``WenQuanYi.css``)

.. ...........................................................................

.. admonition:: Todo:
   :class: attention

   supporting search result scoring: (1) overwrite the ReadTheDocs theme
   score |JavaScript| with a self-provided script, (2) customize that script
   and filter out or low down the result score of special sections

(See static js folder below |docsrc| and add provide a customized |JavaScript|
file as ``scorer.js``)

.. Local variables:
   coding: utf-8
   mode: text
   mode: rst
   End:
   vim: fileencoding=utf-8 filetype=rst :
