# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))

import sphinx
import semver
import git
import sys
import os

logcfg = sphinx.util.logging.getLogger(__name__)
on_rtd = os.environ.get('READTHEDOCS', None) == 'True'
on_windows = sys.platform.startswith('win')

if "DOCSRC" not in os.environ:
    DOCSRC = os.path.abspath(os.getcwd())
else:
    DOCSRC = os.path.abspath(os.environ["DOCSRC"])


# -- Project information -----------------------------------------------------

docstat = 'preliminary (:emphasis:`some mature, much in progress`)'
docnumb = 'GfS'
doctype = 'Design Specification'
project = 'EH-Türwächter nextGen'
author = 'alpha-board GmbH'
publisher = 'alpha-board GmbH'
contactaddr = 'Berlin, Deutschland'
contactemail = 'info@alpha-board.de'
copyright = '2023‒2024 ' + publisher #+ ' and individual contributors.'
category = 'Specification'
about = doctype + ' of the ' + project + '.'
keywords = docnumb + ',' + doctype + ',' + project

# Define basic strings that will be used in the dictionary of external sites.
rtds_base = 'https://docs.alpha-board.de/docs/XXX'
rtds_slug = 'alpha-board-template-board-design-specification'
rtds_name = 'ECAD ' + project + ' ' + doctype
sp_base = 'https://alphaboard.sharepoint.com/'
sp_team = 'teams/alpha-board-XXX/'
sp_docs = 'Shared Documents/'

if on_rtd:
    git_describe = ('--dirty=+RTDS', '--broken=+broken')
else:
    git_describe = ('--dirty=+dirty', '--broken=+broken')

try:
    repo = git.Repo(search_parent_directories=True)
    semv = semver.VersionInfo.parse(repo.git.describe(git_describe))
    sha1 = repo.head.object.hexsha.lower()
except:
    # fallback to unknown version / release
    semv = semver.VersionInfo.parse('0.0.0-invalid+unknown')
    sha1 = '0000000000000000000000000000000000000000'

try:
    # The short SHA1 for identification
    identify = repo.git.rev_parse(sha1, short=8)
except:
    # Fallback if no git
    identify = 'not in version control'

# The short X.Y.Z version
version = str(semv.finalize_version())
genvers = str(semv.major)

# The full version, including alpha/beta/rc tags
release = str(semv)

# Combined document title and subtitle
title = project + ' ' + genvers + '.x'
subtitle = doctype

# Single target file names
namespace = 'com.alpha-board.doc.spec.XXX.' + version + '.'
basename = 'design-spec-XXX'

logcfg.info(project + ' ' + release, color='yellow')


# -- General configuration ---------------------------------------------------

# If your documentation needs a minimal Sphinx version, state it here.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-needs_sphinx
#
needs_sphinx = '3.3.1'
build_sphinx = sphinx.__version__

extensions = [
  "sphinx.ext.autosectionlabel",
  "sphinx.ext.todo",
  "sphinx.ext.graphviz",
  "sphinx.ext.extlinks",
  "sphinxcontrib.bibtex",
  "sphinxcontrib.blockdiag",
  "sphinxcontrib.spelling",
  "crate.sphinx.csv",
  "sphinxcontrib.rsvgconverter",
]


# -- Specific configuration --------------------------------------------------

path_extra = os.path.join(DOCSRC, '_extra')
logcfg.info('EXTRAS     path is: "{}"'.format(path_extra), color='green')

path_images = os.path.join(DOCSRC, '_images')
logcfg.info('IMAGES     path is: "{}"'.format(path_images), color='green')

path_templates = os.path.join(DOCSRC, '_templates')
logcfg.info('TEMPLATE   path is: "{}"'.format(path_templates), color='green')

path_dictionaries = os.path.join(path_templates, 'share', 'dicts')
logcfg.info('DICTS      path is: "{}"'.format(path_dictionaries), color='green')

path_static = os.path.join(DOCSRC, '_static')
logcfg.info('STATIC     path is: "{}"'.format(path_static), color='green')

path_dejavu = os.path.join(path_static, 'fonts', 'DejaVu')
logcfg.info('DejaVu     path is: "{}"'.format(path_dejavu), color='green')

path_wenquanyi = os.path.join(path_static, 'fonts', 'WenQuanYi')
logcfg.info('WenQuanYi  path is: "{}"'.format(path_wenquanyi), color='green')

