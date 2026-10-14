"use client";

import { useEffect, useId, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Font,
  Link,
  List,
  TodoList,
  Indent,
  IndentBlock,
  Alignment,
  RemoveFormat,
  SourceEditing,
  PasteFromOffice,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageResize,
  ImageInsert,
  LinkImage,
  SimpleUploadAdapter,
  MediaEmbed,
  HtmlEmbed,
  GeneralHtmlSupport,
} from "ckeditor5";
import esTranslations from "ckeditor5/translations/es.js";

import "ckeditor5/ckeditor5.css";

function leerBorrador(key?: string): string | null {
  if (!key || typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function RichTextEditor({
  name,
  label,
  defaultValue,
  hint,
  storageKey,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  storageKey?: string;
}) {
  const [inicial] = useState(() => leerBorrador(storageKey) ?? defaultValue ?? "");
  const [html, setHtml] = useState(inicial);
  const id = useId();

  useEffect(() => {
    return () => {
      if (storageKey) {
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {}
      }
    };
  }, [storageKey]);

  return (
    <div className="col-span-4">
      <label htmlFor={id} className="block mb-1.5 text-sm font-semibold text-[var(--color-ink)]">
        {label}
        {hint && <span className="ml-1.5 font-normal text-[var(--color-ink-soft)]">{hint}</span>}
      </label>

      <input type="hidden" name={name} value={html} />

      <div
        id={id}
        className="editor-nota rounded-md overflow-hidden border-2"
        style={{ borderColor: "var(--color-input-border)" }}
      >
        <CKEditor
          editor={ClassicEditor}
          data={inicial}
          config={{
            licenseKey: "GPL",
            language: "es",
            translations: [esTranslations],
            plugins: [
              Essentials,
              Paragraph,
              Heading,
              Bold,
              Italic,
              Underline,
              Strikethrough,
              Font,
              Link,
              List,
              TodoList,
              Indent,
              IndentBlock,
              Alignment,
              RemoveFormat,
              SourceEditing,
              PasteFromOffice,
              HorizontalLine,
              Image,
              ImageCaption,
              ImageStyle,
              ImageToolbar,
              ImageResize,
              ImageInsert,
              LinkImage,
              SimpleUploadAdapter,
              MediaEmbed,
              HtmlEmbed,
              GeneralHtmlSupport,
            ],
            toolbar: {
              shouldNotGroupWhenFull: true,
              items: [
                "heading",
                "|",
                "fontFamily",
                "fontSize",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "removeFormat",
                "|",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "alignment",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "|",
                "outdent",
                "indent",
                "|",
                "horizontalLine",
                "link",
                "insertImage",
                "mediaEmbed",
                "htmlEmbed",
                "|",
                "sourceEditing",
              ],
            },
            simpleUpload: {
              uploadUrl: "/api/upload-image",
            },
            image: {
              toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "|",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "|",
                "resizeImage",
                "|",
                "linkImage",
              ],
              resizeUnit: "%",
              resizeOptions: [
                { name: "resizeImage:original", value: null, label: "Original" },
                { name: "resizeImage:25", value: "25", label: "25%" },
                { name: "resizeImage:50", value: "50", label: "50%" },
                { name: "resizeImage:75", value: "75", label: "75%" },
              ],
            },
            mediaEmbed: {
              previewsInData: true,
            },
            htmlEmbed: { showPreviews: false },
            htmlSupport: {
              allow: [{ name: /^.*$/, styles: true, attributes: true, classes: true }],
            },
          }}
          onChange={(_event, editor) => {
            const data = editor.getData();
            setHtml(data);
            if (storageKey) {
              try {
                window.sessionStorage.setItem(storageKey, data);
              } catch {}
            }
          }}
        />
      </div>
    </div>
  );
}