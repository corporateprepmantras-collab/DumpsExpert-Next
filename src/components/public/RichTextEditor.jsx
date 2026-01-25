import { useEffect, useRef, useState } from "react";

const RichTextEditor = ({ value, onChange, error = "", label = "Editor" }) => {
  const editorRef = useRef(null);
  const savedSelection = useRef(null);
  const fileInputRef = useRef(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [showTableModal, setShowTableModal] = useState(false);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  /* ------------------ TOOLBAR CONFIG ------------------ */
  const toolbarButtons = [
    { format: "bold", icon: "B", title: "Bold" },
    { format: "italic", icon: "I", title: "Italic" },
    { format: "underline", icon: "U", title: "Underline" },
    { format: "strikeThrough", icon: "S", title: "Strikethrough" },
    { separator: true },
    { format: "insertOrderedList", icon: "1.", title: "Ordered List" },
    { format: "insertUnorderedList", icon: "•", title: "Bullet List" },
    { separator: true },
    { format: "link", icon: "🔗", title: "Insert Link" },
    { format: "table", icon: "📊", title: "Insert Table" },
    { format: "image", icon: "🖼", title: "Insert Image" },
  ];

  /* ------------------ LOAD INITIAL VALUE ------------------ */
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  /* ------------------ SELECTION ------------------ */
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  };

  /* ------------------ FORMAT HANDLER ------------------ */
  const handleFormat = (format, value = null) => {
    if (format === "link") {
      const sel = window.getSelection();
      if (sel && sel.toString().trim()) {
        setLinkText(sel.toString());
        saveSelection();
        setShowLinkInput(true);
      } else {
        alert("Select text first");
      }
      return;
    }

    if (format === "table") {
      saveSelection();
      setShowTableModal(true);
      return;
    }

    if (format === "image") {
      saveSelection();
      fileInputRef.current.click();
      return;
    }

    document.execCommand(format, false, value);
    onChange(editorRef.current.innerHTML);
  };

  /* ------------------ INSERT LINK ------------------ */
  const handleAddLink = () => {
    if (!linkUrl) return alert("Enter URL");

    restoreSelection();
    editorRef.current.focus();

    const finalUrl = /^https?:\/\//i.test(linkUrl)
      ? linkUrl
      : "https://" + linkUrl;

    document.execCommand(
      "insertHTML",
      false,
      `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">
        ${linkText}
      </a>`,
    );

    onChange(editorRef.current.innerHTML);
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
  };

  /* ------------------ INSERT TABLE ------------------ */
  const insertTable = () => {
    restoreSelection();
    editorRef.current.focus();

    let html = `
<div style="overflow-x:auto;">
  <table style="
    width:100%;
    max-width:100%;
    table-layout:fixed;
    border-collapse:collapse;
    margin:12px 0;
  ">
`;

    for (let i = 0; i < rows; i++) {
      html += "<tr>";
      for (let j = 0; j < cols; j++) {
        html += `<td style="border:1px solid #ccc;padding:8px;">Cell</td>`;
      }
      html += "</tr>";
    }

    html += "</table><p></p>";

    document.execCommand("insertHTML", false, html);
    onChange(editorRef.current.innerHTML);
    setShowTableModal(false);
  };

  /* ------------------ IMAGE UPLOAD ------------------ */
  const handleImageUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      editorRef.current.focus();

      document.execCommand(
        "insertHTML",
        false,
        `
        <figure contenteditable="false" style="margin:16px auto;text-align:center;">
          <img src="${reader.result}" style="max-width:100%;border-radius:8px;" />
          <figcaption contenteditable="true" style="font-size:12px;color:#666;">
            Image caption
          </figcaption>
        </figure>
        <p></p>
        `,
      );

      onChange(editorRef.current.innerHTML);
    };

    reader.readAsDataURL(file);
  };

  /* ------------------ PASTE SUPPORT ------------------ */
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.includes("image")) {
        e.preventDefault();
        handleImageUpload(item.getAsFile());
      }
    }
  };

  /* ------------------ INPUT CHANGE ------------------ */
  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  /* ================================================= */
  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">{label}</label>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 border rounded-t bg-gray-100 p-2 flex flex-wrap gap-1 shadow-sm">
        <select
          className="border p-1 text-sm"
          onChange={(e) =>
            document.execCommand("formatBlock", false, `h${e.target.value}`)
          }
        >
          <option value="">Paragraph</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        {toolbarButtons.map((btn, i) =>
          btn.separator ? (
            <div key={i} className="w-px bg-gray-300 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              title={btn.title}
              className="px-2 py-1 border rounded hover:bg-gray-200"
              onClick={() => handleFormat(btn.format)}
            >
              {btn.icon}
            </button>
          ),
        )}

        <input
          type="color"
          onChange={(e) => handleFormat("foreColor", e.target.value)}
        />
        <input
          type="color"
          onChange={(e) => handleFormat("backColor", e.target.value)}
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="
    border border-t-0 rounded-b p-4 min-h-[200px]
    focus:outline-none focus:ring-2 focus:ring-blue-500
    overflow-x-auto
    break-words
    max-w-full

    [&_table]:w-full
    [&_table]:table-fixed
    [&_td]:break-words
    [&_th]:break-words

    [&_img]:max-w-full
    [&_img]:h-auto

    [&_figure]:max-w-full
    [&_figure]:overflow-hidden
    [&_figure]:mx-auto
  "
      />

      {/* Hidden image input */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e.target.files[0])}
      />

      {/* Link Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-96">
            <input
              className="border p-2 w-full mb-2"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-3"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkInput(false)}>Cancel</button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={handleAddLink}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-80">
            <h3 className="mb-3 font-semibold">Insert Table</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                min="1"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
              />
              <input
                type="number"
                min="1"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTableModal(false)}>Cancel</button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={insertTable}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
