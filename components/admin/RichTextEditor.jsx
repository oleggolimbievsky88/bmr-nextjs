"use client";

import { useEffect, useId, useRef } from "react";
import "quill/dist/quill.snow.css";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const lastHtmlRef = useRef(value || "");
  const onChangeRef = useRef(onChange);
  const id = useId().replace(/:/g, "");
  const toolbarId = `admin-richtext-toolbar-${id}`;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      const { default: Quill } = await import("quill");
      if (!active || !editorRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: `#${toolbarId}`,
        },
      });
      quillRef.current = quill;
      quill.root.setAttribute("dir", "ltr");
      quill.root.style.textAlign = "left";

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
        lastHtmlRef.current = value;
      }

      quill.on("text-change", () => {
        if (!quillRef.current) return;
        const html = quill.root.innerHTML || "";
        lastHtmlRef.current = html;
        onChangeRef.current?.(html);
      });
    };

    boot();

    return () => {
      active = false;
      quillRef.current = null;
    };
  }, [placeholder, toolbarId]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const next = value || "";
    if (next === lastHtmlRef.current) return;
    // Avoid clobbering cursor/selection while user is actively typing.
    if (document.activeElement && quill.root.contains(document.activeElement)) {
      return;
    }
    const sel = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(next);
    if (sel) quill.setSelection(sel.index, sel.length, "silent");
    lastHtmlRef.current = next;
  }, [value]);

  return (
    <div className="admin-richtext">
      <div id={toolbarId}>
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="">Normal</option>
          </select>
          <select className="ql-font" />
          <select className="ql-size" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
          <button type="button" className="ql-underline" />
          <button type="button" className="ql-strike" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-script" value="sub" />
          <button type="button" className="ql-script" value="super" />
          <select className="ql-align" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-list" value="ordered" />
          <button type="button" className="ql-list" value="bullet" />
          <button type="button" className="ql-indent" value="-1" />
          <button type="button" className="ql-indent" value="+1" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-blockquote" />
          <button type="button" className="ql-code-block" />
          <button type="button" className="ql-link" />
          <button type="button" className="ql-clean" />
        </span>
      </div>
      <div ref={editorRef} aria-label={ariaLabel} />
    </div>
  );
}