path_bibtex = os.path.join(DOCSRC, 'bibliography')
logcfg.info('BibTeX     path is: "{}"'.format(path_bibtex), color='green')


# -- Sphinx Basic Configuration ----------------------------------------------

# Add any paths that contain templates here, relative to this directory.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-templates_path
#
templates_path = ['{}'.format(path_templates)]

# The language for content autogenerated by Sphinx. Refer to documentation
# for a list of supported languages.
#
# This is also used if you do content translation via gettext catalogs.
# Usually you set "language" from the command line for these cases.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#options-for-internationalization
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-language
#
language = 'en'

# The suffix(es) of source filenames.
# You can specify multiple suffix as a list of string:
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-source_suffix
#
# source_suffix = ['.rst', '.md']
source_suffix = {
    '.rst': 'restructuredtext',
}

# The master toctree document.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-master_doc
#
master_doc = 'index'

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-exclude_patterns
#
exclude_patterns = [
  "**/.gitkeep",
]

# A string of reStructuredText that will be included at the beginning of every
# source file that is read.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-rst_prolog
#
rst_prolog = u'''
.. include:: /{docsrc}/docroles.rsti
.. include:: /{docsrc}/docmeta.rsti
.. |CREDITS| replace:: :download:`CREDITS </CREDITS>`
.. |docsrc| replace:: {docsrc}
.. |docstat| replace:: {docstat}
.. |docnumb| replace:: {docnumb}
.. |genvers| replace:: {genvers}
.. |identify| replace:: {identify}
.. |title| replace:: {title}
.. |subtitle| replace:: {subtitle}
.. |publisher| replace:: {publisher}
.. |copyright| replace:: {copyright}
.. |project| replace:: {project}
.. |author| replace:: {author}
.. |about| replace:: {about}
.. |contactaddr| replace:: {contactaddr}
.. |contactemail| replace:: {contactemail}
.. |rtds_name| replace:: {rtds_name}
.. |rtds_name_e| replace:: :emphasis:`{rtds_name}`
.. |rtds_name_s| replace:: :strong:`{rtds_name}`
.. meta::
   :producer: {producer}
   :creator: {creator}
   :publisher: {publisher}
   :subject: {subject}
   :keywords: {keywords}
   :author: {author}
   :copyright: {copyright}
   :docstat: {docstat}
   :docnumb: {docnumb}
   :project: {project}
   :title: {title}
   :subtitle: {subtitle}
   :version: {version}
   :release: {release}
   :identify: {identify}
'''.format(
    docsrc = DOCSRC,
    docstat = docstat,
    docnumb = docnumb,
    genvers = genvers,
    version = version,
    identify = identify,
    release = release,
    title = title,
    subtitle = subtitle,
    copyright = copyright,
    project = project,
    author = author,
    about = about,
    contactaddr = contactaddr,
    contactemail = contactemail,
    producer = 'Sphinx ' + build_sphinx,
    creator = 'Sphinx ' + build_sphinx,
    publisher = publisher,
    subject = about,
    keywords = keywords,
    rtds_name = rtds_name,
)

# A string of reStructuredText that will be included at the end of every source
# file that is read. This is the right place to add substitutions that should be
# available in every file.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-rst_epilog
#
rst_epilog = '''
.. include:: /{docsrc}/docterms.rsti
.. include:: /{docsrc}/docextlnk.rsti
.. include:: /{docsrc}/docunicode.rsti
'''.format(
    docsrc = DOCSRC,
)

# This change will allow us to use bare back-tick notation to let
# Sphinx hunt for a reference, starting with normal "document"
# references such as :ref:, but also including :c: and :cpp: domains
# (potentially) helping with API (doxygen) references simply by using
# `name`
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-primary_domain
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-default_role
#
#primary_domain = 'cpp'
default_role = 'any'

# If true, sectionauthor and moduleauthor directives will be shown in the
# output. They are ignored by default.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-show_authors
#
#show_authors = False
show_authors = True

# The name of the Pygments (syntax highlighting) style to use.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-pygments_style
#
pygments_style = 'sphinx'

# If true, figures, tables and code-blocks are automatically numbered if they
# have a caption. At same time, the numref role is enabled. For now, it works
# only with the HTML builder and LaTeX builder. Default is False.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-numfig
#
numfig = True

