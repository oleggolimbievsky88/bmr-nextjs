import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "div",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
];

const ALLOWED_ATTRS = {
  a: ["href", "name", "target", "rel"],
  "*": ["style", "class"],
};

const ALLOWED_STYLES = {
  "*": {
    color: [/^#(0-9a-fA-F){3,8}$/, /^rgb\(/, /^rgba\(/, /^hsl\(/, /^hsla\(/],
    "background-color": [
      /^#(0-9a-fA-F){3,8}$/,
      /^rgb\(/,
      /^rgba\(/,
      /^hsl\(/,
      /^hsla\(/,
    ],
    "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/],
    "font-family": [/^[\w\s"',-]+$/],
    "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
    "text-decoration": [/^(none|underline|line-through|overline)$/],
    "text-align": [/^(left|right|center|justify)$/],
  },
};

export function sanitizeRichTextHtml(html) {
  if (!html) return "";
  return sanitizeHtml(String(html), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}
