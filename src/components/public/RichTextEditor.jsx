import { useEffect, useRef, useState } from "react";

const RichTextEditor = ({
  value,
  onChange,
  error = "",
  label = "Editor",
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const editorRef = useRef(null);
  const savedSelection = useRef(null);

  // Toolbar buttons configuration
  const toolbarButtons = [
    { format: "bold", icon: "B", title: "Bold" },
    { format: "italic", icon: "I", title: "Italic" },
    { format: "underline", icon: "U", title: "Underline" },
    { format: "strikeThrough", icon: "S", title: "Strikethrough" },
    { separator: true },
    { format: "formatBlock", value: "blockquote", icon: "❝", title: "Blockquote" },
    { format: "formatBlock", value: "pre", icon: "</>", title: "Code Block" },
    { separator: true },
    { format: "link", icon: "🔗", title: "Insert Link" },
    { separator: true },
    { format: "insertOrderedList", icon: "1.", title: "Ordered List" },
    { format: "insertUnorderedList", icon: "•", title: "Bullet List" },
    { separator: true },
    { format: "justifyLeft", icon: "≡", title: "Align Left" },
    { format: "justifyCenter", icon: "≡", title: "Align Center" },
    { format: "justifyRight", icon: "≡", title: "Align Right" },
    { format: "justifyFull", icon: "≡", title: "Justify" },
  ];

  // Load initial value into editor
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Save selection for link insertion
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0);
    }
  };

  // Restore selection
  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedSelection.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
    }
  };

  // Handle format changes
  const handleFormat = (format, value = null) => {
    if (format === "link") {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== "") {
        setLinkText(selection.toString());
        saveSelection();
        setShowLinkInput(true);
      } else {
        alert("Please select some text to create a hyperlink");
      }
      return;
    }

    if (format === "heading") {
      document.execCommand("formatBlock", false, `<h${value}>`);
      onChange(editorRef.current.innerHTML);
      return;
    }

    document.execCommand(format, false, value);
    onChange(editorRef.current.innerHTML);
  };

  // Handle link insertion with proper attributes
  const handleAddLink = () => {
    if (!linkUrl) {
      alert("Please enter a URL");
      return;
    }

    // Ensure URL has protocol
    let finalUrl = linkUrl;
    if (!/^https?:\/\//i.test(linkUrl)) {
      finalUrl = 'https://' + linkUrl;
    }

    // Restore the saved selection
    restoreSelection();
    editorRef.current.focus();

    // Create the link HTML with all necessary attributes
    const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${linkText}</a>`;
    
    // Insert the link
    document.execCommand('insertHTML', false, linkHtml);

    // Update parent component
    onChange(editorRef.current.innerHTML);

    // Reset state
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
    savedSelection.current = null;
  };

  // Handle editor content changes
  const handleInput = () => {
    // Ensure all links have proper attributes
    const anchors = editorRef.current.querySelectorAll("a");
    anchors.forEach((a) => {
      if (!a.getAttribute("target")) {
        a.setAttribute("target", "_blank");
      }
      if (!a.getAttribute("rel")) {
        a.setAttribute("rel", "noopener noreferrer");
      }
      if (!a.style.color) {
        a.style.color = "#2563eb";
      }
      if (!a.style.textDecoration) {
        a.style.textDecoration = "underline";
      }
    });

    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="mb-6 relative">
      <label className="block mb-2 font-medium">{label}</label>

      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-100 p-2 flex flex-wrap gap-1">
        {/* Headings dropdown */}
        <select
          className="p-1 rounded border mr-1 text-sm"
          onChange={(e) => handleFormat("heading", e.target.value)}
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {/* Format buttons */}
        {toolbarButtons.map((button, index) =>
          button.separator ? (
            <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              title={button.title}
              className="p-1 rounded min-w-[2rem] text-sm hover:bg-gray-200"
              onClick={() => handleFormat(button.format, button.value)}
            >
              {button.icon}
            </button>
          )
        )}

        {/* Color pickers */}
        <input
          type="color"
          className="w-8 h-8 p-0 border-0 cursor-pointer"
          onChange={(e) => handleFormat("foreColor", e.target.value)}
          title="Text Color"
        />
        <input
          type="color"
          className="w-8 h-8 p-0 border-0 cursor-pointer"
          onChange={(e) => handleFormat("backColor", e.target.value)}
          title="Background Color"
        />
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        className="rich-editor border border-gray-300 border-t-0 rounded-b-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 relative 
                   [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer [&_a:hover]:text-blue-800"
        contentEditable
        onInput={handleInput}
      />

      {/* Link input dialog */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="font-medium mb-4 text-lg">Insert Link</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Link Text</label>
              <input
                type="text"
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLink();
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={handleAddLink}
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RichTextEditor;