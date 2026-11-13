import DOMPurify from 'dompurify'
import { stringify } from 'yaml'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('yaml', yaml)

// Returns a value as syntax-highlighted YAML HTML, sanitized because it holds user data and is rendered with v-html
export function highlightYaml (value) {
  return DOMPurify.sanitize(hljs.highlight(stringify(value), { language: 'yaml' }).value)
}