# A dictionary mapping 'figure', 'table' and 'code-block' to strings that are
# used for format of figure numbers. Default is to use 'Fig. %s' for 'figure',
# 'Table %s' for 'table' and 'Listing %s' for 'code-block'.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-numfig_format
#
numfig_format = {
    'code-block': 'Listing %s',
    'sections': 'Section %s',
    'figure': 'Figure %s',
    'table': 'Table %s',
}

# The scope of figure numbers, that is, the numfig feature numbers figures in
# which scope. 0 means “whole document”. 1 means “in a section”. Sphinx numbers
# like x.1, x.2, x.3... 2 means “in a subsection”. Sphinx numbers like x.x.1,
# x.x.2, x.x.3..., and so on. Default is 1.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-numfig_secnum_depth
#
numfig_secnum_depth = 1

# Set this option to True if you want all displayed math to be numbered.
# The default is False.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-math_number_all
#
math_number_all = True

# A string used for formatting the labels of references to equations. The
# {number} place-holder stands for the equation number. Example: 'Eq.{number}'
# gets rendered as, for example, Eq.10.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-math_eqref_format
#
math_eqref_format = 'Equastion {number}'

# A User-Agent of Sphinx. It is used for a header on HTTP access
# (ex. linkcheck, intersphinx and so on).
# Default is "Sphinx/X.Y.Z requests/X.Y.Z python/X.Y.Z".
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-user_agent
#
user_agent = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/87.0.4280.88 Safari/537.36'

# If true, Sphinx verifies server certifications. Default is True.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-tls_verify
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-tls_cacerts
#
# tls_verify = True
# tls_verify = False

# some configuration for linkcheck builder
#   noticed that we're getting false-positive link errors on different server,
#   I suspect because it's taking too long for the server to respond so bump
#   up the timeout (default=5) and turn off anchor checks (so only a HEAD
#   request is done - much faster). Leave the ignore commented in case we want
#   to remove different server link checks later...

#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_ignore
#
#linkcheck_ignore = ['http://localhost:\d+/']
linkcheck_ignore = [
    'https://alphaboard.sharepoint.com/',  # Causes 403 Client Error: forbidden
    'http://localhost:\d+/',
]

# The number of times the linkcheck builder will attempt to check a URL before
# declaring it broken. Defaults to 1 attempt.
#
# https://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_retries
#
# linkcheck_retries = 1
linkcheck_retries = 5

# A timeout value, in seconds, for the linkcheck builder. The default is to use
# Python’s global socket timeout.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_timeout
#
linkcheck_timeout = 60

# The number of worker threads to use when checking links.
# Default is 5 threads.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_workers
#
# linkcheck_workers = 5
linkcheck_workers = 10

# True or false, whether to check the validity of #anchors in links.
# Since this requires downloading the whole document, it’s considerably
# slower when enabled. Default is True.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_anchors
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-linkcheck_anchors_ignore
#
#linkcheck_anchors = True
linkcheck_anchors = False


# -- Options for sphinx.ext.autosectionlabel -- Allow reference sections -----
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/autosectionlabel.html
#

# Internally, this extension generates the labels for each section. If same
# section names are used in whole of document, any one is used for a target
# by default. The autosectionlabel_prefix_document configuration variable
# can be used to make headings which appear multiple times but in different
# documents unique.

# True to prefix each section label with the name of the document it is in,
# followed by a colon. For example, index:Introduction for a section called
# Introduction that appears in document index.rst. Useful for avoiding
# ambiguity when the same section heading appears in different documents.
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/autosectionlabel.html#confval-autosectionlabel_prefix_document
#
autosectionlabel_prefix_document = True


# -- Options for sphinx.ext.todo -- Support for todo items -------------------
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/todo.html
#

# If this is True, `todo` and `todoList` produce output, else they produce
# nothing. The default is False.
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/todo.html#confval-todo_include_todos
#
todo_include_todos = True


# -- Options for sphinx.ext.graphviz -- Add Graphviz graphs ------------------
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/graphviz.html
#

# png for Windows&Linux, ggf. svg for Linux
# graphviz_output_format = 'png'


# -- Options for sphinx.ext.extlinks -- Markup to shorten external links -----
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/extlinks.html
#

