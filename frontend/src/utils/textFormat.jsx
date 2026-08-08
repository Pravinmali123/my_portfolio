// Turns *word* or **word** typed in the admin panel into bold text
// wherever a description is displayed on the public site (project card's
// short description, and the full description in the details modal).
//
// Usage in JSX:  <p>{renderFormattedText(project.description)}</p>
const renderFormattedText = (text) => {
  if (!text) return null;

  // Split on **double** first, then single *asterisk* pairs, keeping the
  // delimiters so we know which chunks to bold. Non-greedy so
  // "*a* text *b*" produces two separate bold spans, not one big one.
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    return part;
  });
};

export default renderFormattedText;