# This extension is meant to help with the common pattern of having many
# external links that point to URLs on one and the same site, e.g. links
# to bug trackers, version control web interfaces, or simply subpages in
# other websites. It does so by providing aliases to base URLs, so that
# you only need to give the subpage name when creating a link.

# This config value must be a dictionary of external sites, mapping unique
# short alias names to a base URL and a prefix.
#
# https://www.sphinx-doc.org/en/3.x/usage/extensions/extlinks.html#confval-extlinks
#

# todo add the correct folder name for the version history file
#
extlinks = {
    'wikide':       ('https://de.wikipedia.org/wiki/%s', 'German Wikipedia: %s'),
    'wikien':       ('https://en.wikipedia.org/wiki/%s', 'English Wikipedia: %s'),
    'albg.dsfs.html': (
        rtds_base + 'docs/' + rtds_slug + '/en/%s/',
        rtds_name + ' (online): %s'
    ),
    'albg.dsfs.pdf': (
        rtds_base + 'media/pdf/' + rtds_slug + '/%s/' + rtds_slug + '.pdf',
        rtds_name + ' (printable): %s'
    ),
    'albg.sp.v6ite.hw.nuc2pb': (
        sp_base + sp_team + sp_docs + 'Development/Hardware/ALBG Template/%s',
        'alpha-board SharePoint: %s'
    ),
}



# -- Options for sphinxcontrib.bibtex -- Insert BibTeX citations -------------
#
# https://sphinxcontrib-bibtex.readthedocs.io/en/2.1.4/
# https://sphinxcontrib-bibtex.readthedocs.io/en/2.1.4/usage.html#configuration
#

# This setting specifies all bib files used throughout the project, relative to
# the source folder. This configuration is new and mandatory (since 2.0.0).
bibtex_bibfiles = [
    '{}/sphinx.bib'.format(path_bibtex),
    '{}/python.bib'.format(path_bibtex),
]

# Set the encoding of the bibliography files. If no encoding is specified,
# 'utf-8-sig' is assumed.
# bibtex_encoding = 'latin'


# -- Options for sphinxcontrib.blockdiag -- Draw block diagrams --------------
#
# http://blockdiag.com/en/blockdiag/sphinxcontrib.html#configure-sphinx
#

# Fontpath for blockdiag (truetype font), The default is None.
blockdiag_fontpath = '{}/DejaVuSansCondensed.ttf'.format(path_dejavu)

# Fontmap for blockdiag (maps fontfamily name to truetype font).
# The default is None.
# blockdiag_fontmap = '{}/_extensions/blockdiag.fontmap'.format(DOCSRC)

# If this is True, blockdiag generates images with anti-alias filter.
# The default is False.
blockdiag_antialias = True

# If this is True, blockdiag generates images with transparency background.
# The default is False.
blockdiag_transparency = True

# You can specify image format on converting docs to HTML; accepts 'PNG'
# or 'SVG'. The default is 'PNG'.
blockdiag_html_image_format = 'SVG'

# You can specify image format on converting docs to TeX; accepts 'PNG'
# or 'PDF'. The default is 'PNG'.
blockdiag_latex_image_format = 'PDF'

# Enable debug mode of blockdiag.
# The default is False.
# blockdiag_debug = True


# -- Options for sphinxcontrib.spelling -- Spelling Checker ------------------
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/
#

# String specifying the language, as understood by PyEnchant and enchant.
# Defaults to en_US for US English.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#input-options
#
# spelling_lang = 'en_US'

# String specifying a file containing a list of words known to be spelled
# correctly but that do not appear in the language dictionary selected
# by spelling_lang. The file should contain one word per line. Refer to
# the PyEnchant tutorial for details.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#input-options
#
# spelling_word_list_filename = 'spelling_wordlist.txt'
spelling_word_list_filename = [
    '{}/american-english-huge'.format(path_dictionaries),
    '{}/ngerman'.format(path_dictionaries),
    '{}/missing'.format(path_dictionaries),
    '{}/companies'.format(path_dictionaries),
    '{}/electronics'.format(path_dictionaries),
    '{}/proper-nouns'.format(path_dictionaries),
    '{}/missing-dicts'.format(path_templates),
]

# A list of glob-style patterns that should be ignored when checking
# spelling. They are matched against the source file names relative
# to the source directory, using slashes as directory separators on
# all platforms. See Sphinx's exclude_patterns option for more details
# on glob-style patterns.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#input-options
#
spelling_exclude_patterns = [
    'doc*.rsti',
    'index*.rst',
    'bibliography.rst',
    '_autogen/**.rst*',
    # because of strange unicode characters in:
    'system-components/ifs/associations.rst',
    'system-components/ifs/devsens/pinctrl-devsens-pzhf.rst',
]

# Boolean controlling whether suggestions for misspelled words are printed.
# Defaults to False.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#output-options
#
spelling_show_suggestions = True

# Boolean controlling whether the contents of the line containing each
# misspelled word is printed, for more context about the location of
# each word. Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#output-options
#
# spelling_show_whole_line = True

# Boolean controlling whether words that look like package names from PyPI
# are treated as spelled properly. When True, the current list of package
# names is downloaded at the start of the build and used to extend the list
# of known words in the dictionary. Defaults to False.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_pypi_package_names = False

# Boolean controlling whether words that follow the CamelCase conventions
# used for page names in wikis should be treated as spelled properly.
# Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_wiki_words = True

# Boolean controlling treatment of words that appear in all capital letters,
# or all capital letters followed by a lower case s. When True, acronyms are
# assumed to be spelled properly. Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_acronyms = True

# Boolean controlling whether names built in to Python should be treated as
# spelled properly. Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_python_builtins = True

# Boolean controlling whether words that are names of modules found on
# sys.path are treated as spelled properly. Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_importable_modules = True

# Boolean controlling treatment of contributor names extracted from the git
# history as spelled correctly, making it easier to refer to the names in
# acknowledgments. Defaults to True.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_ignore_contributor_names = True

# List of filter classes to be added to the tokenizer that produces words
# to be checked. The classes should be derived from enchant.tokenize.Filter.
# Refer to the PyEnchant tutorial for examples.
#
# https://sphinxcontrib-spelling.readthedocs.io/en/stable/customize.html#word-filters
#
# spelling_filters = []


# -- Options for LaTeX output ------------------------------------------------
#
# http://www.sphinx-doc.org/en/3.x/latex.html
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#options-for-latex-output
#
# https://www.sphinx-doc.org/en/master/latex.html
# https://blog.michael.franzl.name/2014/12/10/xelatex-unicode-font-fallback-unsupported-characters/
# https://tex.stackexchange.com/questions/344100/
# https://tex.stackexchange.com/questions/323575/

# TODO: evaluate possible admonitionbox override, see:
#       http://stackoverflow.com/a/13661732
# Left aligne captions: http://tex.stackexchange.com/questions/136688/how-to-align-caption-with-table

latex_title = u'{title}\\\\{subtitle}'.format(
    title = title,
    subtitle = subtitle,
)

latex_author = u'{publisher}\\\\{author}'.format(
    publisher = publisher,
    author = author,
)

latex_releasename = u'Document Number: \sphinxstylestrong{{{docnumb}}}\\\\ Revision:'.format(
    docnumb = docnumb,
)

f = open('{}/extrapackages.tex'.format(path_templates), 'r+')
latex_custom_extrapackages = f.read()

f = open('{}/passoptstopackages.tex.in'.format(path_templates), 'r+')
latex_custom_passoptionstopackages = f.read().format (
    producer = 'Sphinx ' + build_sphinx,
    creator = 'Sphinx ' + build_sphinx,
    publisher = publisher,
    subject = about + ' Release: ' + release + ' (' + identify + ')',
    keywords = keywords,
)

f = open('{}/preamble.tex.in'.format(path_templates), 'r+')
latex_custom_preamble = f.read().format (
    docnumb = docnumb,
    identify = identify,
    publisher = publisher,
    contactaddr = contactaddr,
    contactemail = contactemail,
)

if on_windows:
    latex_custom_fontpkg = ''
else:
    f = open('{}/fontpkg.tex.in'.format(path_templates), 'r+')
    latex_custom_fontpkg = f.read().format (
        dejavu = path_dejavu + '/',
        wenquanyi = path_wenquanyi + '/',
    )

f = open('{}/utf8extra.tex'.format(path_templates), 'r+')
latex_custom_utf8extra = f.read()

# The LaTeX engine to build the docs. The setting can have the
# following values:
#   'pdflatex' – PDFLaTeX (default, limited Unicode characters support)
#   'xelatex' – XeLaTeX
#   'lualatex' – LuaLaTeX
#   'platex' – pLaTeX (default if language is 'ja')
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-latex_engine
#
latex_engine = 'xelatex'

# A dictionary that contains LaTeX snippets overriding those Sphinx
# usually puts into the generated .tex files.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-latex_elements
# http://www.sphinx-doc.org/en/3.x/latex.html#latex-elements-confval
# http://www.sphinx-doc.org/en/3.x/latex.html
#
latex_elements = {
    #
    # Keys that you may want to override include:
    #
    'extraclassoptions': 'table',

    # Paper size option of the document class ('letterpaper' or 'a4paper'),
    # default 'letterpaper'.
    'papersize': 'a4paper',

    # Point size option of the document class ('10pt', '11pt' or '12pt'),
    # default '10pt'.
    'pointsize': '10pt',

    # "babel" package inclusion, default r'\usepackage{babel}'.
    'babel': r'\usepackage[english]{babel}',

    # "geometry" package inclusion, default r'\usepackage{geometry}'.
    # note: 'total={w,h}' depends hard on 'a4paper', see above.
    'geometry': r'\usepackage[total={170mm,257mm},left=25mm,right=15mm,top=20mm,headsep=10mm]{geometry}',
#   'geometry': r'\usepackage[headsep=1.0cm,left=2.5cm,right=1.5cm]{geometry}',

    # Font package inclusion, default r'\usepackage{times}' (which uses Times
    # and Helvetica). You can set this to '' to use the Computer Modern fonts.
    # Defaults to '' when the language uses the Cyrillic script.
    # For xelatex it defaults to: '''\setmainfont{FreeSerif}[..]
    # \setsansfont{FreeSans}[..]\setmonofont{FreeMono}[..]'''
    'fontpkg': latex_custom_fontpkg,

    # Inclusion of the "fncychap" package (which makes fancy chapter titles),
    # default r'\usepackage[Bjarne]{fncychap}' for English documentation,
    # r'\usepackage[Sonny]{fncychap}' for internationalized docs (because the
    # "Bjarne" style uses numbers spelled out in English). Other "fncychap"
    # styles you can try include "Lenny", "Glenn", "Conny" and "Rejne". You can
    # also set this to '' to disable fncychap.
#   'fncychap': r'\usepackage[Sonny]{fncychap}',
#   'fncychap': r'\usepackage[Lenny]{fncychap}',
#   'fncychap': r'\usepackage[Glenn]{fncychap}',
#   'fncychap': r'\usepackage[Conny]{fncychap}',
#   'fncychap': r'\usepackage[Rejne]{fncychap}',
#   'fncychap': r'\usepackage[Bjarne]{fncychap}',
    'fncychap': r'\usepackage[Bjornstrup]{fncychap}',

    # Additional package inclusion, default empty.
    'extrapackages': latex_custom_extrapackages,

    # "PassOptionsToPackage" call, default empty.
    'passoptionstopackages': latex_custom_passoptionstopackages,

    # Additional preamble content, default empty.
    'preamble': latex_custom_preamble,

    # Latex figure (float) alignment, default 'htbp' (here, top, bottom, page).
    # Whenever an image doesn't fit into the current page, it will be 'floated'
    # into the next page but may be preceded by any other text. If you don't
    # like this behavior, use 'H' which will disable floating and position
    # figures strictly in the order they appear in the source.
    'figure_align': 'H',

    # Latex number figure format, default empty.
#   'numfig_format': '',

    #
    # Keys that don’t need be overridden unless in special cases are:
    #

    # "inputenc" package inclusion, defaults to r'\usepackage[utf8]{inputenc}'
    # when using pdflatex. Otherwise unset.
#   'inputenc': r'\usepackage[utf8]{inputenc}',

    # Unicode character declaration, for xelatex defaults to:
    # \catcode`^^^^00a0\active\protected\def^^^^00a0{\leavevmode\nobreak\ }
    'utf8extra': latex_custom_utf8extra,

    # "cmap" package inclusion, default r'\usepackage{cmap}'.
#   'cmappkg': r'\usepackage{cmap}',

    # "fontenc" package inclusion, default r'\usepackage[T1]{fontenc}' and
    # r'\usepackage{fontspec}\defaultfontfeatures[\rmfamily,\sffamily,\ttfamily]{}'
    # in case of xelatex for non-mandarin languages.
#   'fontenc': r'\usepackage[T1]{fontenc}',

    # "amsmath" package inclusion, default r'\usepackage{amsmath,amssymb,amstext}'.
#   'amsmath': r'\usepackage{amsmath,amssymb,amstext}',

    # Value that prefixes 'release' element on title page, default 'Release'.
    'releasename': latex_releasename,

    # "makeindex" call, default r'\makeindex'. Override if you want to
    # generate a differently-styled index page.
#   'makeindex': r'\makeindex',

    # "maketitle" call, default r'\sphinxmaketitle'. Override if you want to
    # generate a differently-styled title page.
#   'maketitle': r'\sphinxmaketitle',

    # "tableofcontents" call, default r'\sphinxtableofcontents'. Override if
    # you want to generate a different table of contents or put content between
    # the title page and the TOC.
#   'tableofcontents': r'\sphinxtableofcontents',

    # "printindex" call, the last thing in the file, default r'\printindex'.
    # Override if you want to generate the index differently or append some
    # content after the index.
    'printindex': r'\footnotesize\raggedright\printindex',

    # Commands used to display transitions, default r'\n\n\bigskip\hrule{}\bigskip\n\n'.
    # Override if you want to display transitions differently.
#   'transition': r'\n\n\bigskip\hrule{}\bigskip\n\n',

    #
    # Keys that are set by other options and therefore should not be
    # overridden are: 'docclass' 'classoptions' 'extraclassoptions'
    #                 'contentsname' 'title' 'date' 'release'
    #                 'author' 'logo' 'makeindex' 'shorthandoff'
    #                 'tocdepth' 'pageautorefname'
    #

    # Get rid of evenly numbered empty pages (default book style)
#   'classoptions': ',openany,oneside',
    'classoptions': ',twoside',
}

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-latex_documents
#
latex_documents = [
    (master_doc, basename + '.tex', latex_title, latex_author, 'manual'),
]
latex_docclass = {'manual': 'book'}

# The name of an image file (relative to this directory) to place at the top of
# the title page.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-latex_logo
#
#latex_logo = None
latex_logo = '{}/alpha-board-logo.pdf'.format(path_images)
#latex_logo = '{}/alpha-board-logo-white.svg'.format(path_images)

# If true, show page references after internal links. Default: False.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-latex_show_pagerefs
#
latex_show_pagerefs = True


# -- Options for HTML output -------------------------------------------------
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#options-for-html-output
#

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_theme
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_theme_path
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_theme_options
#
html_theme = 'sphinx_rtd_theme'

# A dictionary of values to pass into the template engine’s context for all
# pages. Single values can also be put in this dictionary using the -A
# command-line option of sphinx-build.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_context
#
html_context = {
    'document_title': title,
    'document_subtitle': subtitle,
    'document_number': docnumb,
    'document_revision': release,
    'document_vcs': identify,
}

#
# https://sphinx-rtd-theme.readthedocs.io/en/0.5.0/configuring.html
#
html_theme_options = {
    'display_version': True,
    'style_external_links': True,
}

# The name for this set of Sphinx documents.  If None, it defaults to
# "<project> v<release> documentation".
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_title
#
html_title = u'{subtitle} {title}'.format(
    subtitle = subtitle,
    title = title,
)

# This value determines the text for the permalink; it defaults to "¶".
# Set it to None or the empty string to disable permalinks.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_add_permalinks
#
#html_add_permalinks = ""

# A shorter title for the navigation bar.  Default is the same as html_title.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_short_title
#
#html_short_title = None

# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_logo
#
#html_logo = '{}/alpha-board-logo-transparent.svg'.format(path_images)
html_logo = '{}/alpha-board-logo-white.svg'.format(path_images)

# The name of an image file (within the static path) to use as favicon of the
# docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
#
# http://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_favicon
#
html_favicon = '{}/alpha-board-favicon.ico'.format(path_images)

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
#
# https://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_static_path
#
html_static_path = ['{}'.format(path_static)]

# A list of CSS files. The entry must be a filename string or a tuple
# containing the filename string and the attributes dictionary. The
# filename must be relative to the html_static_path, or a full URI
# with scheme. The attributes is used for attributes of <link> tag.
# It defaults to an empty list.
#
# https://www.sphinx-doc.org/en/3.x/usage/configuration.html#confval-html_css_files
#
html_css_files = [
    'css/tweaks-sphinx_rtd_theme.css',
]
